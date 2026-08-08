"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FormAlert } from "@/components/features/auth/form-alert";
import { PasswordField } from "@/components/features/auth/password-field";
import { SubmitButton } from "@/components/features/auth/submit-button";
import { TextField } from "@/components/features/auth/text-field";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { DEFAULT_AUTH_REDIRECT, Routes } from "@/lib/constants";
import { applyServerErrors } from "@/lib/forms/server-errors";
import { login } from "@/lib/services/auth";
import { loginSchema, type LoginSchemaValues } from "@/lib/validations/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<LoginSchemaValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (values: LoginSchemaValues) => {
    setFormError(null);
    const result = await login(values);
    if (!result.ok) {
      setFormError(
        applyServerErrors(form, result.error, "Unable to sign in. Please try again."),
      );
      return;
    }
    const from = searchParams.get("from");
    router.push(from ?? DEFAULT_AUTH_REDIRECT);
    router.refresh();
  };

  return (
    <Card className="border-foreground/10 shadow-xl">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to your account to continue.</CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-5">
            <TextField
              control={form.control}
              name="email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              disabled={isSubmitting}
            />

            <PasswordField
              control={form.control}
              name="password"
              label="Password"
              autoComplete="current-password"
              placeholder="Enter your password"
              disabled={isSubmitting}
              action={
                <Link
                  href={Routes.FORGOT_PASSWORD}
                  className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Forgot password?
                </Link>
              }
            />

            <FormAlert message={formError} />
          </CardContent>

          <CardFooter className="flex flex-col gap-4 mt-5">
            <SubmitButton
              isSubmitting={isSubmitting}
              label="Sign in"
              pendingLabel="Signing in…"
            />
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
