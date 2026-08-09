"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { resendVerification } from "@/lib/services/auth";
import { toast } from "@/lib/toast";

interface ResendVerificationButtonProps {
  email: string;
}

/**
 * Re-sends the activation link for an address that has not been confirmed yet.
 *
 * The backend applies its own cooldown and always answers with the same
 * neutral message whether or not the account exists, so this button can be
 * shown without leaking whether the address is registered.
 */
export function ResendVerificationButton({
  email,
}: ResendVerificationButtonProps) {
  const [isSending, setIsSending] = useState(false);

  const onResend = async () => {
    setIsSending(true);
    const result = await resendVerification({ email });
    setIsSending(false);

    if (!result.ok) {
      toast.error("Couldn't resend the link", {
        description: result.error.message,
      });
      return;
    }

    toast.success("Verification link sent", {
      description: `If ${email} still needs verifying, a fresh link is on its way.`,
    });
  };

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={onResend}
      disabled={isSending}
    >
      {isSending ? "Sending link…" : "Resend verification link"}
    </Button>
  );
}
