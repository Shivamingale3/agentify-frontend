import type { CookieOptions, Request, Response } from 'express';
import { env } from '../config/env.config.js';
import { COOKIE_NAMES } from '../constants/auth.constants.js';
import type { CookieName } from '../types/auth.types.js';

/**
 * Returns secure-by-default cookie options.
 * In production `secure` is always true; in development it falls back to false
 * so cookies still work over plain HTTP on localhost.
 */
function getDefaultCookieOptions(maxAgeMs: number): CookieOptions {
  const isProduction = env.APP_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: maxAgeMs,
    path: '/',
  };
}

// ---------------------------------------------------------------------------
// Set cookies
// ---------------------------------------------------------------------------

/**
 * Attach the access-token cookie to the response.
 */
export function setAccessTokenCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAMES.ACCESS_TOKEN, token, getDefaultCookieOptions(env.ACCESS_TOKEN_EXPIRY));
}

/**
 * Attach the refresh-token cookie to the response.
 */
export function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAMES.REFRESH_TOKEN, token, getDefaultCookieOptions(env.REFRESH_TOKEN_EXPIRY));
}

/**
 * Convenience helper – sets both access and refresh token cookies at once.
 */
export function setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
  setAccessTokenCookie(res, accessToken);
  setRefreshTokenCookie(res, refreshToken);
}

// ---------------------------------------------------------------------------
// Clear cookies
// ---------------------------------------------------------------------------

/**
 * Remove a single cookie by name. Uses the same path / domain so the
 * browser matches the original `Set-Cookie`.
 */
export function clearCookie(res: Response, name: CookieName): void {
  res.clearCookie(name, { path: '/' });
}

/**
 * Remove both auth cookies (access + refresh) in one call.
 */
export function clearAuthCookies(res: Response): void {
  clearCookie(res, COOKIE_NAMES.ACCESS_TOKEN);
  clearCookie(res, COOKIE_NAMES.REFRESH_TOKEN);
}

// ---------------------------------------------------------------------------
// Read cookies
// ---------------------------------------------------------------------------

/**
 * Extract a cookie value from the incoming request.
 *
 * Requires `cookie-parser` middleware (or a signed-cookie equivalent) to be
 * mounted so that `req.cookies` is populated.  Returns `undefined` when the
 * cookie is missing.
 */
export function getCookie(req: Request, name: CookieName): string | undefined {
  return (req.cookies as Record<string, string> | undefined)?.[name];
}

/**
 * Shorthand – pull the access-token cookie from the request.
 */
export function getAccessTokenCookie(req: Request): string | undefined {
  return getCookie(req, COOKIE_NAMES.ACCESS_TOKEN);
}

/**
 * Shorthand – pull the refresh-token cookie from the request.
 */
export function getRefreshTokenCookie(req: Request): string | undefined {
  return getCookie(req, COOKIE_NAMES.REFRESH_TOKEN);
}
