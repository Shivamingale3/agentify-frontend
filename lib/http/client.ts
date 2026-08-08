import { HTTP_TIMEOUT_MS } from "@/lib/constants";
import type { FieldErrors } from "@/lib/types";

export class HttpError extends Error {
  readonly status: number;
  /** Per-field messages echoed by the route handler on a validation failure. */
  readonly fieldErrors?: FieldErrors;

  constructor(message: string, status: number, fieldErrors?: FieldErrors) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

type FetcherOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  timeoutMs?: number;
};

interface ErrorBody {
  message?: string;
  fieldErrors?: FieldErrors;
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
    let fieldErrors: FieldErrors | undefined;
    if (contentType.includes("application/json")) {
      try {
        const parsed = (await response.json()) as ErrorBody;
        if (parsed?.message) message = parsed.message;
        fieldErrors = parsed?.fieldErrors;
      } catch {
        // ignore malformed body
      }
    }
    throw new HttpError(message, response.status, fieldErrors);
  }

  if (!contentType.includes("application/json")) {
    return undefined as unknown as T;
  }
  return (await response.json()) as T;
}
