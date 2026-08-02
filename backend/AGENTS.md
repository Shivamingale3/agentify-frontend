<!-- BEGIN:backend-agent-rules -->
# Backend conventions

## Email templates

Email templates live under `src/services/email/templates/`. Every template
must be a pure function `(data) => { subject: string; html: string; text: string }`
where `data` is typed via `EmailTemplateData` in `src/types/email.types.ts`.

To add a new template:
1. Create `src/services/email/templates/<name>.template.ts` exporting the
   render function.
2. Extend `EmailTemplateName` and `EmailTemplateData` in
   `src/types/email.types.ts`.
3. Register the function in `src/services/email/templates/index.ts`.
4. Add a snapshot test in `tests/unit/email-templates.test.ts`.

Do NOT use `switch` statements on template name anywhere outside the registry
dispatcher (`renderTemplate`). Callers go through `renderTemplate` /
`sendEmail`.

### Design tokens (brand consistency with frontend)

`src/services/email/templates/partials/brand.ts` holds the brand constants
(primary `#6d28d9`, font stack, etc.). These mirror `frontend/app/globals.css`.
When the frontend theme changes, mirror the values here too (and vice versa).

### Sending emails

All outbound mail goes through `src/services/email/email.service.ts`'s
`sendEmail()`. The transporter is supplied by `src/config/email.config.ts`'s
`getEmailTransporter()`:

- Real SMTP by default.
- In `APP_ENV=development` with `EMAIL_HOST=smtp.ethereal.email`, swaps to a
  lazily-created Ethereal test-account transporter and logs the preview URL
  per send. `verifyEmailConnection()` is a no-op in this mode.

### Queued email jobs

Email sending is asynchronous via the BullMQ `email-jobs-queue` in
`src/config/queue.config.ts`. Producers (`postRegisterService`, future ones)
must be **fire-and-forget**: errors are logged and swallowed so a transient
infra failure never breaks the user-facing operation that triggered the email.
The worker renders via the registry and calls `sendEmail`; BullMQ owns retry.
Add a `failed` listener (already wired) for structured logging only — do not
throw from the listener.

## Auth / validation contract

The backend is the **source of truth** for auth and form-validation contracts.
`src/validationSchemas/*.ts` defines every body/query/params schema; the
frontend mirrors these. When you change a schema here, update the frontend
counterpart in `frontend/lib/validations/*.ts` (rules must match; messages may
differ for per-rule UX).

## Single-use tokens

Opaque `ulid()` tokens (verification, password reset, etc.) are SHA-256 hashed
before persistence — see `src/utils/hash.utils.ts` and the
`refreshTokenHash` pattern in `prisma/schema/session.prisma`. The raw token is
never stored. Redis caches the token→user mapping with a TTL as a fast path;
the DB row is the source of truth for single-use enforcement (the
`consumedAt` column). See `email-verification-token.service.ts` for the
reference implementation.
<!-- END:backend-agent-rules -->