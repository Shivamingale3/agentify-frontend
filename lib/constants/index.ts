export const APP_NAME = "Agentify";

export const COOKIE_NAMES = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
} as const;

export const Routes = {
  HOME: "/home",
  LOGIN: "/login",
  REGISTER: "/register",
  VERIFY_EMAIL: "/verify-email",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  DASHBOARD: "/dashboard",
} as const;

export type RoutePath = (typeof Routes)[keyof typeof Routes];

/**
 * Route handlers exposed by this app (the BFF layer). The browser never talks
 * to the backend directly — every call goes through one of these.
 */
export const ApiRoutes = {
  LOGIN: "/api/auth/login",
  REGISTER: "/api/auth/register",
  VERIFY_EMAIL: "/api/auth/verify-email",
  FORGOT_PASSWORD: "/api/auth/forgot-password",
  RESET_PASSWORD: "/api/auth/reset-password",
  VERIFY_RESET_TOKEN: "/api/auth/reset-password/verify",
} as const;

/**
 * Paths on the backend service, appended to `env.BACKEND_URL`.
 * Mirrors `backend/src/routes/auth.routes.ts` mounted under `/api/auth`.
 */
export const BackendRoutes = {
  LOGIN: "/api/auth/login",
  REGISTER: "/api/auth/register",
  VERIFY_EMAIL: "/api/auth/verify-email",
  FORGOT_PASSWORD: "/api/auth/forgot-password",
  RESET_PASSWORD: "/api/auth/reset-password",
  VERIFY_RESET_TOKEN: "/api/auth/reset-password/verify",
} as const;

/** Pages only a signed-out visitor should see. */
export const AuthRoutes: readonly string[] = [
  Routes.LOGIN,
  Routes.REGISTER,
  Routes.FORGOT_PASSWORD,
  Routes.RESET_PASSWORD,
];

/**
 * Pages anyone may see. `/verify-email` lives here rather than in
 * `AuthRoutes` so an already signed-in user following the link from their
 * inbox still lands on the confirmation screen instead of being redirected.
 */
export const PublicRoutes: readonly string[] = [
  Routes.HOME,
  Routes.VERIFY_EMAIL,
  "/",
];

export const DEFAULT_AUTH_REDIRECT = Routes.DASHBOARD;
export const DEFAULT_UNAUTH_REDIRECT = Routes.LOGIN;

export const PASSWORD = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 16,
} as const;

export const EMAIL = {
  MAX_LENGTH: 254,
} as const;

export const NAME = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 50,
} as const;

/** Query parameter carrying the email-verification token. */
export const VERIFY_EMAIL_TOKEN_PARAM = "token";

export const HTTP_TIMEOUT_MS = 10_000;
