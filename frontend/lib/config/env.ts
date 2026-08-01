import type { Env } from "../types";
import { envSchema } from "../validations/env";

const parsed = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  BACKEND_URL: process.env.BACKEND_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_TAG_LINE: process.env.NEXT_PUBLIC_APP_TAG_LINE,
});

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  for (const [key, value] of Object.entries(
    parsed.error.flatten().fieldErrors,
  )) {
    console.error(`  ${key}: ${value?.join(", ")}`);
  }
  process.exit(1);
}

export const env: Env = parsed.data;
