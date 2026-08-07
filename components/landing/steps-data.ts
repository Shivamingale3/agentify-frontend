export type StepSide = "left" | "right";

export type Step = {
  n: string;
  stepNum: number;
  headline: string;
  sub: string;
  side: StepSide;
  eyebrow: string;
};

/**
 * Exactly 8 steps. Each renders as one full-viewport section, so page-scroll
 * progress (0..1) maps cleanly into 8 equal segments that lib/bot/parts.ts
 * (TOTAL_STEPS) drives the 3D assembly from — do not change the length of
 * this array without updating TOTAL_STEPS.
 */
export const STEPS: Step[] = [
  {
    n: "01",
    stepNum: 1,
    headline: "Sign in. Or don't.",
    sub: "The thing you build here runs on a URL — not your account, not your dashboard, not your data.",
    side: "left",
    eyebrow: "01 / 08 · Sign in",
  },
  {
    n: "02",
    stepNum: 2,
    headline: "New bot. Three fields.",
    sub: "Name, persona, the do's and the don'ts. Hit enter. You're done.",
    side: "right",
    eyebrow: "02 / 08 · Create",
  },
  {
    n: "03",
    stepNum: 3,
    headline: "The eyes come next.",
    sub: "Boundaries wired into the gaze — what to say, what to refuse, where to stop.",
    side: "left",
    eyebrow: "03 / 08 · Persona",
  },
  {
    n: "04",
    stepNum: 4,
    headline: "Drop docs. Connect your DB.",
    sub: "It reads. It cites. It goes quiet when it doesn't know.",
    side: "right",
    eyebrow: "04 / 08 · Knowledge",
  },
  {
    n: "05",
    stepNum: 5,
    headline: "Bring keys. Pick the brain.",
    sub: "OpenAI, Claude, Llama, your own — drop a key, pick an LLM, pick a vectorizer. Done.",
    side: "left",
    eyebrow: "05 / 08 · Mind",
  },
  {
    n: "06",
    stepNum: 6,
    headline: "Tools. Where the agent earns its keep.",
    sub: "Wire HubSpot, Calendly, Postgres, Stripe. The bot calls the right one when it should — no prompt-engineering you to red.",
    side: "right",
    eyebrow: "06 / 08 · Tools",
  },
  {
    n: "07",
    stepNum: 7,
    headline: "It closes up.",
    sub: "Plates snap in. One embeddable URL. That is the whole deliverable.",
    side: "left",
    eyebrow: "07 / 08 · Embed",
  },
  {
    n: "08",
    stepNum: 8,
    headline: "Paste one line. Reload.",
    sub: "Your site runs an agent. No reinstall, no SDK, no React rewrite, no engineer on the call.",
    side: "right",
    eyebrow: "08 / 08 · Ship",
  },
];
