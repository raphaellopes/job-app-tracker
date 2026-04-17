import { useQuery } from "@tanstack/react-query";

import { fetchJobsBoard } from "@/features/jobs/api";
import { jobsKeys } from "@/features/jobs/query-keys";
import type { Job, JobsBoardFilters } from "@/features/jobs/types";

export function useJobsBoard(
  filters: JobsBoardFilters,
  initialData?: Job[],
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: jobsKeys.board(filters),
    queryFn: () => fetchJobsBoard(filters),
    initialData,
    enabled,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}
