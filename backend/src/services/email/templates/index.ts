import { renderVerifyEmail } from './verify-email.template.js';
import { renderResetPassword } from './reset-password.template.js';
import type {
  EmailRenderResult,
  EmailTemplateData,
  EmailTemplateName,
} from '../../../types/email.types.js';

/**
 * Functional template registry — `EmailTemplateName → TemplateFn`.
 *
 * Adding a new template:
 *   1. Add a `TemplateFn` file under `templates/<name>.template.ts`.
 *   2. Extend `EmailTemplateName` / `EmailTemplateData` in `types/email.types.ts`.
 *   3. Register it here. Done — both renderer and email service pick it up.
 *
 * No `switch` statements anywhere else: callers go through `renderTemplate()`.
 */
type TemplateFn<TName extends EmailTemplateName> = (
  data: EmailTemplateData[TName],
) => EmailRenderResult;

const templateRegistry: {
  'verify-email': TemplateFn<'verify-email'>;
  'reset-password': TemplateFn<'reset-password'>;
} = {
  'verify-email': renderVerifyEmail,
  'reset-password': renderResetPassword,
};

/**
 * Type-safe dispatcher. The generic `TName` is constrained so the compiler
 * enforces the right payload shape per template at every call site.
 */
export function renderTemplate<TName extends EmailTemplateName>(
  name: TName,
  data: EmailTemplateData[TName],
): EmailRenderResult {
  const fn = templateRegistry[name] as TemplateFn<TName>;
  return fn(data);
}

export { renderVerifyEmail, renderResetPassword };