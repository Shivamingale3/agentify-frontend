import type { Metadata } from "next";
import { preload } from "react-dom";
import LandingPage from "@/components/landing/landing-page";
import {
  HOME_DESCRIPTION,
  HOME_TITLE,
  SITE,
  SOCIAL_DESCRIPTION,
  absoluteUrl,
} from "@/lib/seo/site";

export const metadata: Metadata = {
  // `absolute` opts out of the root layout's `%s · Agentify` template — the
  // brand name is already in this title, and "Agentify — … · Agentify" reads badly
  // and wastes SERP characters.
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  // Collapses ?utm_*, trailing-slash and www/non-www variants onto one URL so
  // link equity isn't split across duplicates of the same page.
  alternates: { canonical: "/" },
  // `openGraph` and `twitter` are replaced wholesale by the nearest segment
  // that declares them — Next does not deep-merge them with the root layout.
  // Anything the layout sets and this page still wants (siteName, locale,
  // card) has to be restated here or it silently disappears from the <head>.
  openGraph: {
    title: HOME_TITLE,
    description: SOCIAL_DESCRIPTION,
    url: "/",
    siteName: SITE.name,
    locale: SITE.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: SOCIAL_DESCRIPTION,
  },
};

/**
 * Structured data for the landing page. Deliberately limited to what is
 * verifiable from the page itself — no `SoftwareApplication` offers or
 * `aggregateRating`, which would assert a shipped product with real reviews
 * (the footer says "speculative concept · coming soon"). Fabricated structured
 * data is a manual-action risk, not a ranking shortcut.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": absoluteUrl("/#organization"),
      name: SITE.name,
      url: absoluteUrl("/"),
      slogan: SITE.tagline,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/logo.png"),
      },
    },
    {
      "@type": "WebSite",
      "@id": absoluteUrl("/#website"),
      name: SITE.name,
      url: absoluteUrl("/"),
      description: HOME_DESCRIPTION,
      inLanguage: "en",
      publisher: { "@id": absoluteUrl("/#organization") },
    },
    {
      "@type": "WebPage",
      "@id": absoluteUrl("/#webpage"),
      url: absoluteUrl("/"),
      name: HOME_TITLE,
      description: HOME_DESCRIPTION,
      isPartOf: { "@id": absoluteUrl("/#website") },
      about: { "@id": absoluteUrl("/#organization") },
      primaryImageOfPage: { "@type": "ImageObject", url: absoluteUrl("/opengraph-image") },
    },
  ],
};

export default function Home() {
  /*
    Breaks the model's request waterfall. The 3D scene is a `ssr: false`
    dynamic import, so without this the .glb isn't requested until React
    hydrates, the ~350 KB scene chunk downloads, AND ~1.2 MB of Three.js
    parses — measured at 274 ms before the first model byte on localhost,
    where bandwidth is free and every hop costs zero latency. On a real
    connection that's three serial round-trips deep.

    `preload()` rather than a raw <link>: React emits exactly one hoisted tag
    and dedupes it, where the JSX element is rendered inline *and* hoisted.
    `as: "fetch"` + `crossOrigin` must match how GLTFLoader issues the request
    — a mismatch makes the browser discard the preload and fetch the model
    a second time.
  */
  preload("/models/agentify-head.glb", {
    as: "fetch",
    crossOrigin: "anonymous",
    type: "model/gltf-binary",
  });

  return (
    <>
      {/*
        A plain <script>, not next/script: JSON-LD is data, not executable
        code, and it must be present in the server-rendered HTML for crawlers
        that don't run JS. Escaping `<` guards against HTML-injection if any
        field ever becomes user- or CMS-supplied.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <LandingPage />
    </>
  );
}
