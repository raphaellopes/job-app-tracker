"use client";

import KanbanBoard from "@/features/jobs/components/kanban-board";
import NotAFitJobsList from "@/features/jobs/components/not-a-fit-jobs-list";
import { useJobsBoard } from "@/features/jobs/queries";
import type { Job, JobsBoardFilters } from "@/features/jobs/types";

interface JobsBoardClientProps {
  initialJobs: Job[];
  filters: JobsBoardFilters;
}

export default function JobsBoardClient({ initialJobs, filters }: JobsBoardClientProps) {
  const { data } = useJobsBoard(filters, initialJobs);
  const jobs = data ?? initialJobs;

  if (filters.status === "NOT_A_FIT") {
    return <NotAFitJobsList jobs={jobs} filters={filters} />;
  }

  return <KanbanBoard jobs={jobs} filters={filters} />;
}
