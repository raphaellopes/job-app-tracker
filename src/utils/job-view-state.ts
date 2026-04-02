import type { InterviewPrepResult } from "@/actions/gemini";
import { getJobInterviewPrepByJobId } from "@/actions/jobs";
import type { Job } from "@/db/schema";

export async function resolveJobViewState(
  viewParam: string | undefined,
  candidateJobs: Job[],
): Promise<{
  jobToView: Job | undefined;
  initialInterviewPrep: InterviewPrepResult | null;
}> {
  const jobToView = viewParam
    ? candidateJobs.find((j) => j.id === Number(viewParam))
    : undefined;
  const initialInterviewPrep = jobToView
    ? await getJobInterviewPrepByJobId(jobToView.id)
    : null;
  return { jobToView, initialInterviewPrep };
}
