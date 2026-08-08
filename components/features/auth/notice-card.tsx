import {
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiMailSendLine,
} from "@remixicon/react";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type NoticeTone = "success" | "error" | "sent";

const toneIcons: Record<NoticeTone, React.ComponentType<{ className?: string }>> = {
  success: RiCheckboxCircleLine,
  error: RiErrorWarningLine,
  sent: RiMailSendLine,
};

interface NoticeCardProps {
  tone: NoticeTone;
  title: string;
  description: React.ReactNode;
  /** Follow-up actions — a link back to sign in, a retry button, and so on. */
  children?: React.ReactNode;
}

/**
 * Terminal state for an auth flow: the mail was sent, the link worked, the
 * link expired. Every one of those screens is the same card with different
 * copy, so they share this shell.
 */
export function NoticeCard({ tone, title, description, children }: NoticeCardProps) {
  const Icon = toneIcons[tone];

  return (
    <Card className="border-foreground/10 shadow-xl">
      <CardHeader className="items-start">
        <Icon
          className={cn(
            "size-6",
            tone === "error" ? "text-destructive" : "text-foreground",
          )}
        />
        <CardTitle className="mt-2">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      {children ? (
        <CardFooter className="flex flex-col gap-3">{children}</CardFooter>
      ) : null}
    </Card>
  );
}
