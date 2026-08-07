"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { installScrollListener } from "@/lib/bot/scroll-state";
import SiteHeader from "./site-header";
import StepSection from "./step-section";
import CreditFooter from "./credit-footer";
import { STEPS } from "./steps-data";

// Three.js / R3F is client-only and its <Canvas> must NOT run during SSR
// (it touches `window`/`WebGL`). Load it with `ssr: false` so the HTML body
// paints first and the WebGL canvas hydrates behind it on the client.
const BotScene = dynamic(() => import("./bot-scene/bot-scene"), {
  ssr: false,
  loading: () => null,
});

/**
 * Root of the "/" marketing page. Composition only: installs the scroll
 * signal the 3D scene reads from, then stacks the 3D canvas behind the
 * header, the 8 scroll-driven steps, and the footer.
 *
 * Forced dark (`className="dark"`): the 3D lighting and post-processing are
 * tuned for an AMOLED-black backdrop, independent of whatever theme the rest
 * of the app is in — a returning user who'd switched to light mode elsewhere
 * shouldn't get a white background fighting the bot's lighting here.
 */
export default function LandingPage() {
  useEffect(() => installScrollListener(), []);

  return (
    <div className="dark relative w-full bg-background text-foreground">
      {/* 3D scene pinned behind everything */}
      <div className="fixed inset-0 z-0 h-screen w-full">
        <BotScene />
      </div>

      <div className="relative z-10 pointer-events-none">
        <SiteHeader />
        {STEPS.map((step, i) => (
          <StepSection
            key={step.n}
            step={step}
            isFinale={i === STEPS.length - 1}
          />
        ))}
      </div>

      <CreditFooter />
    </div>
  );
}
