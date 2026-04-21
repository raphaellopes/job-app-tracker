import type { InterviewPrepResult } from "@/features/ai-interview-prep/types";

export async function fetchJobInterviewPrep(jobId: number): Promise<InterviewPrepResult | null> {
  const response = await fetch(`/api/jobs/${jobId}/interview-prep`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Could not load saved interview prep.");
  }

  const payload = (await response.json()) as { data: InterviewPrepResult | null };
  return payload.data;
}
