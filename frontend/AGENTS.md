<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Auth / validation contract

The backend is the source of truth for auth and form-validation contracts.
When working on `frontend/lib/validations/*.ts`, mirror the rules in
`backend/src/validationSchemas/*.ts` (and any related `constants/`, `types/`,
`services/`). Error *messages* may differ on the frontend for per-rule UX, but
the *rules* (length, regex, required fields) must match. Likewise, API response
envelopes in `frontend/lib/types` must mirror `backend/src/lib/apiResponse.ts`
and `backend/src/interfaces/api.interfaces.ts`.

## Email templates — brand consistency

Outbound HTML emails are defined in `backend/src/services/email/templates/`.
Their design tokens (Oxanium font fallback, primary purple `#6d28d9`, surface
colors) and layout (logo + wordmark masthead, footer) must stay aligned with
this frontend's `app/globals.css` and `components.json` so emails stay on-brand.
When you change the frontend theme, mirror the values in
`backend/src/services/email/templates/partials/brand.ts`.
<!-- END:nextjs-agent-rules -->
