import { BRAND, FONT_STACK, EMAIL_CONTENT_WIDTH } from './partials/brand.js';
import { renderHeader } from './partials/header.js';
import { renderFooter } from './partials/footer.js';
import type { BrandContext } from './partials/brand.js';

export interface WrapLayoutArgs extends BrandContext {
  /** Short hidden preview text (~50 chars) shown in inbox previews. */
  preheader: string;
  /** The large, uppercase heading rendered at the top of the body. */
  title: string;
  /** Inner body HTML (everything between the title and the footer). */
  bodyHtml: string;
}

/**
 * Wraps a body fragment into a full standalone HTML email document.
 *
 * Uses table-based layout for Outlook/Word-engine compatibility, inline CSS
 * everywhere (most email clients strip `<style>` from `<body>`), and a
 * `@media (prefers-color-scheme: dark)` block kept in `<head>` (supported by
 * Apple Mail / iOS — Outlook ignores it, which is fine).
 */
export function wrapLayout({
  publicUrl,
  appName,
  preheader,
  title,
  bodyHtml,
}: WrapLayoutArgs): string {
  const header = renderHeader({ publicUrl, appName });
  const footer = renderFooter({ publicUrl, appName });

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" style="background:${BRAND.background};">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <title>${title} · ${appName}</title>
    <style>
      @media (prefers-color-scheme: dark) {
        .email-root { background-color:#18181b !important; color:#fafafa !important; }
        .email-card { background-color:#27272a !important; }
        .email-heading { color:#fafafa !important; }
        .email-text { color:#d4d4d8 !important; }
        .email-muted { color:#a1a1aa !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:${BRAND.background};font-family:${FONT_STACK};color:${BRAND.foreground};">
    <div class="email-root" style="background:${BRAND.background};padding:24px 0;">
      <!-- Hidden preheader -->
      <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${BRAND.background};opacity:0;">
        ${preheader}
      </div>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" width="100%" style="width:100%;max-width:${EMAIL_CONTENT_WIDTH}px;margin:0 auto;border-collapse:separate;">
        <tr>
          <td align="center" style="padding:0 8px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="email-card" style="width:100%;background:${BRAND.background};border:1px solid ${BRAND.border};border-radius:6px;overflow:hidden;border-collapse:separate;">
              <tr>
                <td style="padding:0;">
                  ${header}
                </td>
              </tr>
              <tr>
                <td style="padding:0 24px 12px 24px;">
                  <h1 class="email-heading" style="margin:8px 0 16px;font-family:${FONT_STACK};font-size:22px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:${BRAND.foreground};">
                    ${title}
                  </h1>
                  <div class="email-text" style="font-family:${FONT_STACK};font-size:14px;line-height:1.65;color:${BRAND.foreground};">
                    ${bodyHtml}
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:0;">
                  ${footer}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  </body>
</html>`;
}