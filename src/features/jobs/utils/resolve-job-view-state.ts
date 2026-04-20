import type { Job } from "@/db/schema";

import type { InterviewPrepResult } from "@/features/ai-interview-prep/types";
import { getJobInterviewPrepByJobId } from "@/features/jobs/server/actions";

export async function resolveJobViewState(
  viewParam: string | undefined,
  candidateJobs: Job[],
): Promise<{
  jobToView: Job | undefined;
  initialInterviewPrep: InterviewPrepResult | null;
}> {
  const jobToView = viewParam ? candidateJobs.find((j) => j.id === Number(viewParam)) : undefined;
  const initialInterviewPrep = jobToView ? await getJobInterviewPrepByJobId(jobToView.id) : null;
  return { jobToView, initialInterviewPrep };
}
