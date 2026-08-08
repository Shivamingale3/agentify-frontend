import { RiLoader4Line } from "@remixicon/react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";

interface TokenPendingCardProps {
  message: string;
}

/** Shown while a link from an email is being checked against the backend. */
export function TokenPendingCard({ message }: TokenPendingCardProps) {
  return (
    <Card className="border-foreground/10 shadow-xl">
      <CardHeader className="items-start">
        <RiLoader4Line className="size-6 animate-spin text-muted-foreground" />
        <CardTitle className="mt-2">{message}</CardTitle>
      </CardHeader>
    </Card>
  );
}
