import type { JobFinderSearchFilters } from "@/features/jobs/types";

export const jobsKeys = {
  all: ["jobs"] as const,
  finder: {
    root: () => [...jobsKeys.all, "finder"] as const,
    search: (filters: JobFinderSearchFilters) =>
      [...jobsKeys.all, "finder", "search", filters] as const,
  },
};

