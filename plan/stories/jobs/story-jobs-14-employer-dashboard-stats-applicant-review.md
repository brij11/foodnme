---
id: story-jobs-14
topic: jobs
sprint: 4
story_points: 4
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-30
executed_date: 2026-05-30
dependencies:
  - story-jobs-04
design:
  - design/screens-dashboard.jsx
---

# story-jobs-14 — Employer dashboard stat cards + applicant review view

## User story
As an employer, I want stats on my listings and a way to review who applied, so that I can manage hiring without leaving the dashboard.

## Description
The employer dashboard (`components/dashboard/EmployerDashboard.tsx`) lists jobs but is missing the designed 4-card stats grid, and its "Applicants" tab is a placeholder ("a per-applicant review view ships next"). Add the stats row and a real applicant review view per `screens-dashboard.jsx`: a list of applicants per listing with name, applied date, resume link, and status, scoped by RLS to the employer's own jobs.

## Acceptance criteria
- [x] Employer dashboard renders the design's 4-card stats grid: Active listings, Total applicants, Pending review, Avg. time to hire — `employer-stats` grid; `EmployerDashboard.test.tsx` + `e2e/employer-applicants.spec.ts`
- [x] "Applicants" tab renders a real list (no placeholder) of applicants across the employer's listings — `ApplicantsView` list; E2E asserts the row
- [x] Each applicant row shows candidate name, the role applied to, applied date, resume link (signed URL), and application status — page joins `public_profiles` for names; unit + E2E assert name/role/date/status/resume link
- [x] Employer can view an applicant's resume via a short-lived signed Storage URL (auth + RLS enforced; no public exposure) — resumes bucket switched to **private** (`20260530000006_resumes_private.sql`); page creates 300s service-role signed URLs; E2E uploads a real resume and asserts the link carries a `token=`
- [x] Data is scoped to the employer's own jobs via RLS / service-role aggregation; an employer never sees another employer's applicants — applications fetched `in(jobIds)` of the employer's own jobs; E2E with two employers asserts Emp1 never sees Emp2's "Seeker Two"
- [x] Empty state when a listing has no applicants — `ApplicantsView` renders `EmptyState` when none; unit asserts it
- [x] "Avg. time to hire" renders "—" because hire-event tracking is not yet modeled; a code comment flags the future tracking story — never a fabricated number — renders "—" with a code comment; unit asserts the single "—"

## Tasks
- [completed] Add the 4-card stats grid to `EmployerDashboard.tsx`: Active listings, Total applicants, Pending review, Avg. time to hire ("—")
- [completed] Compute Active listings / Total applicants / Pending review from the employer's own jobs + applications (RLS / employer-of-job scope)
- [completed] Replace the "Applicants" tab placeholder with a real list across the employer's listings: candidate name (via `public_profiles`), role applied to, applied date, status
- [completed] Add resume viewing via a short-lived signed Storage URL (auth + RLS enforced; no public exposure) — resumes bucket made private + service-role signed URLs
- [completed] Add empty state for a listing with no applicants; ensure no cross-employer data leakage
- [completed] Render "Avg. time to hire" as "—" with a comment referencing a future tracking story (no fabricated value)
- [completed] Add tests: stats correctness, RLS employer-scoping, signed-URL access control, empty state

## Notes
- Audit gap #16 Employer (Major): stats missing + Applicants tab stubbed.
- Uses existing `applications` + `public_profiles` (§4.2) for candidate display fields; no new schema. Reuses the `resume` signed-URL pattern from §6.2 `/api/upload`/applications.
- Analysis 2026-05-30: kept the four design-contract cards (UI-DESIGN-HANDOFF §3); "Avg. time to hire" renders "—" per the no-fabrication rule (hire-event tracking unmodeled). 4 SP, within cap.
