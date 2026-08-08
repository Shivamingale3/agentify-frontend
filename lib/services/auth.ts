import { ApiRoutes } from "@/lib/constants";
import { postJson } from "@/lib/http/result";
import type {
  ApiResult,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
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

export function forgotPassword(
  payload: ForgotPasswordRequest,
): Promise<ApiResult<ForgotPasswordResponse>> {
  return postJson<ForgotPasswordResponse>(ApiRoutes.FORGOT_PASSWORD, payload);
}

/** Checks a reset link before the new-password form is shown. */
export function verifyResetToken(
  payload: VerifyEmailRequest,
): Promise<ApiResult<VerifyResetTokenResponse>> {
  return postJson<VerifyResetTokenResponse>(ApiRoutes.VERIFY_RESET_TOKEN, payload);
}

export function resetPassword(
  payload: ResetPasswordRequest,
): Promise<ApiResult<ResetPasswordResponse>> {
  return postJson<ResetPasswordResponse>(ApiRoutes.RESET_PASSWORD, payload);
}
