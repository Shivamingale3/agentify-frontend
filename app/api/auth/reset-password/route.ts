import { BackendRoutes } from "@/lib/constants";
import { forwardToBackend } from "@/lib/http/backend";
import { resetPasswordSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  return forwardToBackend({
    request,
    path: BackendRoutes.RESET_PASSWORD,
    schema: resetPasswordSchema,
  });
}
