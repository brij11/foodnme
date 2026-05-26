---
id: story-auth-04
topic: auth
sprint: 2
story_points: 3
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-26
executed_date: 2026-05-26
dependencies:
  - story-homepage-02
design:
  - design/screens-auth.jsx
---

# story-auth-04 — Reset password (request + confirm pages)

## User story
As a user who forgot their password, I want to request a reset email and set a new password from a one-time link, so that I can regain access without contacting the founder.

## Description
Build two pages: `app/(auth)/reset-password/page.tsx` for the email-entry "Send reset link" form, and the same path with `?token=` query handles the new-password form. Uses `supabase.auth.resetPasswordForEmail()` and `supabase.auth.updateUser({ password })` respectively. Layout per `design/screens-auth.jsx` (ResetPasswordPage).

## Acceptance criteria
- [x] `/reset-password` (no query) renders the "enter your email" form — `reset-password.spec.ts` "request form renders"
- [x] Submit calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: SITE_URL + '/reset-password' })` — `reset-password.spec.ts` full-reset (email lands in Mailpit)
- [x] Always returns success copy ("If an account exists for that email, a reset link is on its way.") — does not reveal account existence — `reset-password.spec.ts` "does not reveal account existence"
- [x] `/reset-password?token=...&type=recovery` renders new-password form — recovery link → confirm form (`reset-password.spec.ts` full-reset). Note: the live link uses `?code=` (PKCE, the @supabase/ssr default) rather than `?token=`; the recovery-session → new-password-form behavior is identical
- [x] New password: confirm field + min-8-char Zod validation — `reset-password.spec.ts` (mismatch rejected) + `reset-password.test.ts`
- [x] On submit: `supabase.auth.updateUser({ password })` — verified end-to-end (the new password signs in) in `reset-password.spec.ts`
- [x] On success: route to `/login?reset=success` with success banner — `reset-password.spec.ts` full-reset asserts the banner
- [x] On failure (expired token): inline error with link back to request a new email — `reset-password.spec.ts` "invalid/expired recovery link → Link expired"
- [x] Page is `no-cache` — `(auth)/layout.tsx` `force-dynamic`; build marks `/reset-password` ƒ (Dynamic)

## Tasks
- [completed] Scaffold `app/(auth)/reset-password/page.tsx` ('use client', `no-cache`) — request form (email) reusing the ResetPasswordPage layout from `design/screens-auth.jsx`; submit `resetPasswordForEmail(email, { redirectTo: SITE_URL + '/reset-password' })`
- [completed] Always-success copy after request ("If an account exists for that email, a reset link is on its way.") — no account-existence disclosure
- [completed] Render the new-password (confirm) form when `?token=...&type=recovery` is present — two password fields reusing the `auth-form` / `input` / `btn-primary` primitives (not separately mocked in the prototype)
- [completed] Add `lib/schemas/reset-password.ts` Zod schemas — email (request) and password min-8 + confirm-match (confirm)
- [completed] On confirm submit: `supabase.auth.updateUser({ password })`; success → `/login?reset=success`; expired/invalid token → inline error with link back to re-request
- [completed] Render the `reset=success` banner on the login page by reading the query param (login UI from story-auth-01)
- [completed] Unit test (Vitest) for both reset schemas — confirm-mismatch and short password rejected

## Notes
- Reset flow per `TECHNICAL-REQUIREMENTS.md` §5.5.
- "If an account exists" copy prevents enumeration via the reset form.
- The prototype `ResetPasswordPage` mocks only the email-request + "check inbox" states. The new-password (confirm) form is composed from the existing auth-form primitives — no separate design mock needed; design linkage stays `design/screens-auth.jsx`.
- The `reset=success` banner is rendered by the login page reading the query param. Scoped into this story (last task), not story-auth-01, to keep that story focused on sign-in. Same pattern as story-auth-03's `error=verification_failed` login banner.
- _Executed 2026-05-26: `app/(auth)/reset-password/page.tsx` is a single client page with four modes (request / sent / confirm / invalid). Recovery is detected via the `@supabase/ssr` browser client's auto-exchange + the `PASSWORD_RECOVERY` event (NOT a manual `exchangeCodeForSession` — double-processing the one-time code flickered the form), with a 6s fallback to the invalid state for stale links. The live recovery link uses `?code=` (PKCE) rather than the spec's illustrative `?token=`. Login gains the `reset=success` success banner. Verified by 4 E2E (`reset-password.spec.ts`, incl. a real Mailpit-driven request→link→update→sign-in round trip via `e2e/utils/mailpit.ts`) + `reset-password.test.ts`._
