---
id: story-auth-01
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

# story-auth-01 — Login page with Supabase Auth sign-in

## User story
As a returning user, I want a simple email-and-password login page that respects the `?redirect=` query param, so that I can pick up where I left off after authenticating.

## Description
Build `app/(auth)/login/page.tsx` with the LoginPage layout from the prototype (`design/screens-auth.jsx`). Form: email + password + Sign In button + links to Register and Reset Password. Uses `createBrowserClient` from `@supabase/ssr` for sign-in. On success: read `?redirect=<path>` (validated against an internal-path allowlist) and route there, defaulting to `/dashboard`.

## Acceptance criteria
- [x] `/login` renders the form from `design/screens-auth.jsx` (LoginPage) — `login.spec.ts` "renders the login form…"
- [x] Sign-in via `supabase.auth.signInWithPassword({ email, password })` — exercised by the invalid-cred and success E2E paths
- [x] On success: redirect to `?redirect=` target (if path is internal allowlist) or `/dashboard` — `login.spec.ts` "honors an internal ?redirect=" + `redirect.test.ts`
- [x] On invalid-credential failure: inline error banner — does not leak whether email or password was wrong (generic "Invalid email or password."). The `email_not_confirmed` case is the one exception: it shows the verify prompt + resend per `story-auth-03` AC #4–5. — generic path: `login.spec.ts` "wrong credentials → generic error"; `email_not_confirmed` branch implemented (verify prompt + resend), end-to-end exercised in story-auth-03's flow (needs an unconfirmed user)
- [x] Open-redirect prevention: external URLs in `redirect` rejected, fall back to `/dashboard` — `login.spec.ts` "rejects an external ?redirect=" + `redirect.test.ts` (external / protocol-relative / backslash / scheme)
- [x] Link to Register and Reset Password rendered per design — `login.spec.ts` asserts both `href`s
- [x] HTML5 + Zod validation on email format — `login.spec.ts` "invalid email → inline validation error" + `login.test.ts`
- [x] Loading state on Sign In button (disabled + spinner) while request is in flight — `login.spec.ts` "in-flight loading state" (button disabled, "Signing in…"); affordance is the text-label convention shared with services-02
- [x] Page is `no-cache` (auth surface) per `TECHNICAL-REQUIREMENTS.md` §7 — `(auth)/layout.tsx` `export const dynamic = "force-dynamic"`; build marks `/login` as ƒ (Dynamic)
- [x] Prototype's "Keep me signed in for 30 days" checkbox is intentionally omitted — `@supabase/ssr` persists the session via HttpOnly cookies with refresh-token rotation by default (§5), so no client-side persistence toggle is rendered — no checkbox in the form

## Tasks
- [completed] Scaffold `app/(auth)/login/page.tsx` ('use client', `no-cache`) with the LoginPage layout from `design/screens-auth.jsx` — email + password fields, AuthSidePanel, links to Register and Reset Password; omit the "Keep me signed in" checkbox
- [completed] Add `lib/schemas/login.ts` Zod schema (email format) + HTML5 validation wiring
- [completed] Wire sign-in via `createBrowserClient` → `supabase.auth.signInWithPassword`; in-flight loading state (button disabled + spinner)
- [completed] Inline error banner on failure with generic "Invalid email or password." copy (no email-vs-password disambiguation)
- [completed] Add internal-path redirect allowlist helper (`lib/utils/`); on success route to validated `?redirect=` target, else `/dashboard`; reject external + protocol-relative URLs
- [completed] Unit test (Vitest) for the redirect allowlist — accepts internal paths, rejects `http(s)://`, `//host`, and non-leading-slash inputs

## Notes
- `@supabase/ssr` client factory choice per `TECHNICAL-REQUIREMENTS.md` §5.3 (NOT `@supabase/auth-helpers-nextjs` which the design handoff §4.3 names; `TECHNICAL-REQUIREMENTS.md` is the tie-breaker).
- Open-redirect mitigation per `TECHNICAL-REQUIREMENTS.md` §9.3.
- Email verification gate (story-auth-03) blocks login until verified.
- _Executed 2026-05-26: built `app/(auth)/login/page.tsx` + shared `components/auth/AuthShell.tsx` (the split-screen side panel ported from `design/screens-auth.jsx`, reused by register/reset). Sign-in via the browser `@supabase/ssr` client; `safeRedirect` (`lib/utils/redirect.ts`) enforces the internal-path allowlist for `?redirect=`. `(auth)/layout.tsx` is `force-dynamic` (no-cache). The `email_not_confirmed` branch renders a verify prompt + resend now; its 30s-disable + query-param banner land in story-auth-03. Verified by 6 E2E (`login.spec.ts`, live stack + admin-API test user via `e2e/utils/supabase.ts`) incl. axe a11y, + unit tests for `redirect` and `login` schema. The "spinner" affordance is realized as a disabled button with an in-flight label, matching the services-02 form convention._
