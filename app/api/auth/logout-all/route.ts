import { BackendRoutes } from "@/lib/constants";
import { forwardToBackend } from "@/lib/http/backend";

/** Revokes every session of the signed-in user, on every device. */
export async function POST(request: Request) {
  return forwardToBackend({
    request,
    path: BackendRoutes.LOGOUT_ALL,
    session: true,
  });
}
