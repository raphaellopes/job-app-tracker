import type { JobFinderSearchResult } from "@/features/jobs/types";

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

  if (!response.ok) {
    throw new Error("Failed to load job finder results");
  }

  return (await response.json()) as JobFinderSearchResult;
}

