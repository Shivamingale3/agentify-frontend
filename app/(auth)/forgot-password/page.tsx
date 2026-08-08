import Link from "next/link";

import { ForgotPasswordForm } from "@/components/features/auth/forgot-password-form";
import { Routes } from "@/lib/constants";
import Logo from "@/components/ui/logo";

export const metadata = {
  title: "Forgot password",
  description: "Request a link to reset your Agentify password.",
};

export default function ForgotPassword() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-1 text-center">
        <Logo mode="landscape" size="xl" />
      </div>

      <ForgotPasswordForm />

      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link
          href={Routes.LOGIN}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
