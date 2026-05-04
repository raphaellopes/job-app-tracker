import { JobFinderApiError, resolveJobFinderErrorCode } from "@/features/job-finder/errors";
import type { JobFinderSearchResult } from "@/features/job-finder/types";

export async function fetchJobFinderResults(params: {
  query: string;
  remoteOnly: boolean;
  page: number;
}): Promise<JobFinderSearchResult> {
  const searchParams = new URLSearchParams({
    q: params.query.trim(),
    page: String(params.page),
    remoteOnly: String(params.remoteOnly),
  });

  const response = await fetch(`/api/job-finder/search?${searchParams.toString()}`, {
    method: "GET",
  });

  const text = await response.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    if (!response.ok) {
      throw new JobFinderApiError(resolveJobFinderErrorCode(undefined, response.status));
    }
    throw new JobFinderApiError("provider_request_failed");
  }

  const body = parsed as { error?: string };

  if (!response.ok) {
    throw new JobFinderApiError(resolveJobFinderErrorCode(body.error, response.status));
  }

  return parsed as JobFinderSearchResult;
}
