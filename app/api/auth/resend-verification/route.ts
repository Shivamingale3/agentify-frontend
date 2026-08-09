import { BackendRoutes } from "@/lib/constants";
import { forwardToBackend } from "@/lib/http/backend";
import { resendVerificationSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  return forwardToBackend({
    request,
    path: BackendRoutes.RESEND_VERIFICATION,
    schema: resendVerificationSchema,
  });
}
