import type { Job, JobStatusType } from "@/db/schema";

export type { Job, JobStatusType };

export type JobsBoardFilters = {
  search?: string;
  status?: string;
  sort?: string;
};

export type DashboardStats = {
  statusDistribution: Array<{ status: string; count: number }>;
  pipelineTotal: number;
  offerCount: number;
  interviewingCount: number;
  totalJobs: number;
};
