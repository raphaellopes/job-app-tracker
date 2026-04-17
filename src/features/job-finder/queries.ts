import { useQuery } from "@tanstack/react-query";

import { fetchJobFinderResults } from "@/features/job-finder/api";
import { jobFinderKeys } from "@/features/job-finder/query-keys";
import type { JobFinderSearchFilters } from "@/features/job-finder/types";

export function useJobFinderSearch(filters: JobFinderSearchFilters, enabled: boolean) {
  return useQuery({
    queryKey: jobFinderKeys.search(filters),
    queryFn: () => fetchJobFinderResults(filters),
    enabled,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}
