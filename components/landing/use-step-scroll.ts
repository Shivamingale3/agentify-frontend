"use client";

import { type RefObject } from "react";
import { useScroll, useTransform, type MotionValue } from "framer-motion";

export type StepScrollValues = {
  y: MotionValue<number>;
  cardOpacity: MotionValue<number>;
  heroOpacity: MotionValue<number>;
  heroY: MotionValue<number>;
};

/**
 * Derives every scroll-linked motion value a step section needs, given its
 * own ref and step number. Single responsibility: turn scroll position into
 * animation values — StepSection only lays out and renders the result.
 *
 * `target: ref` tracks the section's own on-screen position (not a
 * hand-rolled pixel formula), because the card is vertically centred in a
 * normal-flow h-screen section rather than pinned — it's genuinely visible
 * for progress near 0.5, not the whole [0, 1] sweep. The plateau below is
 * deliberately narrow (0.35-0.65, vs. an earlier 0.18-0.82) so neighbouring
 * sections' full-opacity windows never overlap in absolute scroll position.
 */
export function useStepScroll(
  ref: RefObject<HTMLElement | null>,
  stepNum: number
): StepScrollValues {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0.15, 0.35, 0.65, 0.85], [40, 0, 0, -40]);
  const opacity = useTransform(
    scrollYProgress,
    [0.15, 0.35, 0.65, 0.85],
    [0, 1, 1, 0]
  );

  // Section 1 has nothing before it, so it can't be "entered from below" —
  // its progress starts clamped at 0.5 on load, which sits inside the
  // plateau above. Left alone, step 1's card would render at full opacity
  // stacked on the hero from the first paint. Gate it behind the hero's own
  // fade so they cross-fade instead of stacking — steps 2-8 are unaffected.
  const { scrollYProgress: heroProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(heroProgress, [0, 0.18], [1, 0]);
  const heroY = useTransform(heroProgress, [0, 0.18], [0, -120]);
  const heroClearGate = useTransform(heroProgress, [0.06, 0.16], [0, 1]);
  const gatedOpacity = useTransform(
    [heroClearGate, opacity],
    ([gate, o]) => Math.min(gate as number, o as number)
  );

  const cardOpacity = stepNum === 1 ? gatedOpacity : opacity;

  return { y, cardOpacity, heroOpacity, heroY };
}
