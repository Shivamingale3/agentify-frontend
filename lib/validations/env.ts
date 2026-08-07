import z from "zod";

export const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  BACKEND_URL: z.url(),
  NEXT_PUBLIC_APP_NAME: z.string().default("Botify"),
  NEXT_PUBLIC_APP_TAG_LINE: z.string().default("AGENTIC BOTS · CHAT & SUPPORT"),
});
