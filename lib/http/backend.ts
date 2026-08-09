import { NextResponse } from "next/server";
import { flattenError, type z } from "zod";

import { env } from "@/lib/config/env";
import { ApiErrorCode } from "@/lib/enums";
import type { ErrorResponse, FieldErrors } from "@/lib/types";

interface ForwardOptions<TSchema extends z.ZodType> {
  /** The incoming request from the browser. */
  request: Request;
  /** Path on the backend service, appended to `env.BACKEND_URL`. */
  path: string;
  /**
   * Schema the request body must satisfy before anything is forwarded.
   * Omit for endpoints that take no body (logout reads its token from the
   * session cookie).
   */
  schema?: TSchema;
  /**
   * Whether this call participates in the session: the browser's cookies are
   * sent upstream and the backend's `Set-Cookie` headers are relayed back.
   *
   * Needed by every endpoint that reads or writes the session — login and
   * logout, but also any authenticated call, because the backend rotates an
   * expired access token transparently and returns fresh cookies with the
   * response.
   * @default false
   */
  session?: boolean;
}

/**
 * Emits the backend's own error envelope so the browser only ever has to
 * understand one error shape, whether the failure happened here or upstream.
 */
function errorResponse(
  status: number,
  message: string,
  code: ApiErrorCode,
  path: string,
  errors?: FieldErrors,
): NextResponse {
  const body: ErrorResponse = {
    success: false,
    message,
    code,
    timestamp: new Date().toISOString(),
    path,
    ...(errors ? { errors } : {}),
  };
  return NextResponse.json(body, { status });
}

/**
 * Zod reports every failed rule per field; the backend reports one. The first
 * message is the most specific one the user needs to act on.
 */
function toFieldErrors(error: z.ZodError): FieldErrors {
  const flattened = flattenError(error).fieldErrors as Record<
    string,
    string[] | undefined
  >;
  const result: FieldErrors = {};
  for (const [field, messages] of Object.entries(flattened)) {
    if (messages?.[0]) result[field] = messages[0];
  }
  return result;
}

/**
 * Validates a JSON body, forwards it to the backend and relays the response.
 *
 * This is the single place where the browser-facing API meets the backend:
 * route handlers stay declarative (`path` + `schema`) and every endpoint gets
 * the same validation, audit headers and failure semantics for free.
 */
export async function forwardToBackend<TSchema extends z.ZodType>({
  request,
  path,
  schema,
  session = false,
}: ForwardOptions<TSchema>): Promise<NextResponse> {
  const url = new URL(request.url).pathname;
  let payload: unknown;

  if (schema) {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse(
        400,
        "Invalid request body.",
        ApiErrorCode.BAD_REQUEST,
        url,
      );
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      // 422 matches what the backend returns for the same class of failure.
      return errorResponse(
        422,
        "Validation failed",
        ApiErrorCode.VALIDATION_ERROR,
        url,
        toFieldErrors(parsed.error),
      );
    }
    payload = parsed.data;
  }

  // Forward the client's IP / user-agent if present for audit on the backend.
  const clientIp = request.headers.get("x-forwarded-for");
  const userAgent = request.headers.get("user-agent");
  const cookie = session ? request.headers.get("cookie") : null;

  let backendResponse: Response;
  try {
    backendResponse = await fetch(`${env.BACKEND_URL}${path}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(clientIp ? { "x-forwarded-for": clientIp } : {}),
        ...(userAgent ? { "user-agent": userAgent } : {}),
        ...(cookie ? { cookie } : {}),
      },
      body: JSON.stringify(payload ?? {}),
      cache: "no-store",
    });
  } catch {
    return errorResponse(
      502,
      "Unable to reach the authentication service.",
      ApiErrorCode.UNKNOWN,
      url,
    );
  }

  const contentType = backendResponse.headers.get("content-type") ?? "";
  const hasJson = contentType.includes("application/json");
  const data = hasJson ? await backendResponse.json().catch(() => null) : null;

  const headers = new Headers();
  if (session) {
    backendResponse.headers
      .getSetCookie()
      .forEach((value) => headers.append("set-cookie", value));
  }

  return NextResponse.json(data ?? {}, {
    status: backendResponse.status,
    headers,
  });
}
