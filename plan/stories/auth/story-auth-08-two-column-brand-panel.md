---
id: story-auth-08
topic: auth
sprint: 4
story_points: 3
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-30
executed_date: 2026-05-30
dependencies:
  - story-auth-01
  - story-auth-02
  - story-auth-04
design:
  - design/screens-auth.jsx
---

# story-auth-08 — Auth pages two-column brand/benefits panel

## User story
As a visitor signing in or registering, I want the auth pages to reinforce what foodnme offers, so that the moment of committing an account feels trustworthy and on-brand.

## Description
The login, register, and reset-password pages currently render form-only inside `AuthShell`. The prototype `screens-auth.jsx` pairs the form with a left brand/benefits panel (logo, headline, intro, feature bullets). Extend `AuthShell` (or add a shared auth layout) to render the two-column treatment on desktop, collapsing to form-only on mobile, across all three auth pages.

## Acceptance criteria
- [x] Login, register, and reset-password render a two-column layout on desktop: left brand/benefits panel + right form — `AuthShell.test.tsx` (grid `lg:grid-cols-2`), E2E `auth-brand-panel.spec.ts` (panel + form visible at 1280px on all three routes)
- [x] Left panel includes the foodnme brand, a headline, intro copy, and a feature list with check icons per `screens-auth.jsx` — `AuthShell.test.tsx` per-context heading + feature-list parity + check-icon svg assertion
- [x] Layout collapses to form-only (panel hidden) on mobile without layout shift — `AuthShell.test.tsx` (`hidden lg:flex`), E2E asserts panel hidden / form h1 visible at 375px on all three routes
- [x] All existing form behavior preserved (validation, unverified-email resend, reset states, role picker) — verification-only story; existing `login/register/reset-password` specs unchanged and green
- [x] Shared via a single auth layout/`AuthShell` change — not duplicated per page — confirmed all three pages consume `<AuthShell context=…>`; copy lives once in `AuthShell.PANELS`
- [x] Green only on actionable elements; no emoji; accessible heading order — `AuthShell.test.tsx` asserts single form h1 + single panel h2 and no emoji (`\p{Extended_Pictographic}`) in panel copy

## Tasks
- [completed] Verify `AuthShell` renders the two-column desktop layout (`lg:grid-cols-2`, brand panel + form) on `/login`, `/register`, and `/reset-password`
- [completed] Verify the left panel content per `context` (brand, headline, intro, feature list with check icons) matches `screens-auth.jsx` copy for all three surfaces
- [completed] Verify the panel collapses to form-only below `lg` (`hidden lg:flex`) with no layout shift, and form behavior (validation, unverified-email resend, reset states, role picker) is intact
- [completed] Verify accessibility: single `h1` per form, panel `h2`, correct heading order; green confined to actionable elements; no emoji
- [completed] Add/confirm a test asserting the panel is present at desktop width and hidden at mobile width across the three auth routes

## Notes
- Analysis finding (2026-05-30): the two-column brand panel is **already implemented** in `web/components/auth/AuthShell.tsx` (shipped under story-auth-01) and consumed by all three auth pages via `<AuthShell context="…">`. The original audit note ("brand panel missing on all three auth pages", gaps #9/#10/#11) is **stale** — this story is therefore scoped to **verification-only** parity confirmation, not new implementation.
- Pure presentation; no schema/API impact. Docs already cover this (no `TECHNICAL-REQUIREMENTS.md` / `UI-DESIGN-HANDOFF.md` change needed).
