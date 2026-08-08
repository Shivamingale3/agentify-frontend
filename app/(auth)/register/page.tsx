import Link from "next/link";

import { RegisterForm } from "@/components/features/auth/register-form";
import { Routes } from "@/lib/constants";
import Logo from "@/components/ui/logo";

export const metadata = {
  title: "Create account",
  description: "Create your Agentify account.",
};

export default function Register() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-1 text-center">
        <Logo mode="landscape" size="xl" />
      </div>

      <RegisterForm />

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
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
