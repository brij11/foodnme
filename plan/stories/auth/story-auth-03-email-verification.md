---
id: story-auth-03
topic: auth
sprint: 2
story_points: 2
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-26
executed_date: 2026-05-26
dependencies:
  - story-auth-02
design:
  - design/screens-auth.jsx
---

# story-auth-03 — Email verification callback page + login gate

## User story
As a newly-registered user, I want to click the verification link in my email and land on a friendly confirmation page that drops me straight into my dashboard, so that the verification step feels seamless.

## Description
Configure Supabase email-confirmation redirect URL to `/auth/callback`. Build `app/auth/callback/route.ts` (route handler — a literal `auth` segment, not the `(auth)` route group, so it serves the URL `/auth/callback`) that exchanges the confirmation `code` for a session, then redirects to `/dashboard`. Add a login gate: unverified users attempting to sign in receive an inline error pointing them back to the verification email + resend button.

## Acceptance criteria
- [x] `app/auth/callback/route.ts` (serves URL `/auth/callback`) calls `supabase.auth.exchangeCodeForSession(code)` — `callback/route.test.ts`
- [x] On success: 302 redirect to `/dashboard` — `callback/route.test.ts` "valid code → … /dashboard"
- [x] On failure: 302 redirect to `/login?error=verification_failed` — `callback/route.test.ts` (exchange-failure + missing-code) + `auth-verification.spec.ts`
- [x] Login attempt with unverified email (Supabase `email_not_confirmed` error): inline error "Please verify your email — check your inbox or resend the link." with resend button. This is the explicit exception to `story-auth-01`'s generic-error rule (decided during analysis). — `auth-verification.spec.ts` "login with an unverified email"
- [x] Resend uses `supabase.auth.resend({ type: 'signup', email })` and disables the button for 30 seconds — `auth-verification.spec.ts` asserts the disabled `resend in {n}s` countdown
- [x] Verification email subject + body match the project's voice (no exclamations, no emoji per `UI-DESIGN-HANDOFF.md` §4.3) — `supabase/templates/confirmation.html` + `[auth.email.template.confirmation]`; verified live via Mailpit (subject "Confirm your foodnme email")
- [x] Page is `no-cache` — callback route + login are `force-dynamic`

## Tasks
- [completed] Configure the Supabase email-confirmation redirect URL to `/auth/callback` (Supabase Auth settings / config)
- [completed] Build `app/auth/callback/route.ts` — `exchangeCodeForSession(code)`; success → 302 `/dashboard`; failure → 302 `/login?error=verification_failed`
- [completed] Login gate: detect `email_not_confirmed` on `signInWithPassword` → inline "Please verify your email…" + resend button calling `supabase.auth.resend({ type: 'signup', email })`, button disabled 30s
- [completed] Render the `error=verification_failed` banner on the login page from the query param
- [completed] Customize the Supabase signup verification email template copy to project voice — no exclamations, no emoji (`UI-DESIGN-HANDOFF.md` §4.3)
- [completed] Test: callback route success + failure redirect targets; unverified-login shows resend path

## Notes
- Email-verification-required gate per `TECHNICAL-REQUIREMENTS.md` §5.1.
- Resend rate-limited via Supabase's built-in 60-second window — UI mirrors with a 30s button disable for clarity.
- _Executed 2026-05-26: `app/auth/callback/route.ts` (literal segment, `force-dynamic`) exchanges the code and 302s to `/dashboard`, else `/login?error=verification_failed`. Login page extended with a 30s resend cooldown + the `verification_failed` banner. Email template `supabase/templates/confirmation.html` wired via `[auth.email.template.confirmation]` (project voice). The redirect target is set per-call via `emailRedirectTo` in story-auth-02's `signUp`. **Config (`config.toml`):** added the confirmation template + raised local GoTrue rate limits (`sign_in_sign_ups`/`token_verifications`/`token_refresh` → 1000) so the full sprint E2E suite doesn't throttle — applied via stop/start + db reset. Verified by 3 callback unit tests + 2 E2E + live Mailpit subject check. Full register→verify-link→dashboard happy path lands with the seeker critical-flow E2E once dashboards exist (story-auth-07)._
