---
id: story-auth-06
topic: auth
sprint: 2
story_points: 3
status: draft
owner: brij
tasks_populated: false
dependencies:
  - story-auth-05
design: none-needed
---

# story-auth-06 — Middleware route gating (/admin/*, /dashboard/*, role redirects)

## User story
As a logged-in user, I want the URL to enforce my role and admin status, so that I can never accidentally see a screen I don't have access to.

## Description
Implement `middleware.ts` per `TECHNICAL-REQUIREMENTS.md` §5.4. Uses the middleware Supabase client to read the session, then enforces:
- `/admin/*` → require `profiles.is_admin = true`, else 302 to `/dashboard`
- `/dashboard/*` → require authenticated user, else 302 to `/login?redirect=<original>`
- `/dashboard/seeker/*` → require `role = 'seeker'`, else 302 to user's own dashboard
- `/dashboard/employer/*` → require `role = 'employer'`
- `/dashboard/expert/*` → require `role = 'expert'`
- All other paths: no auth check.

## Acceptance criteria
- [ ] Middleware reads session via `@supabase/ssr` middleware client
- [ ] Unauthed `/dashboard/*` request → 302 `/login?redirect=<encoded path>`
- [ ] Non-admin `/admin/*` request → 302 `/dashboard`
- [ ] Cross-role `/dashboard/employer/*` access by a seeker → 302 `/dashboard/seeker`
- [ ] Session cookie refreshed if the access token is near expiry (refresh-token rotation per §5.3)
- [ ] Role read from JWT `user_metadata.role` (cheap projection) — falls back to `profiles.role` query if missing
- [ ] Public paths (e.g. `/`, `/blog`, `/templates`) pass through with no Supabase round-trip
- [ ] Integration test asserts each redirect path

## Tasks
<!-- Populated by the downstream task-breakdown step, not by this skill.
     Each task should map to one or more acceptance criteria above and be
     small enough to land in a single commit. Until populated, this section
     stays as the single TODO line below. -->
- [ ] TODO — break this story into implementation tasks

## Notes
- Gating matrix per `TECHNICAL-REQUIREMENTS.md` §5.4.
- Open-redirect prevention applies here too: `redirect=` param sanitized to internal paths only — same allowlist as `story-auth-01`.
- Cookie sync only — no business logic in middleware per `TECHNICAL-REQUIREMENTS.md` §5.3.
