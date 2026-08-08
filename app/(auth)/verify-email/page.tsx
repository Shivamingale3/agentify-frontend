import { Suspense } from "react";

import { VerifyEmailStatus } from "@/components/features/auth/verify-email-status";
import { TokenPendingCard } from "@/components/features/auth/token-pending-card";
import Logo from "@/components/ui/logo";

export const metadata = {
  title: "Verify email",
  description: "Confirm your email address to activate your account.",
};

export default function VerifyEmail() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-1 text-center">
        <Logo mode="landscape" size="xl" />
      </div>

      {/* `useSearchParams` reads the token, so the status card renders on the client. */}
      <Suspense fallback={<TokenPendingCard message="Verifying your email…" />}>
        <VerifyEmailStatus />
      </Suspense>
    </div>
  );
}
