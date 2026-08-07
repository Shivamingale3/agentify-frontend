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
 */
export default function StepCard({
  step,
  children,
}: {
  step: Step;
  children?: ReactNode;
}) {
  return (
    <Card className="max-w-md lg:max-w-sm pointer-events-auto">
      <CardHeader>
        <span className="label-eyebrow">{step.eyebrow}</span>
        <CardTitle className="text-3xl md:text-4xl lg:text-5xl leading-[1.05]">
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
