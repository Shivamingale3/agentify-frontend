import { describe, it, expect } from 'vitest';
import { renderVerifyEmail } from '../../src/services/email/templates/verify-email.template.js';
import { renderResetPassword } from '../../src/services/email/templates/reset-password.template.js';
import { renderTemplate } from '../../src/services/email/templates/index.js';
import type { SendVerifyEmailBody } from '../../src/types/auth.types.js';

const verifyEmailData: SendVerifyEmailBody = {
  email: 'jane.doe@example.com',
  userId: '01HQTESTUSERID00000000',
  firstName: 'Jane',
  lastName: 'Doe',
  token: '01HQTESTTOKENABCDEFGHIJKLMNOPQRSTUVWXYZ012345',
  verificationUrl:
    'http://localhost:3000/verify-email?token=01HQTESTTOKENABCDEFGHIJKLMNOPQRSTUVWXYZ012345',
};

const resetPasswordData = {
  email: 'jane.doe@example.com',
  firstName: 'Jane',
  lastName: 'Doe',
  token: '01HQRESETTOKENABCDEFGHIJKLMNOPQRSTUVWXYZ012345',
  resetUrl:
    'http://localhost:3000/reset-password?token=01HQRESETTOKENABCDEFGHIJKLMNOPQRSTUVWXYZ012345',
};

describe('renderVerifyEmail', () => {
  const result = renderVerifyEmail(verifyEmailData);

  it('returns a subject mentioning the app name', () => {
    expect(result.subject).toContain('Verify your email for');
  });

  it('html contains the verification URL', () => {
    expect(result.html).toContain(verifyEmailData.verificationUrl);
  });

  it('html contains a CTA button anchor targeting the verification URL', () => {
    expect(result.html).toMatch(
      new RegExp(`href="${verifyEmailData.verificationUrl.replace(/[?.]/g, '[$&]')}"`),
    );
  });

  it('html contains the recipient email', () => {
    expect(result.html).toContain(verifyEmailData.email);
  });

  it('html includes a dark-mode @media block', () => {
    expect(result.html).toContain('@media (prefers-color-scheme: dark)');
  });

  it('html references the logo image asset', () => {
    expect(result.html).toContain('/logo_landscape_dark.png');
  });

  it('text fallback contains the verification URL verbatim', () => {
    expect(result.text).toContain(verifyEmailData.verificationUrl);
  });

  it('text fallback is non-empty and mentions the recipient email', () => {
    expect(result.text.length).toBeGreaterThan(0);
    expect(result.text).toContain(verifyEmailData.email);
  });

  it('greets the recipient by first name when provided', () => {
    expect(result.html).toContain('Hi Jane,');
  });

  it('greets with "there" when firstName is absent', () => {
    const r = renderVerifyEmail({ ...verifyEmailData, firstName: undefined });
    expect(r.html).toContain('Hi there,');
  });

  it('renders a full HTML document', () => {
    expect(result.html.startsWith('<!DOCTYPE html>')).toBe(true);
    expect(result.html).toContain('</html>');
  });

  it('matches the inline HTML snapshot', () => {
    expect(result.html).toMatchInlineSnapshot();
  });

  it('text fallback matches the inline snapshot', () => {
    expect(result.text).toMatchInlineSnapshot();
  });
});

describe('renderResetPassword', () => {
  const result = renderResetPassword(resetPasswordData);

  it('returns a subject mentioning password reset', () => {
    expect(result.subject).toContain('Reset your');
    expect(result.subject).toContain('password');
  });

  it('html contains the reset URL', () => {
    expect(result.html).toContain(resetPasswordData.resetUrl);
  });

  it('html includes a dark-mode @media block', () => {
    expect(result.html).toContain('@media (prefers-color-scheme: dark)');
  });

  it('text fallback contains the reset URL verbatim', () => {
    expect(result.text).toContain(resetPasswordData.resetUrl);
  });

  it('renders a full HTML document', () => {
    expect(result.html.startsWith('<!DOCTYPE html>')).toBe(true);
    expect(result.html).toContain('</html>');
  });
});

describe('renderTemplate registry dispatcher', () => {
  it('renders verify-email via the registry', () => {
    const r = renderTemplate('verify-email', verifyEmailData);
    expect(r.subject).toContain('Verify your email');
  });

  it('renders reset-password via the registry', () => {
    const r = renderTemplate('reset-password', resetPasswordData);
    expect(r.subject).toContain('Reset your');
  });
});