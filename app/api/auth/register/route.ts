import { BackendRoutes } from "@/lib/constants";
import { forwardToBackend } from "@/lib/http/backend";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  // No cookies are relayed: a new account stays signed out until the address
  // is confirmed through the verification email.
  return forwardToBackend({
    request,
    path: BackendRoutes.REGISTER,
    schema: registerSchema,
  });
}
