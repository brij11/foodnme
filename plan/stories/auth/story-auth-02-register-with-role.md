---
id: story-auth-02
topic: auth
sprint: 2
story_points: 4
status: draft
owner: brij
tasks_populated: false
dependencies:
  - story-homepage-02
design:
  - design/screens-auth.jsx
---

# story-auth-02 — Register page with role picker (seeker / employer / expert) + email verification trigger

## User story
As a new user, I want to register once and pick my role (seeker / employer / expert) at signup, so that the dashboard immediately fits what I came to do.

## Description
Build `app/(auth)/register/page.tsx` per `design/screens-auth.jsx` (RegisterPage). Form: full name + email + password + role radio (seeker / employer / expert) + Sign Up button. On submit: `supabase.auth.signUp({ email, password, options: { data: { full_name, role } } })`. Supabase sends verification email; user is shown "Check your inbox" state. Login is blocked until verified per `story-auth-03`.

## Acceptance criteria
- [ ] `/register` renders per design with name + email + password + role picker
- [ ] Role options exactly: Job Seeker, Employer, Expert
- [ ] Password validation: min 8 chars (per `TECHNICAL-REQUIREMENTS.md` §5.1)
- [ ] On submit: `supabase.auth.signUp` with `full_name` and `role` in `user_metadata`
- [ ] On success: form replaced by "Check your inbox to verify your email." state with resend link
- [ ] On failure (duplicate email): "An account with this email already exists. Try signing in."
- [ ] Resend verification link calls `supabase.auth.resend({ type: 'signup', email })`
- [ ] Page is `no-cache`
- [ ] No social login buttons (Phase 2 scope, per blueprint §5)
- [ ] Zod-validated client-side; server-side validation re-runs in `story-auth-05` post-signup trigger

## Tasks
<!-- Populated by the downstream task-breakdown step, not by this skill.
     Each task should map to one or more acceptance criteria above and be
     small enough to land in a single commit. Until populated, this section
     stays as the single TODO line below. -->
- [ ] TODO — break this story into implementation tasks

## Notes
- Role choice persisted in BOTH `auth.users.user_metadata.role` AND `profiles.role` per `TECHNICAL-REQUIREMENTS.md` §5.2. The `profiles` row insertion lives in `story-auth-05` (DB trigger on `auth.users` insert).
- Email verification REQUIRED before first login — see `TECHNICAL-REQUIREMENTS.md` §5.1.
- No social login per blueprint §5 — do NOT add Google/LinkedIn buttons.
