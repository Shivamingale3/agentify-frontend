"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Step } from "./steps-data";
import { useStepScroll } from "./use-step-scroll";
import Hero from "./hero";
import StepCard from "./step-card";
import EmbedSnippet from "./embed-snippet";

/**
 * One full-viewport step. Single responsibility: lay out this step's content
 * (hero + card, positioned to alternate sides) and apply the motion values
 * use-step-scroll computes — it doesn't compute any scroll math itself.
 */
export default function StepSection({
  step,
  isFinale,
}: {
  step: Step;
  isFinale: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { y, cardOpacity, heroOpacity, heroY } = useStepScroll(
    ref,
    step.stepNum
  );

  const alignRight = step.side === "right";

  return (
    <section
      ref={ref}
      data-step={step.n}
      className="relative h-screen w-full flex flex-col justify-center px-6 md:px-16 lg:px-28 pt-20 md:pt-0"
      aria-label={`Step ${step.n}`}
    >
      {step.stepNum === 1 && <Hero opacity={heroOpacity} y={heroY} />}

      <motion.div
        style={{ y, opacity: cardOpacity }}
        className={cn("flex w-full", alignRight ? "justify-end" : "justify-start")}
      >
        <StepCard step={step}>{isFinale && <EmbedSnippet />}</StepCard>
      </motion.div>
    </section>
  );
}
