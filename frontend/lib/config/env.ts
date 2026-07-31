type ServerEnv = {
  BACKEND_URL: string;
  NODE_ENV: string;
};

type ClientEnv = {
  NEXT_PUBLIC_APP_NAME: string;
};

function required(name: string, value: string | undefined): string {
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

const isServer = typeof window === "undefined";

export const serverEnv: ServerEnv = {
  get BACKEND_URL() {
    return required("BACKEND_URL", process.env.BACKEND_URL);
  },
  get NODE_ENV() {
    return process.env.NODE_ENV ?? "development";
  },
} as ServerEnv;

export const clientEnv: ClientEnv = {
  get NEXT_PUBLIC_APP_NAME() {
    return process.env.NEXT_PUBLIC_APP_NAME ?? "Get Your Bot";
  },
} as ClientEnv;

export const isProd = () => serverEnv.NODE_ENV === "production";
export const isServerRuntime = () => isServer;