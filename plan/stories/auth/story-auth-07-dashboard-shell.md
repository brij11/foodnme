---
id: story-auth-07
topic: auth
sprint: 2
story_points: 3
status: draft
owner: brij
tasks_populated: false
dependencies:
  - story-auth-06
design:
  - design/screens-dashboard.jsx
---

# story-auth-07 — Role-based dashboard shell with redirect at /dashboard

## User story
As a signed-in user landing on `/dashboard`, I want to be automatically routed to the dashboard for my role, so that I see the right tools immediately without picking from a menu.

## Description
Build `app/dashboard/page.tsx` (role-based redirect entry point) and the three role-specific shells at `app/dashboard/seeker/page.tsx`, `app/dashboard/employer/page.tsx`, `app/dashboard/expert/page.tsx`. The entry-point page reads `profiles.role` and redirects to the matching shell. Each shell renders the layout from `design/screens-dashboard.jsx` with empty/placeholder content — populated by later stories (`story-jobs-04`, `story-jobs-07`, `story-experts-04`).

## Acceptance criteria
- [ ] `/dashboard` reads `profiles.role` and 302s to `/dashboard/seeker` | `/employer` | `/expert`
- [ ] Each shell has a role-specific header, sidebar/tab structure, and an empty-content slot
- [ ] Empty state on first visit: title + message + relevant CTA (e.g., for employer: "Post your first job")
- [ ] Sign-out button in the header calls `supabase.auth.signOut()` and redirects to `/`
- [ ] Pages are `no-cache`
- [ ] Middleware (`story-auth-06`) prevents cross-role access — confirmed by integration test
- [ ] Layout matches `design/screens-dashboard.jsx`

## Tasks
<!-- Populated by the downstream task-breakdown step, not by this skill.
     Each task should map to one or more acceptance criteria above and be
     small enough to land in a single commit. Until populated, this section
     stays as the single TODO line below. -->
- [ ] TODO — break this story into implementation tasks

## Notes
- Role-based UI conventions per `UI-DESIGN-HANDOFF.md` §3.3 and §3.8.
- Dashboard content lives in topic-specific stories — this story only puts up empty shells.
