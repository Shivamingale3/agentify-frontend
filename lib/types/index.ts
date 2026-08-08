import type { ApiErrorCode } from "@/lib/enums";
import type z from "zod";
import type { envSchema } from "../validations/env";

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

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

/**
 * Envelope returned by the backend (`ApiResponse<T>`).
 * Mirrors `backend/src/lib/apiResponse.ts` + `interfaces/api.interfaces.ts`.
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type LoginResponse = ApiResponse<null>;
export type RegisterResponse = ApiResponse<null>;
export type VerifyEmailResponse = ApiResponse<null>;
export type ForgotPasswordResponse = ApiResponse<null>;
export type ResetPasswordResponse = ApiResponse<null>;
export type VerifyResetTokenResponse = ApiResponse<null>;

export interface ApiSuccessResult<T> {
  ok: true;
  data: T;
}

export interface ApiErrorResult {
  ok: false;
  error: ApiError;
}

export type ApiResult<T> = ApiSuccessResult<T> | ApiErrorResult;

/** Per-field messages keyed by form field name, as produced by Zod's `flatten()`. */
export type FieldErrors = Record<string, string[] | undefined>;

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  fieldErrors?: FieldErrors;
}

export type Env = z.infer<typeof envSchema>;
