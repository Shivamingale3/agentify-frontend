import { ImageResponse } from "next/og";

import { SITE, SOCIAL_DESCRIPTION } from "@/lib/seo/site";

/**
 * The social card shared by `app/opengraph-image.tsx` and
 * `app/twitter-image.tsx` — one definition, two file-convention entry points,
 * so the two never drift.
 *
 * Rendered at build time by satori, which supports flexbox only (no grid) and
 * requires an explicit `display` on any element with more than one child.
 * Deliberately monochrome-on-black to match the force-dark landing page rather
 * than the app's themeable surfaces.
 *
 * Uses satori's bundled sans rather than Oxanium: `next/font/google` fetches
 * into the build cache and exposes no file path to read here. Uppercase and
 * wide tracking carry the brand's typographic character instead.
 */
export const renderOgImage = () =>
  new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#000000",
          color: "#fafafa",
          padding: "72px 80px",
          border: "1px solid #1f1f1f",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#fafafa",
          }}
        >
          {SITE.name}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              display: "flex",
              fontSize: 92,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "0.01em",
              textTransform: "uppercase",
              maxWidth: 940,
            }}
          >
            {SITE.tagline}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              lineHeight: 1.4,
              color: "#7d7d7d",
              maxWidth: 900,
            }}
          >
            {SOCIAL_DESCRIPTION}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
