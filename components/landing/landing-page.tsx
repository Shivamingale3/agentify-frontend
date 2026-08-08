import BotSceneMount from "./bot-scene-mount";
import SiteHeader from "./site-header";
import StepSection from "./step-section";
import StepCard from "./step-card";
import EmbedSnippet from "./embed-snippet";
import CreditFooter from "./credit-footer";
import { STEPS } from "./steps-data";

/**
 * Root of the "/" marketing page. Composition only: stacks the 3D canvas
 * behind the header, the 8 scroll-driven steps, and the footer.
 *
 * A Server Component. The only client islands are the ones that genuinely
 * need the browser — the WebGL canvas + scroll listener (BotSceneMount), the
 * scroll-linked motion wrapper (StepSection), the header CTA, and the
 * clipboard button — so all the marketing copy is server-rendered HTML that
 * costs nothing to hydrate.
 *
 * Forced dark (`className="dark"`): the 3D lighting and post-processing are
 * tuned for an AMOLED-black backdrop, independent of whatever theme the rest
 * of the app is in — a returning user who'd switched to light mode elsewhere
 * shouldn't get a white background fighting the bot's lighting here.
 */
export default function LandingPage() {
  return (
    <div className="dark relative w-full bg-background text-foreground">
      {/* 3D scene pinned behind everything */}
      <BotSceneMount />

      <SiteHeader />

      {/*
        `pointer-events-none` so scroll/drag reaches the canvas behind; the
        card surfaces and buttons opt back in individually.
      */}
      <main className="relative z-10 pointer-events-none">
        {STEPS.map((step, i) => {
          const headingId = `step-${step.n}-title`;
          return (
            <StepSection
              key={step.n}
              n={step.n}
              stepNum={step.stepNum}
              side={step.side}
              headingId={headingId}
            >
              <StepCard step={step} headingId={headingId}>
                {i === STEPS.length - 1 && <EmbedSnippet />}
              </StepCard>
            </StepSection>
          );
        })}
      </main>

      <CreditFooter />
    </div>
  );
}
