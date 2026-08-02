import { renderLogo } from './logo.js';
import type { BrandContext } from './brand.js';

/**
 * Top section of the email — masthead + a thin divider rule.
 */
export function renderHeader({ publicUrl, appName }: BrandContext): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:separate;">
      <tr>
        <td style="padding:0 24px;">
          ${renderLogo({ publicUrl, appName })}
        </td>
      </tr>
      <tr>
        <td style="padding:0 24px;">
          <div style="height:1px;line-height:1px;font-size:1px;background:#e4e4e7;border:0;margin:0;">&nbsp;</div>
        </td>
      </tr>
    </table>
  `.trim();
}