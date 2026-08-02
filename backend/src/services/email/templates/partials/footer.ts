import { FONT_STACK } from './brand.js';
import type { BrandContext } from './brand.js';

/**
 * Bottom section — muted legal line + copyright.
 */
export function renderFooter({ appName }: BrandContext, year = new Date().getFullYear()): string {
  const footerNote =
    'This is an automated message — please do not reply directly to this email.';

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:separate;">
      <tr>
        <td style="padding:24px;border-top:1px solid #e4e4e7;">
          <p style="margin:0 0 8px;font-family:${FONT_STACK};font-size:12px;line-height:1.6;color:#71717a;">
            ${footerNote}
          </p>
          <p style="margin:0;font-family:${FONT_STACK};font-size:12px;line-height:1.6;color:#71717a;">
            © ${year} ${appName}. All rights reserved.
          </p>
        </td>
      </tr>
    </table>
  `.trim();
}