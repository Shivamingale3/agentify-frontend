import { ApiRoutes } from "@/lib/constants";
import { ApiErrorCode } from "@/lib/enums";
import { failure, postJson } from "@/lib/http/result";
import type {
  ApiResult,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  RegisterRequest,
  RegisterResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  VerifyResetTokenResponse,
} from "@/lib/types";

/**
 * Thin, typed wrappers over this app's route handlers. Each one owns a single
 * endpoint and nothing else: transport, status mapping and error shaping live
 * in `lib/http`, so adding an endpoint stays a one-liner.
 */

export function login(payload: LoginRequest): Promise<ApiResult<LoginResponse>> {
  return postJson<LoginResponse>(ApiRoutes.LOGIN, payload);
}

/** Revokes the current session's refresh token and clears both cookies. */
export function logout(): Promise<ApiResult<LogoutResponse>> {
  return postJson<LogoutResponse>(ApiRoutes.LOGOUT);
}

/** Revokes every refresh token of the signed-in user (all devices). */
export function logoutAll(): Promise<ApiResult<LogoutResponse>> {
  return postJson<LogoutResponse>(ApiRoutes.LOGOUT_ALL);
}

export function register(
  payload: RegisterRequest,
): Promise<ApiResult<RegisterResponse>> {
  return postJson<RegisterResponse>(ApiRoutes.REGISTER, payload);
}

export function verifyEmail(
  payload: VerifyEmailRequest,
): Promise<ApiResult<VerifyEmailResponse>> {
  return postJson<VerifyEmailResponse>(ApiRoutes.VERIFY_EMAIL, payload);
}

/** Confirms a pending email *change* — a different token type to `verifyEmail`. */
export function verifyEmailChange(
  payload: VerifyEmailRequest,
): Promise<ApiResult<VerifyEmailResponse>> {
  return postJson<VerifyEmailResponse>(ApiRoutes.VERIFY_EMAIL_CHANGE, payload);
}

export function resendVerification(
  payload: ResendVerificationRequest,
): Promise<ApiResult<ResendVerificationResponse>> {
  return postJson<ResendVerificationResponse>(
    ApiRoutes.RESEND_VERIFICATION,
    payload,
  );
}

export function forgotPassword(
  payload: ForgotPasswordRequest,
): Promise<ApiResult<ForgotPasswordResponse>> {
  return postJson<ForgotPasswordResponse>(ApiRoutes.FORGOT_PASSWORD, payload);
}

/**
 * Checks a reset link before the new-password form is shown.
 *
 * The backend answers 200 with the verdict in `data` rather than an error
 * status, so an expired token has to be turned into a failure here — otherwise
 * every token would look valid to the caller.
 */
export async function verifyResetToken(
  payload: VerifyEmailRequest,
): Promise<ApiResult<VerifyResetTokenResponse>> {
  const result = await postJson<VerifyResetTokenResponse>(
    ApiRoutes.VERIFY_RESET_TOKEN,
    payload,
  );
  if (result.ok && result.data?.data !== true) {
    return failure(
      ApiErrorCode.TOKEN_INVALID,
      "This reset link has expired or has already been used.",
    );
  }
  return result;
}

export function resetPassword(
  payload: ResetPasswordRequest,
): Promise<ApiResult<ResetPasswordResponse>> {
  return postJson<ResetPasswordResponse>(ApiRoutes.RESET_PASSWORD, payload);
}
