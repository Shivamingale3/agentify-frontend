import { RiLoader4Line } from "@remixicon/react";

import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  isSubmitting: boolean;
  label: string;
  /** Shown while the request is in flight. */
  pendingLabel: string;
}

/** Full-width submit control with the shared pending treatment. */
export function SubmitButton({
  isSubmitting,
  label,
  pendingLabel,
}: SubmitButtonProps) {
  return (
    <Button type="submit" disabled={isSubmitting} className="w-full">
      {isSubmitting ? (
        <>
          <RiLoader4Line className="size-4 animate-spin" />
          {pendingLabel}
        </>
      ) : (
        label
      )}
    </Button>
  );
}
