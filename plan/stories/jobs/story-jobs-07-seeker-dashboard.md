---
id: story-jobs-07
topic: jobs
sprint: 2
story_points: 3
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-26
executed_date: 2026-05-26
dependencies:
  - story-auth-07
  - story-jobs-06
design:
  - design/screens-dashboard.jsx
---

# story-jobs-07 — Seeker dashboard: applications tracker

## User story
As a seeker, I want to see every job I've applied to with the current status (submitted / reviewed / rejected), so that I can keep track of my pipeline without spreadsheets.

## Description
Build `app/dashboard/seeker/page.tsx`. Lists the seeker's own `applications` rows joined with `jobs` for title + company. Each row: status badge, job title (link to job detail), company name, applied date. Filter chips: All / Submitted / Reviewed / Rejected. Empty state encourages browsing `/jobs`.

## Acceptance criteria
- [x] Page is seeker-only via middleware
- [x] Lists own applications via RLS (`applicant_id = current user`)
- [x] Joined with `jobs` for title + company name + location
- [x] Status badges: Submitted (neutral), Reviewed (orange), Rejected (red-muted)
- [x] Filter chips: All / Submitted / Reviewed / Rejected — drives a `searchParams` filter
- [x] Empty state: "You haven't applied to any jobs yet." + link to `/jobs`
- [x] Job title links to `/jobs/[id]` (even if closed — show closed banner on detail)
- [x] Sort by `applied_at` desc by default

## Tasks
- [completed] Build `app/dashboard/seeker/page.tsx` (seeker-only via middleware) filling the seeker shell from story-auth-07
- [completed] Query own `applications` (RLS `applicant_id = current user`) joined with `jobs` for title + company_name + location; sort `applied_at desc`
- [completed] Render application rows with status badges (Submitted=neutral, Reviewed=orange, Rejected=red-muted); job title links to `/jobs/[id]`
- [completed] Filter chips All / Submitted / Reviewed / Rejected driving a `searchParams` filter
- [completed] Empty state "You haven't applied to any jobs yet." + link to `/jobs`; test seeker-only access + own-rows-only

## Notes
- No "Withdraw application" action in Phase 2 (would require a seeker-side state change). If asked for, split into its own story.
- Status set for badge mapping is `{submitted, reviewed, rejected}` (the prototype's `interview` is dropped). No Sprint-2 UI drives transitions beyond `submitted` — there is no employer applicant-review surface in scope (story-jobs-04 manages jobs, not applicant status), so rows mostly read `submitted` until a review UI ships. This story is display-only. Noted during analysis.

## Execution
- _Executed 2026-05-26: `SeekerDashboard` fills the seeker shell — own applications (joined to jobs via the service role so a closed job's title still shows; the seeker can't read closed jobs via RLS) with status badges (Submitted/Reviewed/Rejected) + filter chips driving `?status=`, sorted applied_at desc, empty state. seeker-only via middleware. 2 E2E (lists application + status + Rejected filter→empty; employer blocked)._
