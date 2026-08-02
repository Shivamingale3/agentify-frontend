import { wrapLayout } from './base-layout.js';
import { renderCtaButton } from './partials/cta-button.js';
import { renderLinkBanner } from './partials/link-banner.js';
import { APP_NAME } from '../../../constants/auth.constants.js';
import { env } from '../../../config/env.config.js';
import type { EmailRenderResult, EmailTemplateData } from '../../../types/email.types.js';

/**
 * "Reset your password" — template only.
 *
 * Producer/worker wiring for reset-password is deferred by design. The
 * template is registered in the registry so it is renderable for preview /
 * future wiring; it expects the same opaque-token + pre-built-URL contract as
 * verify-email.
 */
export function renderResetPassword(
  data: EmailTemplateData['reset-password'],
): EmailRenderResult {
  const { email, firstName, resetUrl } = data;
  const greetingName = firstName?.trim() ?? 'there';

  const bodyHtml = `
    <p style="margin:0 0 12px;">Hi ${greetingName},</p>
    <p style="margin:0 0 12px;">
      We received a request to reset the password for your ${APP_NAME} account
      (<strong>${email}</strong>). Click the button below to choose a new password.
      This link expires in 30 minutes.
    </p>
    ${renderCtaButton({ href: resetUrl, label: 'Reset password' })}
    ${renderLinkBanner({ url: resetUrl })}
    <p class="email-muted" style="margin:16px 0 0;font-size:12px;color:#71717a;">
      If you didn&rsquo;t request a password reset, you can safely ignore this email — your password stays unchanged.
    </p>
  `.trim();

  return {
    subject: `Reset your ${APP_NAME} password`,
    html: wrapLayout({
      publicUrl: env.FRONTEND_URL,
      appName: APP_NAME,
      preheader: `Reset the password for your ${APP_NAME} account`,
      title: 'Reset your password',
      bodyHtml,
    }),
    text: [
      `Hi ${greetingName},`,
      ``,
      `We received a request to reset the password for your ${APP_NAME} account (${email}).`,
      `Click the link below to choose a new password.`,
      `This link expires in 30 minutes.`,
      ``,
      resetUrl,
      ``,
      `If you didn't request a password reset, you can safely ignore this email — your password stays unchanged.`,
    ].join('\n'),
  };
}