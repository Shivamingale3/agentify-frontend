import nodemailer, { type Transporter } from 'nodemailer';
import { env } from './env.config.js';
import { logger } from '../utils/logger.js';

/**
 * Sentinel value for `EMAIL_HOST` that switches the app into Ethereal
 * (nodemailer test inbox) mode in development. Useful when real SMTP
 * credentials aren't available locally.
 */
export const ETHEREAL_HOST_SENTINEL = 'smtp.ethereal.email';

export const isEtherealMode = (): boolean =>
  env.APP_ENV === 'development' && env.EMAIL_HOST === ETHEREAL_HOST_SENTINEL;

/** Singleton nodemailer transporter for real SMTP. Created eagerly. */
export const emailTransporter: Transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  secure: env.EMAIL_PORT === 465,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASSWORD,
  },
});

/**
 * Lazily-created Ethereal test account transport, used in development when
 * `EMAIL_HOST` is set to the sentinel. Generated once per process via
 * `nodemailer.createTestAccount()`.
 */
let etherealTransport: Transporter | null = null;

/**
 * Returns the transporter to use for outbound email:
 * - In Ethereal dev mode: a lazily-created test-account transporter.
 * - Otherwise: the real SMTP singleton.
 *
 * Use this in any code path that sends mail. The eager `emailTransporter`
 * const is only used directly inside `verifyEmailConnection()` for the
 * startup health check.
 */
export async function getEmailTransporter(): Promise<Transporter> {
  if (!isEtherealMode()) return emailTransporter;

  if (etherealTransport === null) {
    const testAccount = await nodemailer.createTestAccount();
    etherealTransport = nodemailer.createTransport({
      host: ETHEREAL_HOST_SENTINEL,
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    logger.info(
      `Email: Ethereal dev inbox ready (user=${testAccount.user}). Preview URLs will be logged per send.`,
    );
  }
  return etherealTransport;
}

/**
 * Verifies the SMTP connection is valid.
 * Call during app startup to fail fast on bad credentials / unreachable host.
 *
 * In Ethereal dev mode this is a no-op — the test account isn't created until
 * the first outbound email (see `getEmailTransporter`), so there is nothing
 * to verify at boot.
 */
export async function verifyEmailConnection(): Promise<void> {
  if (isEtherealMode()) {
    logger.info('Email: Ethereal dev mode active — skipping SMTP verification.');
    return;
  }
  await emailTransporter.verify();
  logger.info('Email: SMTP connection verified successfully.');
}

/**
 * Gracefully closes the transporter connection pool(s).
 */
export function closeEmailTransport(): void {
  if (etherealTransport) etherealTransport.close();
  emailTransporter.close();
  logger.info('Email: Transporter connection closed.');
}