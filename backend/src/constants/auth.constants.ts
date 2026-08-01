/**
 * Cookie names used throughout the application.
 * Centralised here so controllers never hard-code cookie strings.
 */
export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;
