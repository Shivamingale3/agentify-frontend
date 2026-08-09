import { Suspense } from "react";

import { ConfirmEmailStatus } from "@/components/features/auth/confirm-email-status";
import { TokenPendingCard } from "@/components/features/auth/token-pending-card";
import Logo from "@/components/ui/logo";

export const metadata = {
  title: "Confirm email",
  description: "Confirm your new email address.",
};

export default function ConfirmEmail() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-1 text-center">
        <Logo mode="landscape" size="xl" />
      </div>

      {/* `useSearchParams` reads the token, so the status card renders on the client. */}
      <Suspense fallback={<TokenPendingCard message="Confirming your new email…" />}>
        <ConfirmEmailStatus />
      </Suspense>
    </div>
  );
}
