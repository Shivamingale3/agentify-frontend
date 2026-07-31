export class HttpError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

type FetcherOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  timeoutMs?: number;
};

function withTimeout(signal: AbortSignal | null | undefined, timeoutMs: number) {
  if (signal) return signal;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  controller.signal.addEventListener("abort", () => clearTimeout(timer));
  return controller.signal;
}

export async function fetcher<T>(url: string, options: FetcherOptions = {}): Promise<T> {
  const { body, timeoutMs = 10_000, headers, signal, ...rest } = options;

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
    if (contentType.includes("application/json")) {
      try {
        const parsed = (await response.json()) as { message?: string };
        if (parsed?.message) message = parsed.message;
      } catch {
        // ignore malformed body
      }
    }
    throw new HttpError(message, response.status);
  }

  if (!contentType.includes("application/json")) {
    return undefined as unknown as T;
  }
  return (await response.json()) as T;
}