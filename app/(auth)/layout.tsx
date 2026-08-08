import type { Metadata } from "next";

import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Every auth screen is noindex/nofollow. They carry no content worth ranking,
 * and `/reset-password/[token]` and `/verify-email?token=` put a single-use
 * credential in the URL — that must never reach a search index or a referrer
 * chain. Inherited by each page in this group; the pages' own `title` and
 * `description` exports merge on top without overriding `robots`.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-20%,var(--primary)/18%,transparent_60%)]"
      />
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <main className="w-full max-w-sm">{children}</main>
    </div>
  );
}