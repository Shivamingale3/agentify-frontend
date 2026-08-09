import { HTTP_TIMEOUT_MS } from "@/lib/constants";
import { ApiErrorCode } from "@/lib/enums";
import type { ErrorResponse, FieldErrors } from "@/lib/types";

export class HttpError extends Error {
  readonly status: number;
  /** Backend error code, carried through verbatim. */
  readonly code: ApiErrorCode;
  /** Per-field messages from the backend's `errors` map. */
  readonly fieldErrors?: FieldErrors;

  constructor(
    message: string,
    status: number,
    code: ApiErrorCode,
    fieldErrors?: FieldErrors,
  ) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

type FetcherOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  timeoutMs?: number;
};

/** Last-resort mapping for responses that carry no backend `code`. */
const STATUS_TO_ERROR_CODE: Readonly<Record<number, ApiErrorCode>> = {
  400: ApiErrorCode.BAD_REQUEST,
  401: ApiErrorCode.UNAUTHORIZED,
  403: ApiErrorCode.FORBIDDEN,
  404: ApiErrorCode.RESOURCE_NOT_FOUND,
  409: ApiErrorCode.CONFLICT,
  422: ApiErrorCode.VALIDATION_ERROR,
};

function isApiErrorCode(value: unknown): value is ApiErrorCode {
  return (
    typeof value === "string" &&
    (Object.values(ApiErrorCode) as string[]).includes(value)
  );
}

function withTimeout(signal: AbortSignal | null | undefined, timeoutMs: number) {
  if (signal) return signal;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  controller.signal.addEventListener("abort", () => clearTimeout(timer));
  return controller.signal;
}

export async function fetcher<T>(url: string, options: FetcherOptions = {}): Promise<T> {
  const { body, timeoutMs = HTTP_TIMEOUT_MS, headers, signal, ...rest } = options;

  const response = await fetch(url, {
    ...rest,
    signal: withTimeout(signal, timeoutMs),
    // Session cookies are HttpOnly and set on this app's own origin; without
    // this the route handlers receive no `access_token` / `refresh_token`.
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get("content-type") ?? "";

  if (!response.ok) {
    let message = response.statusText || "Request failed.";
    let code = STATUS_TO_ERROR_CODE[response.status] ?? ApiErrorCode.UNKNOWN;
    let fieldErrors: FieldErrors | undefined;

    if (contentType.includes("application/json")) {
      try {
        const parsed = (await response.json()) as Partial<ErrorResponse>;
        if (parsed?.message) message = parsed.message;
        if (isApiErrorCode(parsed?.code)) code = parsed.code;
        fieldErrors = parsed?.errors;
      } catch {
        // ignore malformed body
      }
    }
    throw new HttpError(message, response.status, code, fieldErrors);
  }

  if (!contentType.includes("application/json")) {
    return undefined as unknown as T;
  }
  return (await response.json()) as T;
}
