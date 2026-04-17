import type { SearchResponse } from "@/components/job-finder/types";

export type JobFinderSearchFilters = {
  query: string;
  remoteOnly: boolean;
  page: number;
};

export type JobFinderSearchResult = SearchResponse;

