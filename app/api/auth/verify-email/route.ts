import { BackendRoutes } from "@/lib/constants";
import { forwardToBackend } from "@/lib/http/backend";
import { verifyEmailSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  return forwardToBackend({
    request,
    path: BackendRoutes.VERIFY_EMAIL,
    schema: verifyEmailSchema,
  });
}
