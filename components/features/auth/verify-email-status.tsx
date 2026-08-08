"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { NoticeCard } from "@/components/features/auth/notice-card";
import { TokenPendingCard } from "@/components/features/auth/token-pending-card";
import { Button } from "@/components/ui/button";
import { Routes, VERIFY_EMAIL_TOKEN_PARAM } from "@/lib/constants";
import { useTokenVerification } from "@/lib/hooks/use-token-verification";
import { verifyEmail } from "@/lib/services/auth";

/**
 * Landing screen for the link in the verification email
 * (`/verify-email?token=…`, built by the backend's post-register service).
 */
export function VerifyEmailStatus() {
  const searchParams = useSearchParams();
  const token = searchParams.get(VERIFY_EMAIL_TOKEN_PARAM) ?? undefined;
  const { status, errorMessage } = useTokenVerification(token, verifyEmail);

  if (status === "pending") {
    return <TokenPendingCard message="Verifying your email…" />;
  }

  if (status === "invalid") {
    return (
      <NoticeCard
        tone="error"
        title="Verification failed"
        description={
          errorMessage ??
          "This verification link has expired or has already been used. Create your account again to get a fresh link."
        }
      >
        <Button render={<Link href={Routes.REGISTER} />} className="w-full">
          Back to sign up
        </Button>
        <Button render={<Link href={Routes.LOGIN} />} variant="ghost" className="w-full">
          Go to sign in
        </Button>
      </NoticeCard>
    );
  }

  return (
    <NoticeCard
      tone="success"
      title="Email verified"
      description="Your address is confirmed. You can sign in to your account now."
    >
      <Button render={<Link href={Routes.LOGIN} />} className="w-full">
        Continue to sign in
      </Button>
    </NoticeCard>
  );
}
