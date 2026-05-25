---
id: story-auth-03
topic: auth
sprint: 2
story_points: 2
status: draft
owner: brij
tasks_populated: false
dependencies:
  - story-auth-02
design:
  - design/screens-auth.jsx
---

# story-auth-03 — Email verification callback page + login gate

## User story
As a newly-registered user, I want to click the verification link in my email and land on a friendly confirmation page that drops me straight into my dashboard, so that the verification step feels seamless.

## Description
Configure Supabase email-confirmation redirect URL to `/auth/callback`. Build `app/(auth)/callback/route.ts` (route handler) that exchanges the confirmation `code` for a session, then redirects to `/dashboard`. Add a login gate: unverified users attempting to sign in receive an inline error pointing them back to the verification email + resend button.

## Acceptance criteria
- [ ] `app/(auth)/callback/route.ts` calls `supabase.auth.exchangeCodeForSession(code)`
- [ ] On success: 302 redirect to `/dashboard`
- [ ] On failure: 302 redirect to `/login?error=verification_failed`
- [ ] Login attempt with unverified email: inline error "Please verify your email — check your inbox or resend the link." with resend button
- [ ] Resend uses `supabase.auth.resend({ type: 'signup', email })` and disables the button for 30 seconds
- [ ] Verification email subject + body match the project's voice (no exclamations, no emoji per `UI-DESIGN-HANDOFF.md` §4.3)
- [ ] Page is `no-cache`

## Tasks
<!-- Populated by the downstream task-breakdown step, not by this skill.
     Each task should map to one or more acceptance criteria above and be
     small enough to land in a single commit. Until populated, this section
     stays as the single TODO line below. -->
- [ ] TODO — break this story into implementation tasks

## Notes
- Email-verification-required gate per `TECHNICAL-REQUIREMENTS.md` §5.1.
- Resend rate-limited via Supabase's built-in 60-second window — UI mirrors with a 30s button disable for clarity.
