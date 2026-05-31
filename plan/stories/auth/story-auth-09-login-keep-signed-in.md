---
id: story-auth-09
topic: auth
sprint: 5
story_points: 1
status: in-progress
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-31
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
- [ ] A "Keep me signed in for 30 days" checkbox renders between the password field and the submit button, checked by default (DEVIATIONS B6; `web/app/(auth)/login/page.tsx:159-177` vs `design/screens-auth.jsx:86-88`)
- [ ] The checkbox state influences session persistence (longer-lived session when checked) within the Supabase Auth `@supabase/ssr` cookie model
- [ ] Unchecking it yields a shorter/standard session
- [ ] No regression to the faithful login pieces (two-column brand panel, email/password, "Forgot?" link, terms footer, verification/reset alerts)

## Tasks
- [started] Add a checked-by-default "Keep me signed in for 30 days" checkbox between the password field and submit button on the login form (AC 1)
- [new] Wire the checkbox to session persistence within the `@supabase/ssr` cookie model (persistent vs standard session) (AC 2, 3)
- [new] Confirm the supported session-lifetime control; if true 30-day persistence isn't configurable, scope to the closest supported behavior and record it in Notes (AC 2, 3)
- [new] Add/adjust a test asserting the control renders and is checked by default (AC 1)

## Notes
- exec_model: opus — touches the auth/session surface and establishes a net-new session-persistence pattern (2 signals); needs care around `@supabase/ssr` cookie lifetime.
- Source: `plan/DEVIATIONS.md` B6.
- Confirm what session-lifetime control `@supabase/ssr` exposes (per `TECHNICAL-REQUIREMENTS.md §5.3` session mechanics — refresh-token rotation is on); if true 30-day persistence isn't configurable, scope the AC to the closest supported behavior and note it.
