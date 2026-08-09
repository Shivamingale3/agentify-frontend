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
  CONFIRM_EMAIL: "/confirm-email",
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
  LOGOUT: "/api/auth/logout",
  LOGOUT_ALL: "/api/auth/logout-all",
  REGISTER: "/api/auth/register",
  VERIFY_EMAIL: "/api/auth/verify-email",
  VERIFY_EMAIL_CHANGE: "/api/auth/verify-email-change",
  RESEND_VERIFICATION: "/api/auth/resend-verification",
  FORGOT_PASSWORD: "/api/auth/forgot-password",
  RESET_PASSWORD: "/api/auth/reset-password",
  VERIFY_RESET_TOKEN: "/api/auth/reset-password/verify",
} as const;

/**
 * Paths on the backend service, appended to `env.BACKEND_URL` (which already
 * includes the `/api/v1` prefix).
 * Mirrors `com.botify.api.controller.AuthController`.
 */
export const BackendRoutes = {
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  LOGOUT_ALL: "/auth/logout-all",
  REGISTER: "/auth/register",
  VERIFY_EMAIL: "/auth/verify-email",
  VERIFY_EMAIL_CHANGE: "/auth/verify-email-change",
  RESEND_VERIFICATION: "/auth/resend-verification",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  VERIFY_RESET_TOKEN: "/auth/validate-reset-token",
} as const;

/**
 * Pages only a signed-out visitor should see. `/forgot-password` belongs here
 * — it is a form, not an emailed link, and a signed-in user has no reason to
 * be on it.
 */
export const AuthRoutes: readonly string[] = [
  Routes.LOGIN,
  Routes.REGISTER,
  Routes.FORGOT_PASSWORD,
];

/**
 * Pages anyone may see. Every screen that is the target of an emailed link
 * lives here rather than in `AuthRoutes`, so a user who is already signed in
 * when they open the link still lands on the screen instead of being
 * redirected to the dashboard with their single-use token left unspent.
 */
export const PublicRoutes: readonly string[] = [
  Routes.HOME,
  Routes.VERIFY_EMAIL,
  Routes.CONFIRM_EMAIL,
  Routes.RESET_PASSWORD,
  "/",
];

export const DEFAULT_AUTH_REDIRECT = Routes.DASHBOARD;
export const DEFAULT_UNAUTH_REDIRECT = Routes.LOGIN;

/**
 * Field rules, kept identical to the backend's Bean Validation constraints in
 * `com.botify.api.dto.request.*` and `security.password-policy.*`.
 */
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

/** Query parameter carrying a one-time link token. */
export const VERIFY_EMAIL_TOKEN_PARAM = "token";

export const HTTP_TIMEOUT_MS = 10_000;
