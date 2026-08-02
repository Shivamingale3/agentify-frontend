export const APP_NAME = "Get Your Bot";

export const COOKIE_NAMES = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
} as const;

export const Routes = {
  HOME: "/home",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
} as const;

export type RoutePath = (typeof Routes)[keyof typeof Routes];

export const ApiRoutes = {
  LOGIN: "/api/auth/login",
} as const;

export const AuthRoutes: readonly string[] = [Routes.LOGIN, Routes.REGISTER];

export const PublicRoutes: readonly string[] = [Routes.HOME, "/"];

export const DEFAULT_AUTH_REDIRECT = Routes.DASHBOARD;
export const DEFAULT_UNAUTH_REDIRECT = Routes.LOGIN;

export const PASSWORD = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 16,
} as const;

export const EMAIL = {
  MAX_LENGTH: 254,
} as const;

export const HTTP_TIMEOUT_MS = 10_000;
