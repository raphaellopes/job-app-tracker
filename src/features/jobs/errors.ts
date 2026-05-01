export type JobErrorCode =
  | "validation_failed"
  | "invalid_id"
  | "not_found"
  | "already_saved"
  | "invalid_status"
  | "empty_job_ids"
  | "invalid_job_ids"
  | "job_ids_not_found"
  | "invalid_notes"
  | "internal_error";

export type JobActionResult = { success: true } | { error: JobErrorCode };

const jobErrorMessages: Record<JobErrorCode, string> = {
  validation_failed: "Please check the form and try again.",
  invalid_id: "This job could not be found.",
  not_found: "We couldn't find that job.",
  already_saved: "This job is already saved in your board.",
  invalid_status: "That status is not valid.",
  empty_job_ids: "No jobs to update.",
  invalid_job_ids: "One or more job IDs are invalid.",
  job_ids_not_found: "One or more jobs could not be updated.",
  invalid_notes: "Notes could not be saved.",
  internal_error: "Something went wrong. Please try again.",
};

export function jobErrorMessage(code: JobErrorCode): string {
  return jobErrorMessages[code];
}
