import type { ApiErrorCode, UserRole, UserStatus } from "@/lib/enums";
import type z from "zod";
import type { envSchema } from "../validations/env";

/* -------------------------------------------------------------------------- */
/* Requests — mirror `com.botify.api.dto.request.*`                            */
/* -------------------------------------------------------------------------- */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResendVerificationRequest {
  email: string;
}

/** The backend field is `newPassword`, not `password`. */
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

/* -------------------------------------------------------------------------- */
/* Responses — mirror `com.botify.api.dto.response.*`                          */
/* -------------------------------------------------------------------------- */

/** Success envelope. Mirrors `ApiResponse<T>`; `message` is null when data-only. */
export interface ApiResponse<T> {
  success: true;
  message: string | null;
  data: T;
  timestamp: string;
}

/**
 * Error envelope. Mirrors `ErrorResponse` — note `errors` (one message per
 * field), which is NOT the same shape as Zod's `fieldErrors`.
 */
export interface ErrorResponse {
  success: false;
  message: string;
  code: ApiErrorCode;
  timestamp: string;
  path?: string;
  errors?: Record<string, string>;
}

/** Mirrors `UserResponse`. */
export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImage: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

/**
 * Mirrors `AuthResponse.withoutTokens()` — the access and refresh tokens are
 * delivered as HttpOnly cookies and are deliberately absent from the body.
 */
export interface AuthPayload {
  expiresIn: number;
  tokenType: string;
  user: User;
}

export type LoginResponse = ApiResponse<AuthPayload>;
export type RegisterResponse = ApiResponse<null>;
export type VerifyEmailResponse = ApiResponse<null>;
export type ForgotPasswordResponse = ApiResponse<null>;
export type ResendVerificationResponse = ApiResponse<null>;
export type ResetPasswordResponse = ApiResponse<null>;
export type LogoutResponse = ApiResponse<null>;
/** `validate-reset-token` answers 200 with the verdict in `data`. */
export type VerifyResetTokenResponse = ApiResponse<boolean>;

/* -------------------------------------------------------------------------- */
/* Client-side result shaping                                                  */
/* -------------------------------------------------------------------------- */

export interface ApiSuccessResult<T> {
  ok: true;
  data: T;
}

export interface ApiErrorResult {
  ok: false;
  error: ApiError;
}

export type ApiResult<T> = ApiSuccessResult<T> | ApiErrorResult;

/** One message per field, keyed by form field name — the backend's `errors`. */
export type FieldErrors = Record<string, string>;

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  fieldErrors?: FieldErrors;
}

export type Env = z.infer<typeof envSchema>;
