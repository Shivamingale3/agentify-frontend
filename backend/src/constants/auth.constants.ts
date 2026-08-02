/**
 * Cookie names used throughout the application.
 * Centralised here so controllers never hard-code cookie strings.
 */
export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

export const PUBLIC_ROUTES = ['/api/auth/login', '/api/auth/register', '/api/auth/reset-password'];
