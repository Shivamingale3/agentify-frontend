import { ApiErrorCode } from "@/lib/enums";
import { fetcher, HttpError } from "@/lib/http/client";
import type { ApiError, ApiResult } from "@/lib/types";

function toApiError(error: unknown): ApiError {
  if (error instanceof HttpError) {
    return {
      code: error.code,
      message: error.message,
      fieldErrors: error.fieldErrors,
    };
  }
  return {
    code: ApiErrorCode.UNKNOWN,
    message: error instanceof Error ? error.message : "Something went wrong.",
  };
}

/** Builds a failure result for a 200 response the caller judges unsuccessful. */
export function failure(code: ApiErrorCode, message: string): ApiResult<never> {
  return { ok: false, error: { code, message } };
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
