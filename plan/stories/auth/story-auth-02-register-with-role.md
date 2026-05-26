---
id: story-auth-02
topic: auth
sprint: 2
story_points: 4
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

# story-auth-02 — Register page with role picker (seeker / employer / expert) + email verification trigger

## User story
As a new user, I want to register once and pick my role (seeker / employer / expert) at signup, so that the dashboard immediately fits what I came to do.

## Description
Build `app/(auth)/register/page.tsx` as a **single form** (not the prototype's two-step wizard — see `UI-DESIGN-HANDOFF.md` §4.11): full name + email + password + an inline role-card picker (seeker / employer / expert, reusing the prototype's `role-card` visual treatment) + Sign Up button. On submit: `supabase.auth.signUp({ email, password, options: { data: { full_name, role } } })`. Supabase sends verification email; user is shown "Check your inbox" state. Login is blocked until verified per `story-auth-03`.

## Acceptance criteria
- [x] `/register` renders as a single form adapting the design's fields (name + email + password + inline role-card picker) — collapsed from the prototype's two-step wizard per `UI-DESIGN-HANDOFF.md` §4.11 — `register.spec.ts` "renders the single-form register…" (no step indicator)
- [x] Role options exactly: Job Seeker, Employer, Expert (selectable cards using the prototype's `role-card` styling) — `register.spec.ts` asserts all three role radios
- [x] Password validation: min 8 chars (per `TECHNICAL-REQUIREMENTS.md` §5.1) — `register.spec.ts` "short password" + `register.test.ts`
- [x] On submit: `supabase.auth.signUp` with `full_name` and `role` in `user_metadata` — wired with `options.data`; the metadata→`profiles` propagation is verified by story-auth-05's smoke test, and the signup success path is `register.spec.ts` "valid signup"
- [x] On success: form replaced by "Check your inbox to verify your email." state with resend link — `register.spec.ts` "valid signup → Check your inbox"
- [x] On failure (duplicate email): "An account with this email already exists. Try signing in." — `register.spec.ts` "duplicate email" (Supabase identities-empty obfuscation handled)
- [x] Resend verification link calls `supabase.auth.resend({ type: 'signup', email })` — resend button present (`register.spec.ts`) + wired in code
- [x] Page is `no-cache` — `(auth)/layout.tsx` `force-dynamic`; build marks `/register` ƒ (Dynamic)
- [x] No social login buttons (Phase 2 scope, per blueprint §5) — `register.spec.ts` asserts zero google/linkedin buttons
- [x] Zod-validated client-side; server-side validation re-runs in `story-auth-05` post-signup trigger — `registerSchema` (`register.test.ts`) + client wiring

## Tasks
- [completed] Scaffold `app/(auth)/register/page.tsx` ('use client', `no-cache`) as a single form — name, email, password, inline role-card picker (Job Seeker / Employer / Expert) reusing the prototype `role-card` styling; AuthSidePanel context="register"; no social buttons
- [completed] Add `lib/schemas/register.ts` Zod schema (name required, email format, password min-8 per §5.1, role enum)
- [completed] Wire `supabase.auth.signUp` via `createBrowserClient` with `full_name` + `role` in `options.data` (user_metadata)
- [completed] Success state: replace form with "Check your inbox to verify your email." + resend link calling `supabase.auth.resend({ type: 'signup', email })`
- [completed] Failure handling: duplicate-email → "An account with this email already exists. Try signing in."; field-level Zod errors inline
- [completed] Unit test (Vitest) for the register Zod schema — rejects short password, bad email, missing/invalid role

## Notes
- Role choice persisted in BOTH `auth.users.user_metadata.role` AND `profiles.role` per `TECHNICAL-REQUIREMENTS.md` §5.2. The `profiles` row insertion lives in `story-auth-05` (DB trigger on `auth.users` insert).
- Email verification REQUIRED before first login — see `TECHNICAL-REQUIREMENTS.md` §5.1.
- No social login per blueprint §5 — do NOT add Google/LinkedIn buttons.
- _Executed 2026-05-26: built `app/(auth)/register/page.tsx` as a single form (role picker is an accessible `role="radiogroup"` of `role="radio"` cards, ported from the prototype `role-card`). `signUp` passes `full_name` + `role` in `options.data` and `emailRedirectTo: <origin>/auth/callback` (consumed by story-auth-03). Duplicate-email uses Supabase's identities-empty obfuscation signal. **Stack config (`supabase/config.toml`):** flipped `enable_confirmations = true` + `minimum_password_length = 8` (§5.1), broadened `additional_redirect_urls` for the callback, and raised the local `email_sent` rate limit so multi-signup E2Es don't throttle — applied via `supabase stop --no-backup && supabase start && pnpm db:reset`. Verified by 6 E2E (`register.spec.ts`, live stack) incl. axe + `register.test.ts`._
