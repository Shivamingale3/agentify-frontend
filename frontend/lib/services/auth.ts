import { ApiRoutes } from "@/lib/constants";
import { ApiErrorCode } from "@/lib/enums";
import { fetcher, HttpError } from "@/lib/http/client";
import type { ApiResult, LoginRequest, LoginResponse } from "@/lib/types";

export async function login(payload: LoginRequest): Promise<ApiResult<LoginResponse>> {
  try {
    const data = await fetcher<LoginResponse>(ApiRoutes.LOGIN, {
      method: "POST",
      body: payload,
    });
    return { ok: true, data };
  } catch (error) {
    if (error instanceof HttpError) {
      const code =
        error.status === 401
          ? ApiErrorCode.UNAUTHORIZED
          : error.status === 422
            ? ApiErrorCode.VALIDATION
            : error.status === 429
              ? ApiErrorCode.RATE_LIMITED
              : ApiErrorCode.UNKNOWN;
      return {
        ok: false,
        error: { code, message: error.message },
      };
    }
    return {
      ok: false,
      error: {
        code: ApiErrorCode.UNKNOWN,
        message: error instanceof Error ? error.message : "Something went wrong.",
      },
    };
  }
}