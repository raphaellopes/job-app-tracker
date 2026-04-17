import { useMutation, useQueryClient } from "@tanstack/react-query";

import { patchJobNotes, patchJobPositions, patchJobStatus } from "@/features/jobs/api";
import { jobsKeys } from "@/features/jobs/query-keys";
import type { Job, JobStatusType, JobsBoardFilters } from "@/features/jobs/types";

function withBoardListPatch(
  prevList: Job[] | undefined,
  update: (list: Job[]) => Job[],
): Job[] | undefined {
  if (!prevList) {
    return prevList;
  }
  return update(prevList);
}

function reorderWithinStatus(list: Job[], jobIds: number[], status: JobStatusType): Job[] {
  const jobsById = new Map(list.map((job) => [job.id, job]));
  const updated = [...list];

  jobIds.forEach((id, index) => {
    const target = jobsById.get(id);
    if (!target) return;
    const targetIndex = updated.findIndex((job) => job.id === id);
    if (targetIndex === -1) return;
    updated[targetIndex] = { ...target, status, position: index };
  });

  return updated;
}

export function useUpdateJobNotes(filters: JobsBoardFilters) {
  const queryClient = useQueryClient();
  const queryKey = jobsKeys.board(filters);

  return useMutation({
    mutationFn: ({ jobId, notes }: { jobId: number; notes: string }) => patchJobNotes(jobId, notes),
    onMutate: async ({ jobId, notes }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Job[]>(queryKey);
      queryClient.setQueryData<Job[] | undefined>(queryKey, (current) =>
        withBoardListPatch(current, (jobs) =>
          jobs.map((job) => (job.id === jobId ? { ...job, notes } : job)),
        ),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useUpdateJobStatus(filters: JobsBoardFilters) {
  const queryClient = useQueryClient();
  const queryKey = jobsKeys.board(filters);

  return useMutation({
    mutationFn: ({ jobId, status }: { jobId: number; status: JobStatusType }) =>
      patchJobStatus(jobId, status),
    onMutate: async ({ jobId, status }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Job[]>(queryKey);
      queryClient.setQueryData<Job[] | undefined>(queryKey, (current) =>
        withBoardListPatch(current, (jobs) => {
          const nextPosition =
            jobs.filter((job) => job.status === status).reduce((maxPos, job) => {
              return Math.max(maxPos, job.position ?? 0);
            }, -1) + 1;

          return jobs.map((job) =>
            job.id === jobId ? { ...job, status, position: nextPosition } : job,
          );
        }),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useUpdateJobPositions(filters: JobsBoardFilters) {
  const queryClient = useQueryClient();
  const queryKey = jobsKeys.board(filters);

  return useMutation({
    mutationFn: ({ jobIds, status }: { jobIds: number[]; status?: JobStatusType }) =>
      patchJobPositions(jobIds, status),
    onMutate: async ({ jobIds, status }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Job[]>(queryKey);
      if (!status) {
        return { previous };
      }

      queryClient.setQueryData<Job[] | undefined>(queryKey, (current) =>
        withBoardListPatch(current, (jobs) => reorderWithinStatus(jobs, jobIds, status)),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
