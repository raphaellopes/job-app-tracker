/** Server action `registerUser` failure codes. */
export type AuthRegisterErrorCode =
  | "validation_failed"
  | "email_token_mismatch"
  | "email_already_exists"
  | "internal_error";

export type AuthRegisterResult = { success: true } | { error: AuthRegisterErrorCode };

const authRegisterErrorMessages: Record<AuthRegisterErrorCode, string> = {
  validation_failed: "Please check your details and try again.",
  email_token_mismatch: "The authenticated email does not match.",
  email_already_exists: "An account with this email already exists.",
  internal_error: "Something went wrong. Please try again.",
};

export function authRegisterErrorMessage(code: AuthRegisterErrorCode): string {
  return authRegisterErrorMessages[code];
}

/** Client-only flows (e.g. complete sign-up) where the server action is not involved. */
export type AuthClientErrorCode = "session_unavailable" | "session_refresh_failed";

const authClientErrorMessages: Record<AuthClientErrorCode, string> = {
  session_unavailable: "Unable to read your session. Please sign in again.",
  session_refresh_failed: "Unable to refresh your session. Please try again.",
};

export function authClientErrorMessage(code: AuthClientErrorCode): string {
  return authClientErrorMessages[code];
}
