---
id: story-auth-04
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

# story-auth-04 — Reset password (request + confirm pages)

## User story
As a user who forgot their password, I want to request a reset email and set a new password from a one-time link, so that I can regain access without contacting the founder.

## Description
Build two pages: `app/(auth)/reset-password/page.tsx` for the email-entry "Send reset link" form, and the same path with `?token=` query handles the new-password form. Uses `supabase.auth.resetPasswordForEmail()` and `supabase.auth.updateUser({ password })` respectively. Layout per `design/screens-auth.jsx` (ResetPasswordPage).

## Acceptance criteria
- [ ] `/reset-password` (no query) renders the "enter your email" form
- [ ] Submit calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: SITE_URL + '/reset-password' })`
- [ ] Always returns success copy ("If an account exists for that email, a reset link is on its way.") — does not reveal account existence
- [ ] `/reset-password?token=...&type=recovery` renders new-password form
- [ ] New password: confirm field + min-8-char Zod validation
- [ ] On submit: `supabase.auth.updateUser({ password })`
- [ ] On success: route to `/login?reset=success` with success banner
- [ ] On failure (expired token): inline error with link back to request a new email
- [ ] Page is `no-cache`

## Tasks
<!-- Populated by the downstream task-breakdown step, not by this skill.
     Each task should map to one or more acceptance criteria above and be
     small enough to land in a single commit. Until populated, this section
     stays as the single TODO line below. -->
- [ ] TODO — break this story into implementation tasks

## Notes
- Reset flow per `TECHNICAL-REQUIREMENTS.md` §5.5.
- "If an account exists" copy prevents enumeration via the reset form.
