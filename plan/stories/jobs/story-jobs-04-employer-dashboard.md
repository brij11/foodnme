---
id: story-jobs-04
topic: jobs
sprint: 2
story_points: 4
status: draft
owner: brij
tasks_populated: false
dependencies:
  - story-auth-07
  - story-jobs-03
design:
  - design/screens-dashboard.jsx
---

# story-jobs-04 — Employer dashboard: post-job modal + manage listings

## User story
As an employer, I want to post a new job and see my existing listings (pending, active, closed) with their applicant counts, so that I can manage my hiring pipeline from one screen.

## Description
Build the employer dashboard at `app/dashboard/employer/page.tsx` with two surfaces: (1) "Post a Job" button opening the `PostJobModal` from `design/screens-dashboard.jsx`, posting to `/api/jobs` (story-jobs-03); (2) a list of the employer's own jobs grouped by status, each row showing title, status badge, applicant count, posted date, and quick actions (View, Edit, Close).

## Acceptance criteria
- [ ] Page enforced employer-only via middleware (story-auth-06)
- [ ] "Post a Job" CTA opens modal; modal focus-trapped; closes on Esc / overlay / success
- [ ] Modal form fields match `story-jobs-03` Zod schema; submit POSTs there
- [ ] On success: modal closes, list refreshes (revalidatePath or client refetch)
- [ ] Job list shows the employer's own rows only (RLS enforces `employer_id = current user`)
- [ ] Status badges: Pending (orange), Active (green), Closed (neutral)
- [ ] Applicant count joins on `applications` count where `job_id = job.id`
- [ ] "Close" action calls `PATCH /api/jobs/:id` with `status='closed'`
- [ ] Empty state when no jobs: "Post your first job to start receiving applications." + CTA

## Tasks
<!-- Populated by the downstream task-breakdown step, not by this skill.
     Each task should map to one or more acceptance criteria above and be
     small enough to land in a single commit. Until populated, this section
     stays as the single TODO line below. -->
- [ ] TODO — break this story into implementation tasks

## Notes
- `PATCH /api/jobs/:id` endpoint per `TECHNICAL-REQUIREMENTS.md` §6.2 — implementation folded into this story (small surface; just status + skills edits).
- Edit-listing flow could grow into its own story later; for now Edit re-opens the modal pre-filled.
