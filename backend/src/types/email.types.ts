import type { SendVerifyEmailBody } from './auth.types.js';

/**
 * Identifier for a registered HTML email template.
 * Add a new value here when adding a template, and register it in
 * `src/services/email/templates/index.ts`.
 */
export type EmailTemplateName = 'verify-email' | 'reset-password';

/**
 * Per-template payload map. TypeScript enforces the right shape for each
 * template at the call site of `renderTemplate` / `sendEmail`.
 */
export interface EmailTemplateData {
  'verify-email': SendVerifyEmailBody;
  /**
   * Reset-password payload. Mirrors the verify-email contract (pre-built URL
   * + opaque token supplied by the producer) so the template remains a pure
   * renderer. Producer/worker wiring for this template is deferred —
   * template-only by design for now.
   */
  'reset-password': {
    email: string;
    firstName?: string;
    lastName?: string;
    token: string;
    resetUrl: string;
  };
}

/**
 * Result of rendering a template — the three fields nodemailer expects.
 */
export interface EmailRenderResult {
  subject: string;
  html: string;
  text: string;
}

/**
 * Arguments to the single email-sending entrypoint.
 */
export interface SendEmailArgs<TName extends EmailTemplateName> {
  to: string;
  templateName: TName;
  data: EmailTemplateData[TName];
}