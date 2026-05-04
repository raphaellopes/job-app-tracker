export type InterviewPrepErrorCode =
  | "invalid_id"
  | "not_found"
  | "validation_failed"
  | "internal_error";

export type InterviewPrepActionResult = { success: true } | { error: InterviewPrepErrorCode };

const interviewPrepErrorMessages: Record<InterviewPrepErrorCode, string> = {
  invalid_id: "This job could not be found.",
  not_found: "We couldn't find that job.",
  validation_failed: "This interview prep could not be saved. Try generating it again.",
  internal_error: "Something went wrong. Please try again.",
};

export function interviewPrepErrorMessage(code: InterviewPrepErrorCode): string {
  return interviewPrepErrorMessages[code];
}
