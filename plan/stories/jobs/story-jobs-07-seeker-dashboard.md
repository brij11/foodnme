---
id: story-jobs-07
topic: jobs
sprint: 2
story_points: 3
status: draft
owner: brij
tasks_populated: false
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
- [ ] Page is seeker-only via middleware
- [ ] Lists own applications via RLS (`applicant_id = current user`)
- [ ] Joined with `jobs` for title + company name + location
- [ ] Status badges: Submitted (neutral), Reviewed (orange), Rejected (red-muted)
- [ ] Filter chips: All / Submitted / Reviewed / Rejected — drives a `searchParams` filter
- [ ] Empty state: "You haven't applied to any jobs yet." + link to `/jobs`
- [ ] Job title links to `/jobs/[id]` (even if closed — show closed banner on detail)
- [ ] Sort by `applied_at` desc by default

## Tasks
<!-- Populated by the downstream task-breakdown step, not by this skill.
     Each task should map to one or more acceptance criteria above and be
     small enough to land in a single commit. Until populated, this section
     stays as the single TODO line below. -->
- [ ] TODO — break this story into implementation tasks

## Notes
- No "Withdraw application" action in Phase 2 (would require a seeker-side state change). If asked for, split into its own story.
