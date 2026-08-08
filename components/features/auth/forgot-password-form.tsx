"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FormAlert } from "@/components/features/auth/form-alert";
import { NoticeCard } from "@/components/features/auth/notice-card";
import { SubmitButton } from "@/components/features/auth/submit-button";
import { TextField } from "@/components/features/auth/text-field";
import { Button } from "@/components/ui/button";
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
import { forgotPassword } from "@/lib/services/auth";
import { toast } from "@/lib/toast";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/validations/auth";

export function ForgotPasswordForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const [requestedEmail, setRequestedEmail] = useState<string | null>(null);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setFormError(null);
    const result = await forgotPassword(values);

    if (!result.ok) {
      setFormError(
        applyServerErrors(
          form,
          result.error,
          "Unable to send the reset link. Please try again.",
        ),
      );
      return;
    }

    // Deliberately identical whether or not the address is registered, so the
    // response can't be used to probe for accounts.
    toast.success("Reset link sent", {
      description: `If an account exists for ${values.email}, the link is on its way.`,
    });
    setRequestedEmail(values.email);
  };

  if (requestedEmail) {
    return (
      <NoticeCard
        tone="sent"
        title="Check your inbox"
        description={
          <>
            If an account exists for{" "}
            <span className="text-foreground">{requestedEmail}</span>, we&rsquo;ve
            sent a link to reset your password. It expires in 30 minutes.
          </>
        }
      >
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            setRequestedEmail(null);
            form.reset();
          }}
        >
          Use a different email
        </Button>
        <Button render={<Link href={Routes.LOGIN} />} variant="ghost" className="w-full">
          Back to sign in
        </Button>
      </NoticeCard>
    );
  }

  return (
    <Card className="border-foreground/10 shadow-xl">
      <CardHeader>
        <CardTitle>Forgot password</CardTitle>
        <CardDescription>
          Enter your email and we&rsquo;ll send you a link to set a new password.
        </CardDescription>
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

            <FormAlert message={formError} />
          </CardContent>

          <CardFooter className="flex flex-col gap-4 mt-5">
            <SubmitButton
              isSubmitting={isSubmitting}
              label="Send reset link"
              pendingLabel="Sending link…"
            />
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
