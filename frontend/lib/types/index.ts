import type { ApiErrorCode } from "@/lib/enums";
import type z from "zod";
import type { envSchema } from "../validations/env";

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: AuthUser;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

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
