"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FormAlert } from "@/components/features/auth/form-alert";
import { NoticeCard } from "@/components/features/auth/notice-card";
import { PasswordField } from "@/components/features/auth/password-field";
import { SubmitButton } from "@/components/features/auth/submit-button";
import { TokenPendingCard } from "@/components/features/auth/token-pending-card";
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
import { useTokenVerification } from "@/lib/hooks/use-token-verification";
import { resetPassword, verifyResetToken } from "@/lib/services/auth";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import {
  resetPasswordFormSchema,
  type ResetPasswordFormValues,
} from "@/lib/validations/auth";

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const { status, errorMessage } = useTokenVerification(
    token,
    verifyResetToken,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isReset, setIsReset] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setFormError(null);
    const result = await resetPassword({
      token,
      newPassword: values.newPassword,
    });

    if (!result.ok) {
      setFormError(
        applyServerErrors(
          form,
          result.error,
          "Unable to reset your password. Please try again.",
        ),
      );
      return;
    }

    toast.success("Password updated", {
      description: "Sign in with your new password.",
    });
    setIsReset(true);
  };

  if (status === "pending") {
    return <TokenPendingCard message="Checking your reset link…" />;
  }

  if (status === "invalid") {
    return (
      <NoticeCard
        tone="error"
        title="Link no longer valid"
        description={
          errorMessage ??
          "This reset link has expired or has already been used. Request a new one to continue."
        }
      >
        <Link
          href={Routes.FORGOT_PASSWORD}
          className={cn(buttonVariants(), "w-full")}
        >
          Request a new link
        </Link>
        <Link
          href={Routes.LOGIN}
          className={cn(buttonVariants({ variant: "ghost" }), "w-full")}
        >
          Back to sign in
        </Link>
      </NoticeCard>
    );
  }

  if (isReset) {
    return (
      <NoticeCard
        tone="success"
        title="Password updated"
        description="Your password has been changed. You can now sign in with it."
      >
        <Link href={Routes.LOGIN} className={cn(buttonVariants(), "w-full")}>
          Continue to sign in
        </Link>
      </NoticeCard>
    );
  }

  return (
    <Card className="border-foreground/10 shadow-xl">
      <CardHeader>
        <CardTitle>Set a new password</CardTitle>
        <CardDescription>
          Choose a password you haven&rsquo;t used on this account before.
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-5">
            <PasswordField
              control={form.control}
              name="newPassword"
              label="New password"
              autoComplete="new-password"
              placeholder="Enter a new password"
              disabled={isSubmitting}
            />

            <PasswordField
              control={form.control}
              name="confirmPassword"
              label="Confirm password"
              autoComplete="new-password"
              placeholder="Re-enter your new password"
              disabled={isSubmitting}
            />

            <FormAlert message={formError} />
          </CardContent>

          <CardFooter className="flex flex-col gap-4 mt-5">
            <SubmitButton
              isSubmitting={isSubmitting}
              label="Reset password"
              pendingLabel="Resetting password…"
            />
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
