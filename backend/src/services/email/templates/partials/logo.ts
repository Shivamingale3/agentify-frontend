import { FONT_STACK } from './brand.js';

/**
 * Renders the brand masthead — a logo image next to the wordmark text.
 *
 * Image-blocking safe: the wordmark text ("Botify" rendered from `appName`)
 * sits *beside* the image as real text, so even when images are blocked the
 * brand is still legible.
 *
 * @param publicUrl Absolute base where frontend `/public/*` assets are reachable.
 * @param appName  Brand wordmark text (e.g. "Botify").
 */
export function renderLogo({
  publicUrl,
  appName,
}: {
  publicUrl: string;
  appName: string;
}): string {
  const logoUrl = `${publicUrl.replace(/\/$/, '')}/logo_landscape_dark.png`;

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:separate;">
      <tr>
        <td style="vertical-align:middle;padding:24px 0;">
          <img src="${logoUrl}" alt="${appName} logo" width="32" height="32" style="display:inline-block;width:32px;height:32px;border:0;outline:none;text-decoration:none;vertical-align:middle;" />
          <span style="display:inline-block;margin-left:10px;vertical-align:middle;font-family:${FONT_STACK};font-size:18px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#1c1917;">
            ${appName}
          </span>
        </td>
      </tr>
    </table>
  `.trim();
}