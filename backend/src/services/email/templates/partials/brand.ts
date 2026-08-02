/**
 * Brand design tokens shared across every email template.
 *
 * Values mirror `frontend/app/globals.css` so emails stay on-brand. Kept pure
 * (no DOM) so they work in plain string-concat HTML email rendering.
 */

/**
 * Primary brand purple — matches `--primary` on `:root` in globals.css
 * (`oklch(0.496 0.265 301.924)`).
 *
 * Reasoned about as a hex fallback because many email clients cannot render
 * `oklch()`: oklch(0.496 0.265 301.924) ≈ #6d28d9 (a vivid purple).
 */
export const BRAND = {
  primary: '#6d28d9',
  primaryHover: '#5b21b6',
  primaryForeground: '#f5f3ff',
  foreground: '#1c1917',
  mutedForeground: '#71717a',
  border: '#e4e4e7',
  background: '#ffffff',
  surface: '#fafafa',
} as const;

/**
 * Font stack. Oxanium is the app's heading font but web fonts are not reliably
 * loaded in email, so we fall back to the closest web-safe sans family.
 */
export const FONT_STACK =
  "'Oxanium', 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif";

/** Max content width for the email shell (mobile-safe). */
export const EMAIL_CONTENT_WIDTH = 560;

/** Dev-friendly absolute public asset URL base — passed in from env at render. */
export interface BrandContext {
  publicUrl: string;
  appName: string;
}