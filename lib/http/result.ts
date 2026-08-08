import { ApiErrorCode } from "@/lib/enums";
import { fetcher, HttpError } from "@/lib/http/client";
import type { ApiError, ApiResult } from "@/lib/types";

const STATUS_TO_ERROR_CODE: Readonly<Record<number, ApiErrorCode>> = {
  400: ApiErrorCode.VALIDATION,
  401: ApiErrorCode.UNAUTHORIZED,
  403: ApiErrorCode.UNAUTHORIZED,
  404: ApiErrorCode.NOT_FOUND,
  409: ApiErrorCode.CONFLICT,
  422: ApiErrorCode.VALIDATION,
  429: ApiErrorCode.RATE_LIMITED,
};

function toApiError(error: unknown): ApiError {
  if (error instanceof HttpError) {
    return {
      code: STATUS_TO_ERROR_CODE[error.status] ?? ApiErrorCode.UNKNOWN,
      message: error.message,
      fieldErrors: error.fieldErrors,
    };
  }
  return {
    code: ApiErrorCode.UNKNOWN,
    message: error instanceof Error ? error.message : "Something went wrong.",
  };
}

/**
 * Calls a route handler in this app and normalises the outcome into a
 * discriminated `ApiResult`, so callers branch on `result.ok` instead of
 * writing their own try/catch and status mapping.
 */
export async function postJson<TResponse>(
  url: string,
  payload?: unknown,
): Promise<ApiResult<TResponse>> {
  try {
    const data = await fetcher<TResponse>(url, {
      method: "POST",
      body: payload ?? {},
    });
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: toApiError(error) };
  }
}
