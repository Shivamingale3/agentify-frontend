import { env } from '../config/env.config.js';
import { queueConfig } from '../config/queue.config.js';
import { logger } from '../utils/logger.js';
import { createEmailVerificationToken } from './email-verification-token.service.js';

interface PostRegisterArgs {
  userId: string;
  email: string;
  // `string | undefined` flows from the register schema (`z.string().optional()`).
  // `null` is accepted for forward compatibility with services that may pass null.
  firstName: string | null | undefined;
  lastName: string | null | undefined;
}

/**
 * Runs after a successful `registerService` + `postLoginService`.
 *
 *   1. Issues an opaque email-verification token (DB + Redis cache).
 *   2. Builds the verification URL `${FRONTEND_URL}/verify-email?token=…`.
 *   3. Enqueues a verify-email job on the BullMQ `email-jobs-queue`.
 *
 * Fire-and-forget by design: any error here is logged and swallowed so a
 * transient infra failure (Redis/DB hiccup, queue down) never breaks a
 * registration the user has already paid for. The user can later re-trigger
 * verification via a future "resend verify email" endpoint.
 *
 * Callers MUST `await` this (so the event loop flushes the enqueue before the
 * process returns), but do NOT need to handle its errors.
 */
export async function postRegisterService({
  userId,
  email,
  firstName,
  lastName,
}: PostRegisterArgs): Promise<void> {
  try {
    const rawToken = await createEmailVerificationToken({ userId, email });

    const verificationUrl = `${env.FRONTEND_URL.replace(/\/$/, '')}/verify-email?token=${rawToken}`;

    await queueConfig.emailQueue.add(
      'verify-email',
      {
        email,
        userId,
        firstName: firstName ?? undefined,
        lastName: lastName ?? undefined,
        token: rawToken,
        verificationUrl,
      },
      // BullMQ defaults are fine; can tune attempts/backoff here later.
    );

    logger.info(`Queued verify-email job for user ${userId}`);
  } catch (error) {
    logger.error(
      `postRegisterService: failed to enqueue verify-email for user ${userId}:`,
      error,
    );
  }
}