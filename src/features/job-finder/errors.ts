/** Matches JSON `error` from `GET /api/job-finder/search` plus client fallbacks. */
export type JobFinderErrorCode =
  | "unauthorized"
  | "invalid_search_params"
  | "missing_job_finder_env"
  | "provider_error"
  | "provider_timeout"
  | "provider_request_failed";

const JOB_FINDER_ERROR_CODES: readonly JobFinderErrorCode[] = [
  "unauthorized",
  "invalid_search_params",
  "missing_job_finder_env",
  "provider_error",
  "provider_timeout",
  "provider_request_failed",
] as const;

export function isJobFinderErrorCode(value: unknown): value is JobFinderErrorCode {
  return typeof value === "string" && JOB_FINDER_ERROR_CODES.includes(value as JobFinderErrorCode);
}

export function resolveJobFinderErrorCode(
  bodyError: unknown,
  httpStatus: number,
): JobFinderErrorCode {
  if (isJobFinderErrorCode(bodyError)) {
    return bodyError;
  }
  if (httpStatus === 401) {
    return "unauthorized";
  }
  if (httpStatus === 400) {
    return "invalid_search_params";
  }
  if (httpStatus === 504) {
    return "provider_timeout";
  }
  if (httpStatus === 500) {
    return "provider_request_failed";
  }
  return "provider_error";
}

const jobFinderErrorMessages: Record<JobFinderErrorCode, string> = {
  unauthorized: "Sign in to search for jobs.",
  invalid_search_params: "Fix your search and try again.",
  missing_job_finder_env: "Job search is not configured. Please try again later.",
  provider_error: "The job provider returned an error. Try again in a moment.",
  provider_timeout: "The search took too long. Please try again.",
  provider_request_failed: "Could not load jobs right now. Please try again.",
};

export function jobFinderErrorMessage(code: JobFinderErrorCode): string {
  return jobFinderErrorMessages[code];
}

export class JobFinderApiError extends Error {
  readonly code: JobFinderErrorCode;

  constructor(code: JobFinderErrorCode) {
    super(jobFinderErrorMessage(code));
    this.name = "JobFinderApiError";
    this.code = code;
  }
}
