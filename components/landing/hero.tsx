"use client";

import { motion, type MotionValue } from "framer-motion";

/** The giant opening tagline, absolutely centred over step 1, fading out as
 *  the reader starts scrolling — see use-step-scroll.ts for the motion math. */
export default function Hero({
  opacity,
  y,
}: {
  opacity: MotionValue<number>;
  y: MotionValue<number>;
}) {
  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
    >
      <h1 className="font-sans font-bold uppercase text-foreground text-5xl md:text-7xl lg:text-8xl leading-[1.05] tracking-wide">
        Ship an agent,
        <br />
        not a chatbot.
      </h1>
      <p className="mt-8 label-eyebrow">Scroll to assemble</p>
    </motion.div>
  );
}
