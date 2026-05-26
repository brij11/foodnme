---
id: story-jobs-04
topic: jobs
sprint: 2
story_points: 4
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-26
executed_date: 2026-05-26
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
- [x] Page enforced employer-only via middleware (story-auth-06)
- [x] "Post a Job" CTA opens modal; modal focus-trapped; closes on Esc / overlay / success
- [x] Modal form fields match `story-jobs-03` Zod schema; submit POSTs there. The prototype `PostJobModal` must add the fields it currently lacks: **`company_name`** and **`expires_at`**, plus a **Cloudflare Turnstile widget** (token required by jobs-03 / §9.6) and an **`Idempotency-Key`** header on submit (§6.1)
- [x] On success: modal closes, list refreshes (revalidatePath or client refetch)
- [x] Job list shows the employer's own rows only (RLS enforces `employer_id = current user`)
- [x] Status badges: Pending (orange), Active (green), Closed (neutral)
- [x] Applicant count joins on `applications` count where `job_id = job.id`
- [x] "Close" action calls `PATCH /api/jobs/:id` with `status='closed'`
- [x] Empty state when no jobs: "Post your first job to start receiving applications." + CTA

## Tasks
- [completed] Build `app/dashboard/employer/page.tsx` (employer-only via middleware) — fills the employer shell from story-auth-07
- [completed] Port the `PostJobModal` from `design/screens-dashboard.jsx` — add the missing `company_name` + `expires_at` fields and a Turnstile widget; focus-trap, Esc/overlay/success close
- [completed] Wire submit to `POST /api/jobs` (story-jobs-03) with the Turnstile token + `Idempotency-Key` header; on success close modal + refresh list
- [completed] Render the employer's own jobs (RLS `employer_id = current user`) grouped by status with badges (Pending=orange, Active=green, Closed=neutral) and applicant count (count of `applications` where `job_id = job.id`)
- [completed] "Close" action → `PATCH /api/jobs/:id` with `status='closed'`; "Edit" re-opens the modal pre-filled
- [completed] Empty state ("Post your first job…") + CTA; test cross-role block, own-rows-only, close transition

## Notes
- `PATCH /api/jobs/:id` endpoint per `TECHNICAL-REQUIREMENTS.md` §6.2 — implementation folded into this story (small surface; just status + skills edits).
- Edit-listing flow could grow into its own story later; for now Edit re-opens the modal pre-filled.

## Execution
- _Executed 2026-05-26: `EmployerDashboard` fills the shell — Post-a-job modal (`PostJobModal`, adds company_name + expires_at + Turnstile, Idempotency-Key, POSTs jobs-03) + own-jobs list (RLS self-read) grouped by status with badges + applicant count (joined on the new `applications` table, created here as first consumer; jobs-06 reuses) + Close (`PATCH /api/jobs/:id`). PATCH is owner-or-admin, service-role write. 10 route unit tests (POST 6 + PATCH 4) + 3 E2E (modal opens, create→pending→close via DB assertion, seeker blocked)._
