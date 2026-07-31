import { NextResponse } from "next/server";

import { serverEnv } from "@/lib/config/env";
import { ApiErrorCode } from "@/lib/enums";
import { loginSchema } from "@/lib/validations/auth";

const BACKEND_LOGIN_PATH = "/auth/login"; // TODO: confirm exact backend login endpoint

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 },
    );
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Validation failed.",
        fieldErrors: parsed.error.flatten().fieldErrors,
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
    backendResponse = await fetch(`${serverEnv.BACKEND_URL}${BACKEND_LOGIN_PATH}`, {
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

  const setCookie = backendResponse.headers.getSetCookie();
  const contentType = backendResponse.headers.get("content-type") ?? "";
  const hasJson = contentType.includes("application/json");

  const data = hasJson ? await backendResponse.json().catch(() => null) : null;

  const headers = new Headers();
  if (setCookie.length > 0) {
    setCookie.forEach((cookie) => headers.append("set-cookie", cookie));
  }

  return NextResponse.json(
    data ?? {},
    { status: backendResponse.status, headers },
  );
}