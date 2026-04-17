"use client";

import KanbanBoard from "@/features/jobs/components/kanban-board";
import { useJobsBoard } from "@/features/jobs/queries";
import type { Job, JobsBoardFilters } from "@/features/jobs/types";

interface JobsBoardClientProps {
  initialJobs: Job[];
  filters: JobsBoardFilters;
}

export default function JobsBoardClient({ initialJobs, filters }: JobsBoardClientProps) {
  const { data } = useJobsBoard(filters, initialJobs);
  return <KanbanBoard jobs={data ?? initialJobs} filters={filters} />;
}
