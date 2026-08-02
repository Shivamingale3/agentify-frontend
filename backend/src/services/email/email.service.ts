import nodemailer from 'nodemailer';
import { env } from '../../config/env.config.js';
import { APP_NAME } from '../../constants/auth.constants.js';
import { isEtherealMode, getEmailTransporter } from '../../config/email.config.js';
import { logger } from '../../utils/logger.js';
import { renderTemplate } from './templates/index.js';
import type {
  EmailRenderResult,
  EmailTemplateData,
  EmailTemplateName,
  SendEmailArgs,
} from '../../types/email.types.js';

/**
 * Single entrypoint for sending templated emails.
 *
 * - Looks up the template in the registry and renders subject/html/text.
 * - Picks the transporter via the central `getEmailTransporter()`: real SMTP by
 *   default, or an Ethereal test account in development when `EMAIL_HOST` is
 *   set to the sentinel `smtp.ethereal.email`.
 *
 * Errors are intentionally allowed to propagate — the caller (e.g. the BullMQ
 * worker) is responsible for retry / dead-letter handling. See
 * `queue.config.ts`.
 */
export async function sendEmail<TName extends EmailTemplateName>({
  to,
  templateName,
  data,
}: SendEmailArgs<TName>): Promise<{ previewUrl: string | null }> {
  const rendered: EmailRenderResult = renderTemplate(templateName, data);
  const from = `${APP_NAME} <${env.EMAIL_FROM}>`;

  const transporter = await getEmailTransporter();
  const info = (await transporter.sendMail({
    from,
    to,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  })) as Parameters<typeof nodemailer.getTestMessageUrl>[0];

  // `getTestMessageUrl` returns `string | false | null`; normalize the
  // non-string truthy cases to `null`.
  const rawPreview = isEtherealMode() ? nodemailer.getTestMessageUrl(info) : null;
  const previewUrl: string | null =
    typeof rawPreview === 'string' ? rawPreview : null;

  if (previewUrl) {
    logger.info(`Email: Ethereal preview URL → ${previewUrl}`);
  }

  return { previewUrl };
}

export type { EmailTemplateData };