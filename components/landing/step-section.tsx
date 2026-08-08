"use client";

import { useRef, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { StepSide } from "./steps-data";
import { useStepScroll } from "./use-step-scroll";
import Hero from "./hero";

/**
 * One full-viewport step. Single responsibility: lay out this step's content
 * (hero + card, positioned to alternate sides) and apply the motion values
 * use-step-scroll computes — it doesn't compute any scroll math itself.
 *
 * The card arrives as `children` rather than being built here from a `Step`,
 * so all the step copy stays in Server Components and never reaches the
 * browser bundle. This component only needs the three layout/animation
 * primitives below, so those are the only props that cross the boundary.
 */
export default function StepSection({
  n,
  stepNum,
  side,
  headingId,
  children,
}: {
  n: string;
  stepNum: number;
  side: StepSide;
  headingId: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { y, cardOpacity, heroOpacity, heroY } = useStepScroll(ref, stepNum);

  const alignRight = side === "right";

  return (
    <section
      ref={ref}
      id={`step-${n}`}
      data-step={n}
      className="relative h-screen w-full flex flex-col justify-center px-6 md:px-16 lg:px-28 pt-20 md:pt-0"
      aria-labelledby={headingId}
    >
      {stepNum === 1 && <Hero opacity={heroOpacity} y={heroY} />}

      <motion.div
        style={{ y, opacity: cardOpacity }}
        className={cn("flex w-full", alignRight ? "justify-end" : "justify-start")}
      >
        {children}
      </motion.div>
    </section>
  );
}
