import { Suspense } from "react";
import Link from "next/link";

import { LoginForm } from "@/components/features/auth/login-form";
import { Routes } from "@/lib/constants";

export const metadata = {
  title: "Sign in",
  description: "Sign in to your Get Your Bot account.",
};

export default function LogIn() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="font-heading text-2xl font-semibold uppercase tracking-wider">
          Get Your Bot
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to manage your bots.
        </p>
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