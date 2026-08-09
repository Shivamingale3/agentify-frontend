"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { NoticeCard } from "@/components/features/auth/notice-card";
import { TokenPendingCard } from "@/components/features/auth/token-pending-card";
import { buttonVariants } from "@/components/ui/button";
import { Routes, VERIFY_EMAIL_TOKEN_PARAM } from "@/lib/constants";
import { useTokenVerification } from "@/lib/hooks/use-token-verification";
import { verifyEmailChange } from "@/lib/services/auth";
import { cn } from "@/lib/utils";

/**
 * Landing screen for the link in the email-change confirmation mail
 * (`/confirm-email?token=…`, built by the backend's email-change workflow).
 *
 * Distinct from `/verify-email`: that one activates a new account, this one
 * switches the address on an existing one, and they consume different token
 * types on the backend.
 */
export function ConfirmEmailStatus() {
  const searchParams = useSearchParams();
  const token = searchParams.get(VERIFY_EMAIL_TOKEN_PARAM) ?? undefined;
  const { status, errorMessage } = useTokenVerification(
    token,
    verifyEmailChange,
  );

  if (status === "pending") {
    return <TokenPendingCard message="Confirming your new email…" />;
  }

  if (status === "invalid") {
    return (
      <NoticeCard
        tone="error"
        title="Confirmation failed"
        description={
          errorMessage ??
          "This confirmation link has expired or has already been used. Request the email change again to get a fresh link."
        }
      >
        <Link href={Routes.LOGIN} className={cn(buttonVariants(), "w-full")}>
          Go to sign in
        </Link>
      </NoticeCard>
    );
  }

  return (
    <NoticeCard
      tone="success"
      title="Email updated"
      description="Your new address is confirmed. Use it the next time you sign in."
    >
      <Link href={Routes.LOGIN} className={cn(buttonVariants(), "w-full")}>
        Continue to sign in
      </Link>
    </NoticeCard>
  );
}
