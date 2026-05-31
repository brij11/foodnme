---
id: story-auth-09
topic: auth
sprint: 5
story_points: 1
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-31
executed_date: 2026-05-31
exec_model: opus
dependencies:
  - story-auth-01
design:
  - design/screens-auth.jsx
---

# story-auth-09 — Login "Keep me signed in" checkbox

## User story
As a returning user, I want a "keep me signed in" option on login, so that I don't have to re-authenticate every visit.

## Description
The prototype login form has a checked-by-default "Keep me signed in for 30 days" checkbox below the password field; the build dropped it. This story restores the control and wires it to session persistence. Covers DEVIATIONS.md **B6**.

## Acceptance criteria
- [x] A "Keep me signed in for 30 days" checkbox renders between the password field and the submit button, checked by default (DEVIATIONS B6) — `web/app/(auth)/login/page.tsx` renders the checkbox (default `keepSignedIn=true`) after the password block, before the Sign in button; covered by `page.test.tsx` "renders … checked by default (AC#1)" + "between the password field and the submit button (AC#1)", and e2e `login.spec.ts` (visible + checked)
- [x] The checkbox state influences session persistence (longer-lived session when checked) within the Supabase Auth `@supabase/ssr` cookie model — checked → `createClient({ persistent: true })` sets the auth-cookie `maxAge` to 30 days (`KEEP_SIGNED_IN_MAX_AGE_SECONDS` in `web/lib/supabase/client.ts`); covered by `page.test.tsx` "requests a persistent session when checked (AC#2)" + `client.test.ts` "passes a 30-day cookie maxAge when persistent (AC#2)"
- [x] Unchecking it yields a shorter/standard session — unchecked → `createClient({ persistent: false })` omits `cookieOptions`, leaving a browser-session cookie; covered by `page.test.tsx` "requests a standard (non-persistent) session when unchecked (AC#3)" + `client.test.ts` "browser-session cookie when not persistent (AC#3)"
- [x] No regression to the faithful login pieces (two-column brand panel, email/password, "Forgot?" link, terms footer, verification/reset alerts) — covered by `page.test.tsx` "keeps the faithful login pieces … (AC#4)" (Forgot link, terms footer, single Welcome-back h1) plus the unchanged story-auth-01 login e2e suite (reset/verification alerts, redirect, brand panel)

## Tasks
- [completed] Add a checked-by-default "Keep me signed in for 30 days" checkbox between the password field and submit button on the login form (AC 1)
- [completed] Wire the checkbox to session persistence within the `@supabase/ssr` cookie model (persistent vs standard session) (AC 2, 3)
- [completed] Confirm the supported session-lifetime control; if true 30-day persistence isn't configurable, scope to the closest supported behavior and record it in Notes (AC 2, 3)
- [completed] Add/adjust a test asserting the control renders and is checked by default (AC 1)

## Notes
- exec_model: opus — touches the auth/session surface and establishes a net-new session-persistence pattern (2 signals); needs care around `@supabase/ssr` cookie lifetime.
- Source: `plan/DEVIATIONS.md` B6.
- Confirm what session-lifetime control `@supabase/ssr` exposes (per `TECHNICAL-REQUIREMENTS.md §5.3` session mechanics — refresh-token rotation is on); if true 30-day persistence isn't configurable, scope the AC to the closest supported behavior and note it.
- **Session-lifetime decision (task 3):** `@supabase/ssr` exposes **no per-sign-in, server-side session-length knob**. The access-token TTL (~1h) and refresh-token rotation are fixed at the Supabase project level (TR §5.3), and a session keeps rolling via refresh regardless of this checkbox. The one client-side lever the library exposes is the **auth-cookie `maxAge`** via `cookieOptions`. The AC is therefore scoped to that: checked → persistent auth cookie with `maxAge = 30 days` (`KEEP_SIGNED_IN_MAX_AGE_SECONDS`); unchecked → no `maxAge`, i.e. a browser-**session** cookie cleared when the browser closes. So "keep me signed in" means the auth cookie survives browser restarts for up to 30 days vs. only the current browser session — the closest faithful behavior to the prototype's copy. `createClient()` with no args is unchanged for back-compat with all existing callers.
- **E2E note:** the Playwright assertion in `web/e2e/login.spec.ts` (checkbox visible + checked-by-default) is committed and runs in CI against the local Supabase stack; it was **not executed in this build environment** (the Supabase CLI / local stack is unavailable here — `supabase` not on PATH). AC#1/#3 are fully covered by the Vitest unit tests, which ran green (9 passing across `page.test.tsx` + `client.test.ts`).
