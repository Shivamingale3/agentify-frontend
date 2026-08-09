"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FormAlert } from "@/components/features/auth/form-alert";
import { NoticeCard } from "@/components/features/auth/notice-card";
import { PasswordField } from "@/components/features/auth/password-field";
import { ResendVerificationButton } from "@/components/features/auth/resend-verification-button";
import { SubmitButton } from "@/components/features/auth/submit-button";
import { TextField } from "@/components/features/auth/text-field";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Routes } from "@/lib/constants";
import { applyServerErrors } from "@/lib/forms/server-errors";
import { register } from "@/lib/services/auth";
import { toast } from "@/lib/toast";
import type { RegisterRequest } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  registerFormSchema,
  type RegisterFormValues,
} from "@/lib/validations/auth";

/** Empty optional inputs are dropped rather than sent as `""`. */
function toRegisterRequest(values: RegisterFormValues): RegisterRequest {
  return {
    email: values.email,
    password: values.password,
    firstName: values.firstName?.trim() || undefined,
    lastName: values.lastName?.trim() || undefined,
  };
}

export function RegisterForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (values: RegisterFormValues) => {
    setFormError(null);
    const result = await register(toRegisterRequest(values));

    if (!result.ok) {
      setFormError(
        applyServerErrors(
          form,
          result.error,
          "Unable to create your account. Please try again.",
        ),
      );
      return;
    }

    toast.success("Verification email sent", {
      description: `Open the link we sent to ${values.email} to activate your account.`,
    });
    setRegisteredEmail(values.email);
  };

  if (registeredEmail) {
    return (
      <NoticeCard
        tone="sent"
        title="Check your inbox"
        description={
          <>
            We sent a verification link to{" "}
            <span className="text-foreground">{registeredEmail}</span>. Open it
            to activate your account, then sign in. The link expires in 24
            hours.
          </>
        }
      >
        <ResendVerificationButton email={registeredEmail} />
        <Link
          href={Routes.LOGIN}
          className={cn(buttonVariants({ variant: "ghost" }), "w-full")}
        >
          Back to sign in
        </Link>
      </NoticeCard>
    );
  }

  return (
    <Card className="border-foreground/10 shadow-xl">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          It takes a minute. We&rsquo;ll email you a link to verify your
          address.
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                control={form.control}
                name="firstName"
                label="First name"
                autoComplete="given-name"
                placeholder="Optional"
                disabled={isSubmitting}
              />
              <TextField
                control={form.control}
                name="lastName"
                label="Last name"
                autoComplete="family-name"
                placeholder="Optional"
                disabled={isSubmitting}
              />
            </div>

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
              autoComplete="new-password"
              placeholder="Create a password"
              disabled={isSubmitting}
            />

            <PasswordField
              control={form.control}
              name="confirmPassword"
              label="Confirm password"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              disabled={isSubmitting}
            />

            <FormAlert message={formError} />
          </CardContent>

          <CardFooter className="flex flex-col gap-4 mt-5">
            <SubmitButton
              isSubmitting={isSubmitting}
              label="Create account"
              pendingLabel="Creating account…"
            />
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
