import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/seo/site";

/**
 * `/` is the only indexable route today — every other page is an auth screen
 * or a token-bearing landing target, all of which robots.ts disallows. Add
 * entries here as public marketing routes appear; a sitemap listing
 * disallowed URLs is a Search Console error, not a shortcut.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
