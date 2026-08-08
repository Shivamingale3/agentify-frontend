import { BackendRoutes } from "@/lib/constants";
import { forwardToBackend } from "@/lib/http/backend";
import { verifyEmailSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  // Checks a reset link is still valid before the new-password form is shown,
  // so an expired link fails before the user types anything.
  return forwardToBackend({
    request,
    path: BackendRoutes.VERIFY_RESET_TOKEN,
    schema: verifyEmailSchema,
  });
}
