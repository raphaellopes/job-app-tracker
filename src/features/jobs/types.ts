import type { Job, JobStatusType } from "@/db/schema";

export type { Job, JobStatusType };

export type JobsBoardFilters = {
  search?: string;
  status?: string;
  sort?: string;
};
