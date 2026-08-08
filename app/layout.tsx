import type { Metadata, Viewport } from "next";
import { Oxanium } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toast";
import { env } from "@/lib/config/env";
import { SITE } from "@/lib/seo/site";

const oxanium = Oxanium({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  /**
   * Lets every route below express `openGraph.url`, `alternates.canonical` and
   * image paths as relative strings. Without it, relative URL-based metadata is
   * a build error and social crawlers get no absolute image URL.
   */
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: env.NEXT_PUBLIC_APP_TAG_LINE,
  applicationName: SITE.name,
  openGraph: {
    siteName: SITE.name,
    locale: SITE.locale,
    type: "website",
  },
  twitter: {
    // `summary_large_image` is what promotes the OG card from a thumbnail to a
    // full-bleed preview. It only takes effect because app/twitter-image.tsx
    // supplies an image — without one, X silently downgrades to `summary`.
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Defaults cap SERP snippets and forbid large thumbnails; opting out of
      // both is what lets Google render the full description and a big image.
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", "font-sans", oxanium.variable)}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
