import type { ClientEnv, ServerEnv } from "../types";
import { envSchema } from "../validations/env";

const isServer = typeof window === "undefined";

const envVars = {
  NODE_ENV: process.env.NODE_ENV,
  BACKEND_URL: process.env.BACKEND_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
};

let parsedEnv: Record<string, unknown> = envVars;

if (isServer) {
  const parsed = envSchema.safeParse(envVars);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    for (const [key, value] of Object.entries(
      parsed.error.flatten().fieldErrors,
    )) {
      console.error(`  ${key}: ${value?.join(", ")}`);
    }
    process.exit(1);
  }

  parsedEnv = parsed.data;
}

export const serverEnv: ServerEnv = {
  get BACKEND_URL() {
    return parsedEnv.BACKEND_URL;
  },
  get NODE_ENV() {
    return parsedEnv.NODE_ENV;
  },
} as ServerEnv;

export const clientEnv: ClientEnv = {
  get NEXT_PUBLIC_APP_NAME() {
    return parsedEnv.NEXT_PUBLIC_APP_NAME || "Botify";
  },
} as ClientEnv;

export const isProd = () => serverEnv.NODE_ENV === "production";
export const isServerRuntime = () => isServer;

export const env = parsedEnv;
