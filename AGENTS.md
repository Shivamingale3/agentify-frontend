<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## The backend is Spring Boot, not Node

`agentify-backend` is a Java 21 / Spring Boot service (package `com.botify.api`),
served on **port 5002** under the `/api/v1` prefix. `BACKEND_URL` in `.env`
must therefore be `http://localhost:5002/api/v1`.

Files worth knowing, all under `agentify-backend/src/main/java/com/botify/api/`:

| Concern | Location |
| --- | --- |
| Endpoints | `controller/AuthController.java`, `controller/UserController.java` |
| Request validation | `dto/request/*.java` (Bean Validation annotations) |
| Response envelopes | `dto/response/ApiResponse.java`, `dto/response/ErrorResponse.java` |
| Error codes | `enums/ErrorCode.java` |
| Status mapping | `exception/GlobalExceptionHandler.java` |
| Password policy | `service/PasswordPolicyService.java`, `config/PasswordPolicyProperties.java` |
| Session cookies | `security/AuthCookieService.java` |
| Emails | `service/EmailServiceImpl.java` |

## Auth / validation contract

The backend is the source of truth. When changing `lib/validations/*.ts`,
mirror the constraints in `dto/request/*.java` and the password policy in
`application.properties` (`security.password-policy.*`). Error *messages* may
differ on the frontend for per-rule UX, but the *rules* must match. Current
shared limits, duplicated in `lib/constants/index.ts`:

- password 8–16 chars, needs upper + lower + digit + special
- email ≤ 254 chars
- first/last name 3–50 chars, both optional

Response shapes in `lib/types/index.ts` mirror `dto/response/`. Two details
that are easy to get wrong:

- **Errors use `errors`, not `fieldErrors`** — `Record<string, string>`, one
  message per field, not an array.
- **Validation failures answer 422**, not 400. 400 is reserved for a body the
  server could not parse or bind.

## Sessions are cookie-only

Login returns **no tokens in the body**. Both the JWT access token
(`access_token`, ~15 min) and the opaque refresh token (`refresh_token`,
~30 days) are HttpOnly cookies, so browser JavaScript can never read them.

The frontend does **not** implement token refresh. When an access token is
missing or expired, `JwtAuthenticationFilter` rotates the refresh token
server-side and writes fresh cookies onto the same response. Consequences:

- Any route handler that touches the session must pass `session: true` to
  `forwardToBackend`, which forwards the browser's cookies upstream and relays
  `Set-Cookie` back. Without it the rotated cookies are silently dropped.
- `proxy.ts` treats *either* cookie as a live session. Gating on `access_token`
  alone would bounce users to `/login` every 15 minutes.
- `/api/v1/auth/**` is excluded from transparent renewal — those endpoints
  manage the session explicitly.

## Email link formats

Built in `EmailServiceImpl`; the frontend must have a page at each target.

| Mail | Link | Page |
| --- | --- | --- |
| Verify address | `/verify-email?token=…` | `app/(auth)/verify-email/page.tsx` |
| Reset password | `/reset-password/<token>` | `app/(auth)/reset-password/[token]/page.tsx` |
| Confirm email change | `/confirm-email?token=…` | `app/(auth)/confirm-email/page.tsx` |

Note the reset link is a **path segment**, not a query parameter, so the
single-use token never reaches a `Referer` header.

## Email templates — brand consistency

Outbound HTML is inlined in `EmailServiceImpl.textBlock`. Its design tokens
mirror this frontend's `app/globals.css` **light** theme: Oxanium with a system
fallback, monochrome surfaces (`#ffffff` page, `#f6f6f7` card, `#0a0a0a` text,
`#6b6b70` muted, `#000000` button), square corners. The theme is deliberately
monochrome — there is no accent colour. When you change the frontend theme,
mirror the values in the `COLOR_*` constants in `EmailServiceImpl`.
<!-- END:nextjs-agent-rules -->
