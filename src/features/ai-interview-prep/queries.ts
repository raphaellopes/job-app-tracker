import { useQuery } from "@tanstack/react-query";

import { fetchJobInterviewPrep } from "@/features/ai-interview-prep/api";
import { aiInterviewPrepKeys } from "@/features/ai-interview-prep/query-keys";

export function useJobInterviewPrep(jobId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: aiInterviewPrepKeys.byJobId(jobId),
    queryFn: () => fetchJobInterviewPrep(jobId),
    enabled,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}
