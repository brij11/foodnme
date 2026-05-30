---
id: story-jobs-14
topic: jobs
sprint: 4
story_points: 4
status: ready
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-30
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
- [ ] Employer dashboard renders the design's 4-card stats grid: Active listings, Total applicants, Pending review, Avg. time to hire
- [ ] "Applicants" tab renders a real list (no placeholder) of applicants across the employer's listings
- [ ] Each applicant row shows candidate name, the role applied to, applied date, resume link (signed URL), and application status
- [ ] Employer can view an applicant's resume via a short-lived signed Storage URL (auth + RLS enforced; no public exposure)
- [ ] Data is scoped to the employer's own jobs via RLS / service-role aggregation; an employer never sees another employer's applicants
- [ ] Empty state when a listing has no applicants
- [ ] "Avg. time to hire" renders "—" because hire-event tracking is not yet modeled; a code comment flags the future tracking story — never a fabricated number

## Tasks
- [new] Add the 4-card stats grid to `EmployerDashboard.tsx`: Active listings, Total applicants, Pending review, Avg. time to hire ("—")
- [new] Compute Active listings / Total applicants / Pending review from the employer's own jobs + applications (RLS / employer-of-job scope)
- [new] Replace the "Applicants" tab placeholder with a real list across the employer's listings: candidate name (via `public_profiles`), role applied to, applied date, status
- [new] Add resume viewing via a short-lived signed Storage URL (auth + RLS enforced; reuse the §6.2 `/api/upload`/applications pattern; no public exposure)
- [new] Add empty state for a listing with no applicants; ensure no cross-employer data leakage
- [new] Render "Avg. time to hire" as "—" with a comment referencing a future tracking story (no fabricated value)
- [new] Add tests: stats correctness, RLS employer-scoping, signed-URL access control, empty state

## Notes
- Audit gap #16 Employer (Major): stats missing + Applicants tab stubbed.
- Uses existing `applications` + `public_profiles` (§4.2) for candidate display fields; no new schema. Reuses the `resume` signed-URL pattern from §6.2 `/api/upload`/applications.
- Analysis 2026-05-30: kept the four design-contract cards (UI-DESIGN-HANDOFF §3); "Avg. time to hire" renders "—" per the no-fabrication rule (hire-event tracking unmodeled). 4 SP, within cap.
