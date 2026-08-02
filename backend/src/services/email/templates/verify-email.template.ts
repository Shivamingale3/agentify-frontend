import { wrapLayout } from './base-layout.js';
import { renderCtaButton } from './partials/cta-button.js';
import { renderLinkBanner } from './partials/link-banner.js';
import { APP_NAME } from '../../../constants/auth.constants.js';
import { env } from '../../../config/env.config.js';
import type { EmailRenderResult } from '../../../types/email.types.js';
import type { SendVerifyEmailBody } from '../../../types/auth.types.js';

/**
 * "Verify your email" — sent as the first step of the registration flow.
 *
 * Assumes the producer (`postRegisterService`) has already built the full
 * `verificationUrl` and the opaque `token`; this template is a pure renderer.
 */
export function renderVerifyEmail(data: SendVerifyEmailBody): EmailRenderResult {
  const { email, firstName, verificationUrl } = data;
  const greetingName = firstName?.trim() ?? 'there';

  const bodyHtml = `
    <p style="margin:0 0 12px;">Hi ${greetingName},</p>
    <p style="margin:0 0 12px;">
      Thanks for creating your ${APP_NAME} account. Please confirm
      <strong>${email}</strong> is your email address by clicking the button below.
      This link expires in 24 hours.
    </p>
    ${renderCtaButton({ href: verificationUrl, label: 'Verify email' })}
    ${renderLinkBanner({ url: verificationUrl })}
    <p class="email-muted" style="margin:16px 0 0;font-size:12px;color:#71717a;">
      If you did not create an account, you can safely ignore this email.
    </p>
  `.trim();

  return {
    subject: `Verify your email for ${APP_NAME}`,
    html: wrapLayout({
      publicUrl: env.FRONTEND_URL,
      appName: APP_NAME,
      preheader: `Confirm your email to activate your ${APP_NAME} account`,
      title: 'Verify your email',
      bodyHtml,
    }),
    text: [
      `Hi ${greetingName},`,
      ``,
      `Thanks for creating your ${APP_NAME} account.`,
      `Please confirm ${email} is your email address by opening the link below.`,
      `This link expires in 24 hours.`,
      ``,
      verificationUrl,
      ``,
      `If you did not create an account, you can safely ignore this email.`,
    ].join('\n'),
  };
}