import { BRAND, FONT_STACK } from './brand.js';

/**
 * Link banner — bordered box that shows the raw URL as user-selectable text
 * plus a decorative "Copy" pill beside it.
 *
 * Per product decision (option a), the Copy pill is intentionally non-
 * functional: it has no `onclick`/JS (email clients strip `<script>` and
 * `navigator.clipboard` is unavailable). It exists solely as a visual affordance
 * that signals "you can copy this URL here"; users select the URL text and use
 * their client's native copy. The actual functional Copy button lives on the
 * landing page the link opens.
 */
export function renderLinkBanner({ url }: { url: string; copyLabel?: string }): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;margin:8px 0 0;border-collapse:separate;">
      <tr>
        <td style="padding:12px 16px;background:${BRAND.surface};border:1px solid ${BRAND.border};border-radius:4px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:separate;">
            <tr>
              <td style="vertical-align:middle;width:90%;">
                <p style="margin:0;font-family:${FONT_STACK};font-size:13px;line-height:1.5;color:${BRAND.foreground};word-break:break-all;">
                  ${url}
                </p>
              </td>
              <td style="vertical-align:middle;width:10%;text-align:right;white-space:nowrap;">
                <span style="display:inline-block;padding:6px 10px;font-family:${FONT_STACK};font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:${BRAND.primary};background:${BRAND.primaryForeground};border:1px solid ${BRAND.primary};border-radius:4px;">
                  Copy
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `.trim();
}