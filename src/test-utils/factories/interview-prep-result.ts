import type { InterviewPrepResult } from "@/actions/gemini";

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
