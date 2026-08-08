import { NextResponse } from "next/server";
import { flattenError, type z } from "zod";

import { env } from "@/lib/config/env";
import { ApiErrorCode } from "@/lib/enums";

interface ForwardOptions<TSchema extends z.ZodType> {
  /** The incoming request from the browser. */
  request: Request;
  /** Path on the backend service, appended to `env.BACKEND_URL`. */
  path: string;
  /** Schema the request body must satisfy before anything is forwarded. */
  schema: TSchema;
  /**
   * Whether `Set-Cookie` headers from the backend are passed back to the
   * browser. Only the endpoints that establish a session opt in — register,
   * for instance, must leave the visitor signed out until they verify.
   * @default false
   */
  forwardSetCookie?: boolean;
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
  forwardSetCookie = false,
}: ForwardOptions<TSchema>): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 },
    );
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Validation failed.",
        fieldErrors: flattenError(parsed.error).fieldErrors,
        code: ApiErrorCode.VALIDATION,
      },
      { status: 422 },
    );
  }

  // Forward the client's IP / user-agent if present for audit on the backend.
  const clientIp = request.headers.get("x-forwarded-for");
  const userAgent = request.headers.get("user-agent");

  let backendResponse: Response;
  try {
    backendResponse = await fetch(`${env.BACKEND_URL}${path}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(clientIp ? { "x-forwarded-for": clientIp } : {}),
        ...(userAgent ? { "user-agent": userAgent } : {}),
      },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to reach the authentication service." },
      { status: 502 },
    );
  }

  const contentType = backendResponse.headers.get("content-type") ?? "";
  const hasJson = contentType.includes("application/json");
  const data = hasJson ? await backendResponse.json().catch(() => null) : null;

  const headers = new Headers();
  if (forwardSetCookie) {
    backendResponse.headers
      .getSetCookie()
      .forEach((cookie) => headers.append("set-cookie", cookie));
  }

  return NextResponse.json(data ?? {}, {
    status: backendResponse.status,
    headers,
  });
}
