import { BackendRoutes } from "@/lib/constants";
import { forwardToBackend } from "@/lib/http/backend";
import { loginSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  // Login is the only auth endpoint that establishes a session, so it is the
  // only one that relays the backend's `Set-Cookie` headers.
  return forwardToBackend({
    request,
    path: BackendRoutes.LOGIN,
    schema: loginSchema,
    forwardSetCookie: true,
  });
}
