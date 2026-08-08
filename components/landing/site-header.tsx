import IconLogo from "@/components/ui/icon-logo";
import GetStartedButton from "./get-started-button";

/**
 * Persistent header: brand mark (non-interactive) + "Get started" CTA that
 * scrolls to the finale. Scrimmed, since step-8 content passes directly
 * underneath it at the end of the scroll.
 *
 * A real <header> landmark rather than a <div>, and a Server Component — only
 * the CTA needs the browser, so it lives in its own client island.
 *
 * Uses IconLogo directly rather than the shared theme-aware <Logo>: Logo
 * picks its fill colour from next-themes' current theme, but this page is
 * force-dark (see landing-page.tsx) independent of the app's global theme
 * setting — a returning user who'd switched the app to light mode would get
 * a black-on-black icon. IconLogo takes its colour as a plain prop, so this
 * is the one context where the wrapper is the wrong tool, not the SVG.
 */
export default function SiteHeader() {
  return (
    <header className="pointer-events-none fixed top-0 inset-x-0 z-20 flex items-center justify-between px-6 py-6 md:px-10 md:py-8 bg-gradient-to-b from-background/90 via-background/60 to-transparent">
      <div className="inline-flex items-center gap-2">
        <IconLogo currentColour="#fff" size="xs" />
        <div className="flex flex-col leading-none">
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            Agentify
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
            Ship an agent, not a chatbot
          </span>
        </div>
      </div>
      <GetStartedButton />
    </header>
  );
}
