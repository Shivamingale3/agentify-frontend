import { BRAND, FONT_STACK } from './brand.js';

/**
 * Bulletproof table-based CTA button.
 *
 * Uses nested tables (not CSS padding/margin tricks) so it degrades gracefully
 * to a usable full-width link in Outlook "Word engine" clients, and to a
 * normal styled link everywhere else. No VML `<v:roundrect>` block — keeps the
 * template source readable and still renders as a clickable, styled button.
 */
export function renderCtaButton({ href, label }: { href: string; label: string }): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0 8px;border-collapse:separate;">
      <tr>
        <td align="center" bgcolor="${BRAND.primary}" style="border-radius:4px;">
          <a href="${href}" target="_blank" rel="noopener noreferrer"
             style="display:inline-block;padding:12px 28px;font-family:${FONT_STACK};font-size:14px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:${BRAND.primaryForeground};text-decoration:none;border-radius:4px;background-color:${BRAND.primary};">
            ${label}
          </a>
        </td>
      </tr>
    </table>
  `.trim();
}