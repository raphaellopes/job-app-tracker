import type { JobsBoardFilters } from "@/features/jobs/types";

export const jobsKeys = {
  all: ["jobs"] as const,
  board: (filters: JobsBoardFilters) => [...jobsKeys.all, "board", filters] as const,
};
