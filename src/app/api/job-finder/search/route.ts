import { NextResponse } from "next/server";
import { z } from "zod";

import { getDbUserForSession } from "@/features/auth/server";
import {
  mapJSearchResponseToJobFinderSearch,
  parseJSearchSearchResponseDto,
} from "@/features/job-finder/jsearch";
import { getJobFinderUserStates } from "@/features/jobs/server/job-finder-states";

const searchParamsSchema = z.object({
  q: z.string().trim().min(1).max(120),
  page: z.coerce.number().int().min(1).max(100).default(1),
  remoteOnly: z.coerce.boolean().default(false),
});

export async function GET(request: Request) {
  const { session, dbUser } = await getDbUserForSession();
  if (!session || !dbUser) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const validated = searchParamsSchema.safeParse({
    q: searchParams.get("q"),
    page: searchParams.get("page"),
    remoteOnly: searchParams.get("remoteOnly") === "true",
  });

  if (!validated.success) {
    return NextResponse.json({ error: "invalid_search_params" }, { status: 400 });
  }

  const rapidApiKey = process.env.RAPIDAPI_KEY;
  const jsearchHost = process.env.JSEARCH_HOST;

  if (!rapidApiKey || !jsearchHost) {
    return NextResponse.json({ error: "missing_job_finder_env" }, { status: 500 });
  }

  const { q, page, remoteOnly } = validated.data;
  const endpoint = new URL(`https://${jsearchHost}/search`);
  endpoint.searchParams.set("query", q);
  endpoint.searchParams.set("page", String(page));
  endpoint.searchParams.set("num_pages", "1");
  endpoint.searchParams.set("work_from_home", remoteOnly ? "true" : "false");

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), 12000);

  try {
    const response = await fetch(endpoint.toString(), {
      method: "GET",
      headers: {
        "x-rapidapi-key": rapidApiKey,
        "x-rapidapi-host": jsearchHost,
      },
      cache: "no-store",
      signal: abortController.signal,
    });

    if (!response.ok) {
      return NextResponse.json({ error: "provider_error" }, { status: response.status });
    }

    const raw: unknown = await response.json();
    const parsed = parseJSearchSearchResponseDto(raw);
    if (!parsed.success) {
      console.error("JSearch response validation failed:", parsed.error.flatten());
      return NextResponse.json({ error: "provider_error" }, { status: 502 });
    }

    const payload = mapJSearchResponseToJobFinderSearch(parsed.data, page);

    const externalJobIds = payload.items.map((item) => item.externalJobId);
    const userStates = await getJobFinderUserStates(dbUser.id, externalJobIds);

    const enrichedItems = payload.items.map((item) => ({
      ...item,
      userState: userStates.get(item.externalJobId) ?? ("none" as const),
    }));

    return NextResponse.json({
      ...payload,
      items: enrichedItems,
    });
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      return NextResponse.json({ error: "provider_timeout" }, { status: 504 });
    }
    return NextResponse.json({ error: "provider_request_failed" }, { status: 500 });
  } finally {
    clearTimeout(timeoutId);
  }
}
