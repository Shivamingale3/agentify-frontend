import type { ReactNode } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import type { Step } from "./steps-data";

/**
 * One step's content panel. Renders on a card-surface so it stays legible on
 * mobile, where there isn't room to dodge the 3D model behind it.
 * `children` carries the finale-only embed snippet — StepCard doesn't know
 * or care that step 8 is special.
 *
 * A Server Component: none of this is interactive, so the copy ships as HTML
 * only. The headline renders as a real `<h2>` (below the hero's `<h1>`) and
 * names its parent <section> via `headingId` — eight step headlines in
 * anonymous divs gave crawlers and screen readers no outline at all.
 */
export default function StepCard({
  step,
  headingId,
  children,
}: {
  step: Step;
  headingId: string;
  children?: ReactNode;
}) {
  return (
    <Card className="max-w-md lg:max-w-sm pointer-events-auto">
      <CardHeader>
        <span className="label-eyebrow">{step.eyebrow}</span>
        <CardTitle
          as="h2"
          id={headingId}
          className="text-3xl md:text-4xl lg:text-5xl leading-[1.05]"
        >
          {step.headline}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <CardDescription className="text-sm md:text-base">
          {step.sub}
        </CardDescription>
        {children}
      </CardContent>
    </Card>
  );
}
