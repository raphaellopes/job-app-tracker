import {
  getJobs,
  updateJobNotes,
  updateJobPositions,
  updateJobStatus,
  type JobStatusType,
} from "@/actions/jobs";
import type { Job, JobsBoardFilters } from "@/features/jobs/types";

export async function fetchJobsBoard(filters: JobsBoardFilters): Promise<Job[]> {
  return getJobs(filters.search, filters.status, filters.sort);
}

export async function patchJobNotes(jobId: number, notes: string) {
  return updateJobNotes(jobId, notes);
}

export async function patchJobStatus(jobId: number, status: JobStatusType) {
  return updateJobStatus(jobId, status);
}

export async function patchJobPositions(jobIds: number[], status?: JobStatusType) {
  return updateJobPositions(jobIds, status);
}
