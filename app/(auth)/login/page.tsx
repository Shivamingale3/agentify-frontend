import { Suspense } from "react";
import Link from "next/link";

import { LoginForm } from "@/components/features/auth/login-form";
import { Routes } from "@/lib/constants";
import Logo from "@/components/ui/logo";

export const metadata = {
  title: "Sign in",
  description: "Sign in to your Agentify account.",
};

export default function LogIn() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-1 text-center">
        <Logo mode="landscape" size="xl" />
      </div>

      <Suspense>
        <LoginForm />
      </Suspense>

      <p className="text-center text-sm text-muted-foreground">
        Don&rsquo;t have an account?{" "}
        <Link
          href={Routes.REGISTER}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
