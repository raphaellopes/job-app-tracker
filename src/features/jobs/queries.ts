import { useQuery } from "@tanstack/react-query";

import { fetchJobFinderResults } from "@/features/jobs/api";
import { jobsKeys } from "@/features/jobs/query-keys";
import type { JobFinderSearchFilters } from "@/features/jobs/types";

export function useJobFinderSearch(filters: JobFinderSearchFilters, enabled: boolean) {
  return useQuery({
    queryKey: jobsKeys.finder.search(filters),
    queryFn: () => fetchJobFinderResults(filters),
    enabled,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

