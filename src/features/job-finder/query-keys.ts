import type { JobFinderSearchFilters } from "@/features/job-finder/types";

export const jobFinderKeys = {
  all: ["job-finder"] as const,
  search: (filters: JobFinderSearchFilters) => [...jobFinderKeys.all, "search", filters] as const,
};
