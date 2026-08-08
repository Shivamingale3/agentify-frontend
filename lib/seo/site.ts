import { env } from "@/lib/config/env";

/**
 * Single source of truth for every SEO surface: `<head>` metadata, the
 * canonical URL, robots.txt, sitemap.xml, JSON-LD and the generated OG image.
 *
 * Server-only — it reads `FRONTEND_URL`, which is not a `NEXT_PUBLIC_` var.
 * Importing this from a client component would leak it into the browser
 * bundle (and fail the build), so keep it to `metadata` exports, route
 * handlers and server components.
 */
export const SITE = {
  name: env.NEXT_PUBLIC_APP_NAME,
  url: env.FRONTEND_URL,
  tagline: "Ship an agent, not a chatbot.",
  locale: "en_US",
} as const;

/** The `/` page title. Used verbatim as `<title>` and `og:title`. */
export const HOME_TITLE = `${SITE.name} — ship an agent, not a chatbot.`;

/**
 * The `/` meta description. ~155 chars is the practical SERP truncation point;
 * the lead clause carries the pitch so it survives being cut.
 */
export const HOME_DESCRIPTION =
  "Assemble a real agentic bot in a minute — persona, knowledge, tools, embed one line of HTML. For sales teams that ship leads to CRM, calendars, and DB without writing code.";

/** Shorter variant for social cards, where previews clip harder than SERPs. */
export const SOCIAL_DESCRIPTION =
  "Persona. Knowledge. Tools. One embed line. No code. No reinstall.";

export const OG_IMAGE_ALT = `${SITE.name} — ${SITE.tagline}`;

/** Absolute URL for a site-relative path. */
export const absoluteUrl = (path = "/") => new URL(path, SITE.url).toString();
