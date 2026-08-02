import { db } from '../config/db.config.js';
import { consumeEmailVerificationToken } from './email-verification-token.service.js';

/**
 * Endpoint-level service for `POST /api/auth/verify-email`.
 *
 * - Consumes the opaque verify-email token (single-use, expiry-checked).
 * - Marks the matched `User.emailVerified` timestamp.
 *
 * Throws `HttpException(400)` (via the token service) on invalid / expired /
 * already-consumed tokens. All persistence here is DB-only — the token
 * service owns the cache invalidation.
 */
export async function verifyEmailService({
  token,
}: {
  token: string;
}): Promise<void> {
  const { userId } = await consumeEmailVerificationToken(token);

  await db.user.update({
    where: { userId },
    data: { emailVerified: new Date() },
  });
}