import { NextResponse } from "next/server";
import { z } from "zod";

import { getDbUserForSession } from "@/features/auth/server";

const searchParamsSchema = z.object({
  q: z.string().trim().min(1).max(120),
  page: z.coerce.number().int().min(1).max(100).default(1),
  remoteOnly: z.coerce.boolean().default(false),
});

type JSearchJob = {
  job_id?: string;
  job_title?: string;
  employer_name?: string;
  employer_logo?: string | null;
  job_publisher?: string;
  job_employment_type?: string;
  job_employment_types?: string[];
  job_apply_link?: string;
  job_description?: string;
  job_min_salary?: number | null;
  job_max_salary?: number | null;
  job_salary_currency?: string | null;
  job_salary_period?: string | null;
  job_is_remote?: boolean;
  employer_company_type?: string | null;
  job_naics_name?: string | null;
  job_city?: string | null;
  job_state?: string | null;
  job_country?: string | null;
  job_required_skills?: string[] | null;
  job_highlights?: {
    Qualifications?: string[];
    Responsibilities?: string[];
  } | null;
};

type JSearchResponse = {
  data?: JSearchJob[];
};

function formatSalary(job: JSearchJob): string | undefined {
  const min = job.job_min_salary;
  const max = job.job_max_salary;
  if (typeof min !== "number" && typeof max !== "number") {
    return undefined;
  }

  const currency = job.job_salary_currency ?? "USD";
  const period = job.job_salary_period ? ` / ${job.job_salary_period}` : "";
  if (typeof min === "number" && typeof max === "number") {
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}${period}`;
  }
  const value = (min ?? max) as number;
  return `${currency} ${value.toLocaleString()}${period}`;
}

function buildLocationTag(job: JSearchJob): string | undefined {
  const parts = [job.job_city, job.job_state, job.job_country]
    .map((part) => part?.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return undefined;
  }

  return parts.join(", ");
}

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

    const payload = (await response.json()) as JSearchResponse;
    const jobs = (payload.data ?? []).map((job) => {
      const employmentTypes = job.job_employment_types?.filter(Boolean) ?? [];
      const primaryEmploymentType = job.job_employment_type?.trim();
      if (primaryEmploymentType && !employmentTypes.includes(primaryEmploymentType)) {
        employmentTypes.unshift(primaryEmploymentType);
      }

      return {
        externalJobId: job.job_id ?? "",
        title: job.job_title ?? "Untitled role",
        employerName: job.employer_name ?? "Unknown company",
        employerLogo: job.employer_logo ?? null,
        jobPublisher: job.job_publisher ?? "Unknown publisher",
        employmentTypes,
        applyLink: job.job_apply_link ?? "",
        description: job.job_description ?? "",
        salary: formatSalary(job),
        isRemote: job.job_is_remote ?? false,
        employerCompanyType: job.employer_company_type ?? undefined,
        naicsName: job.job_naics_name ?? undefined,
        locationTag: buildLocationTag(job),
        requiredSkills: job.job_required_skills?.filter(Boolean) ?? [],
        highlightQualifications: job.job_highlights?.Qualifications?.filter(Boolean) ?? [],
        highlightResponsibilities: job.job_highlights?.Responsibilities?.filter(Boolean) ?? [],
      };
    });

    return NextResponse.json({
      items: jobs.filter((job) => job.externalJobId),
      pagination: {
        page,
        hasNextPage: jobs.length >= 10,
      },
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
