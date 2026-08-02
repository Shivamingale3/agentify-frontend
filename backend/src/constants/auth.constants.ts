/**
 * Cookie names used throughout the application.
 * Centralised here so controllers never hard-code cookie strings.
 */
export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

export const PUBLIC_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/reset-password',
  '/api/auth/verify-email',
];

/**
 * Default sender display name. Kept as a constant (no backend env var) for now —
 * mirrors the frontend `NEXT_PUBLIC_APP_NAME` default ("Botify").
 */
export const APP_NAME = 'Botify';

/**
 * Time-to-live for an email verification token, in seconds (24h).
 * Both the DB row and the Redis cache entry use this value.
 */
export const EMAIL_VERIFICATION_TOKEN_TTL_SECONDS = 86_400;

/**
 * Redis key prefix for cached email-verification tokens. The full key is
 * `${EMAIL_TOKEN_CACHE_PREFIX}${tokenHash}` and stores the
 * `{ userId, email }` payload as JSON.
 */
export const EMAIL_TOKEN_CACHE_PREFIX = 'verify-email:';