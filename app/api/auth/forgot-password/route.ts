import { BackendRoutes } from "@/lib/constants";
import { forwardToBackend } from "@/lib/http/backend";
import { forgotPasswordSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  return forwardToBackend({
    request,
    path: BackendRoutes.FORGOT_PASSWORD,
    schema: forgotPasswordSchema,
  });
}
