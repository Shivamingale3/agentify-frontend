import { BackendRoutes } from "@/lib/constants";
import { forwardToBackend } from "@/lib/http/backend";
import { loginSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  // Login establishes the session, so it relays the backend's `Set-Cookie`
  // headers: the access and refresh tokens are both HttpOnly cookies.
  return forwardToBackend({
    request,
    path: BackendRoutes.LOGIN,
    schema: loginSchema,
    session: true,
  });
}
