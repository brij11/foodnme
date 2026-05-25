---
id: story-auth-01
topic: auth
sprint: 2
story_points: 3
status: draft
owner: brij
tasks_populated: false
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
- [ ] `/login` renders the form from `design/screens-auth.jsx` (LoginPage)
- [ ] Sign-in via `supabase.auth.signInWithPassword({ email, password })`
- [ ] On success: redirect to `?redirect=` target (if path is internal allowlist) or `/dashboard`
- [ ] On failure: inline error banner — does not leak whether email or password was wrong (generic "Invalid email or password.")
- [ ] Open-redirect prevention: external URLs in `redirect` rejected, fall back to `/dashboard`
- [ ] Link to Register and Reset Password rendered per design
- [ ] HTML5 + Zod validation on email format
- [ ] Loading state on Sign In button (disabled + spinner) while request is in flight
- [ ] Page is `no-cache` (auth surface) per `TECHNICAL-REQUIREMENTS.md` §7

## Tasks
<!-- Populated by the downstream task-breakdown step, not by this skill.
     Each task should map to one or more acceptance criteria above and be
     small enough to land in a single commit. Until populated, this section
     stays as the single TODO line below. -->
- [ ] TODO — break this story into implementation tasks

## Notes
- `@supabase/ssr` client factory choice per `TECHNICAL-REQUIREMENTS.md` §5.3 (NOT `@supabase/auth-helpers-nextjs` which the design handoff §4.3 names; `TECHNICAL-REQUIREMENTS.md` is the tie-breaker).
- Open-redirect mitigation per `TECHNICAL-REQUIREMENTS.md` §9.3.
- Email verification gate (story-auth-03) blocks login until verified.
