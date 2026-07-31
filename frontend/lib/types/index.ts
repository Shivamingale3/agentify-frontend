import type { ApiErrorCode } from "@/lib/enums";

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

export type ServerEnv = {
  BACKEND_URL: string;
  NODE_ENV: string;
};

export type ClientEnv = {
  NEXT_PUBLIC_APP_NAME: string;
};
