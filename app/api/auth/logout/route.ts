import { BackendRoutes } from "@/lib/constants";
import { forwardToBackend } from "@/lib/http/backend";

export async function POST(request: Request) {
  // No body: the backend reads the refresh token from the cookie forwarded by
  // `session`, revokes it, and answers with expired cookies to relay back.
  return forwardToBackend({
    request,
    path: BackendRoutes.LOGOUT,
    session: true,
  });
}
