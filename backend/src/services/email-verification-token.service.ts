import { ulid } from 'ulid';
import { db } from '../config/db.config.js';
import {
  EMAIL_TOKEN_CACHE_PREFIX,
  EMAIL_VERIFICATION_TOKEN_TTL_SECONDS,
} from '../constants/auth.constants.js';
import { HttpException } from '../exceptions/http.exception.js';
import cacheService from './cache.service.js';
import { hashString } from '../utils/hash.utils.js';
import { logger } from '../utils/logger.js';

/**
 * Cache payload cached per token-hash. Stored as JSON and validated lazily on
 * read (we just do field access — keep it minimal to avoid a zod round-trip on
 * the hot path; structural correctness is guaranteed by the writer here).
 */
interface CachedVerificationToken {
  userId: string;
  email: string;
}

function cacheKey(tokenHash: string): string {
  return `${EMAIL_TOKEN_CACHE_PREFIX}${tokenHash}`;
}

function expiryEpochSeconds(): number {
  return Math.floor(Date.now() / 1000) + EMAIL_VERIFICATION_TOKEN_TTL_SECONDS;
}

/**
 * Issues a fresh email-verification token for a user:
 *   1. Generates an opaque ulid (`rawToken`).
 *   2. SHA-256 hashes it (`tokenHash`) — the hash is what we persist, never the
 *      raw token. Mirrors the existing `refreshTokenHash` pattern in
 *      session.prisma.
 *   3. Writes a DB row with `expiresAt` (epoch seconds) and caches
 *      `{ userId, email }` in Redis with the same TTL (24h).
 *
 * Returns the raw token (to embed in a URL) — the caller must never persist it.
 */
export async function createEmailVerificationToken({
  userId,
  email,
}: {
  userId: string;
  email: string;
}): Promise<string> {
  const rawToken = ulid();
  const tokenHash = hashString(rawToken);
  const expiresAt = expiryEpochSeconds();

  await db.emailVerificationToken.create({
    data: { userId, email, tokenHash, expiresAt },
  });

  const cachePayload: CachedVerificationToken = { userId, email };
  await cacheService.set(
    cacheKey(tokenHash),
    cachePayload,
    EMAIL_VERIFICATION_TOKEN_TTL_SECONDS,
  );

  return rawToken;
}

/**
 * Validates and consumes a raw verification token in a single,
 * single-use manner:
 *
 *   1. Hashes the raw token and looks up the cache entry first (fast path).
 *   2. On cache miss, falls back to the DB (source of truth) and rehydrates
 *      the cache if it's still valid.
 *   3. Rejects expired, already-consumed, or missing tokens with a 400
 *      `HttpException` (matches the existing "Invalid credentials" pattern).
 *   4. On success, marks the row `consumedAt = now()` and deletes the cache
 *      entry so the same token can't be replayed.
 *
 * Returns `{ userId, email }` so the caller (verify-email service) can flip
 * `User.emailVerified`.
 */
export async function consumeEmailVerificationToken(
  rawToken: string,
): Promise<{ userId: string; email: string }> {
  const tokenHash = hashString(rawToken);
  const key = cacheKey(tokenHash);

  // Fast path: cache hit.
  const cached = await cacheService.get<CachedVerificationToken>(key);
  if (cached) {
    return consumeFromDbAndInvalidateCache(rawToken, tokenHash, key, cached);
  }

  // Slow path: lookup in DB.
  const row = await db.emailVerificationToken.findUnique({
    where: { tokenHash },
  });

  if (row === null) {
    throw new HttpException(400, 'Invalid or expired verification link');
  }

  if (row.consumedAt !== null) {
    throw new HttpException(400, 'This verification link has already been used');
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (row.expiresAt < nowSeconds) {
    throw new HttpException(400, 'This verification link has expired');
  }

  const result = { userId: row.userId, email: row.email };

  // Single-use: consume the row and drop the cache entry.
  await db.emailVerificationToken.update({
    where: { tokenHash },
    data: { consumedAt: new Date() },
  });
  await cacheService.del(key);

  return result;
}

/**
 * Shared finalize step used by both cache-hit and DB-hit paths: optimistically
 * consume the DB row and invalidate cache.
 *
 * The cache hit means the token *was* valid when cached, but we must still
 * check the DB row's `consumedAt` to enforce single-use across the cold-cache
 * window (e.g. cache evicted by Redis, then re-issued, then replayed).
 */
async function consumeFromDbAndInvalidateCache(
  rawToken: string,
  tokenHash: string,
  key: string,
  cached: CachedVerificationToken,
): Promise<{ userId: string; email: string }> {
  void rawToken;
  const row = await db.emailVerificationToken.findUnique({
    where: { tokenHash },
    select: { consumedAt: true, expiresAt: true },
  });

  if (row === null) {
    // Stale cache pointing at a missing row (DB cleaned up). Invalidate.
    await cacheService.del(key);
    throw new HttpException(400, 'Invalid or expired verification link');
  }

  if (row.consumedAt !== null) {
    await cacheService.del(key);
    throw new HttpException(400, 'This verification link has already been used');
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (row.expiresAt < nowSeconds) {
    await cacheService.del(key);
    throw new HttpException(400, 'This verification link has expired');
  }

  await db.emailVerificationToken.update({
    where: { tokenHash },
    data: { consumedAt: new Date() },
  });
  await cacheService.del(key);

  logger.debug(`Email verification token consumed for user ${cached.userId}`);
  return { userId: cached.userId, email: cached.email };
}