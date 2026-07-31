import z from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  BACKEND_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string().default("Get Your Bot"),
});
