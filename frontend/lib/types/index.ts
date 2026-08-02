import type { ApiErrorCode } from "@/lib/enums";
import type z from "zod";
import type { envSchema } from "../validations/env";

export interface LoginRequest {
  email: string;
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

export interface ApiSuccessResult<T> {
  ok: true;
  data: T;
}

export interface ApiErrorResult {
  ok: false;
  error: ApiError;
}

export type ApiResult<T> = ApiSuccessResult<T> | ApiErrorResult;

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  fieldErrors?: Partial<Record<keyof LoginRequest, string[]>>;
}

export type Env = z.infer<typeof envSchema>;
