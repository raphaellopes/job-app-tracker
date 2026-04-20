import type { InterviewPrepResult } from "@/features/ai-interview-prep/types";

export function createMockInterviewPrepResult(
  overrides: Partial<InterviewPrepResult> = {},
): InterviewPrepResult {
  return {
    suggestedSkills: ["a"],
    mockQuestions: ["b"],
    resumeMatchScore: 50,
    tips: "c",
    ...overrides,
  };
}
