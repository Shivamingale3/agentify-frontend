import z from "zod";

export const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  BACKEND_URL: z.url(),
  /**
   * Public origin this app is served from. Server-only: it feeds `metadataBase`,
   * the canonical URL, `robots.txt` and `sitemap.xml`, none of which run in the
   * browser. Must be the real production origin in prod — a wrong value emits
   * canonicals pointing at localhost.
   */
  FRONTEND_URL: z.url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().default("Agentify"),
  NEXT_PUBLIC_APP_TAG_LINE: z.string().default("SHIP AN AGENT, NOT A CHATBOT"),
});
