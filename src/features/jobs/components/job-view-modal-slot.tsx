import JobViewModal from "@/features/jobs/components/job-view-modal";
import type { Job } from "@/features/jobs/types";
import type { JobsBoardFilters } from "@/features/jobs/types";
import { resolveJobViewState } from "@/features/jobs/utils/resolve-job-view-state";

interface JobViewModalSlotProps {
  viewParam?: string;
  candidateJobs: Job[];
  filters?: JobsBoardFilters;
}

export default async function JobViewModalSlot({
  viewParam,
  candidateJobs,
  filters,
}: JobViewModalSlotProps) {
  const { jobToView, initialInterviewPrep } = await resolveJobViewState(viewParam, candidateJobs);

  return (
    <JobViewModal job={jobToView} initialInterviewPrep={initialInterviewPrep} filters={filters} />
  );
}
