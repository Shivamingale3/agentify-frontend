import { BackendRoutes } from "@/lib/constants";
import { forwardToBackend } from "@/lib/http/backend";
import { verifyEmailSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  // Confirms a pending email change. The token type differs from plain email
  // verification, so it has its own backend endpoint.
  return forwardToBackend({
    request,
    path: BackendRoutes.VERIFY_EMAIL_CHANGE,
    schema: verifyEmailSchema,
  });
}
