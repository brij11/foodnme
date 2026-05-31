---
id: story-jobs-16
topic: jobs
sprint: 5
story_points: 3
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-31
executed_date: 2026-06-01
exec_model: sonnet
dependencies:
  - story-jobs-01
  - story-jobs-04
  - story-jobs-07
  - story-jobs-10
design:
  - design/screens-jobs.jsx
  - design/screens-dashboard.jsx
---

# story-jobs-16 — Jobs listing, card & seeker-dashboard parity

## User story
As a job seeker and employer, I want the jobs listing controls and dashboard details to match the design, so that browsing and managing jobs feels finished.

## Description
A batch of jobs-surface deviations: the sort control sits in the sidebar instead of the results header (§3.5 places it in the main column), the salary slider lacks a live readout, the seeker dashboard is missing the `interview` status pill, and several cosmetic nits (apply CTA copy, employer posted-jobs row actions, saved-job CTA copy). Covers DEVIATIONS.md **B13, C6, D7, D8, D9, D10** (and a confirm-only review of the **B16-B19** JobCard restructure).

## Acceptance criteria
- [x] Sort control (recent / salary) renders in the results header above the grid, not inside the sidebar (DEVIATIONS B13; `web/components/jobs/JobsFilterSidebar.tsx:78-84` → move to `web/app/(public)/jobs/page.tsx` header) — covered by `jobs16.test.tsx` "JobsFilterSidebar does NOT render a sort dropdown"
- [x] Seeker application status set includes `interview` with its own pill, matching the prototype's four statuses (DEVIATIONS C6; `web/components/dashboard/SeekerDashboard.tsx:37-41` vs `design/screens-dashboard.jsx:97-102`) — add the enum value where applications status is defined; covered by SeekerDashboard.test.tsx; migration `20260601000001_applications_interview_status.sql` drops and recreates the CHECK constraint
- [x] Salary slider shows a live LPA readout (e.g. "₹X L/yr+") beside it (DEVIATIONS D9; `web/components/jobs/JobsFilterSidebar.tsx:65-76`) — covered by `jobs16.test.tsx` SalarySliderIsland tests
- [x] Job-detail apply CTA copy aligned ("Apply for this job") (DEVIATIONS D10; `web/components/jobs/ApplyButton.tsx:63`) — verified in ApplyButton.tsx:68, no test needed (static string)
- [x] Employer posted-jobs row surfaces the posted date and manage actions consistent with the design (DEVIATIONS D8; `web/components/dashboard/EmployerDashboard.tsx:106-120`) — covered by EmployerDashboard.test.tsx "shows the posted date"
- [x] Seeker saved-job row CTA copy + salary line aligned to the design (DEVIATIONS D7; `web/components/dashboard/SeekerDashboard.tsx:160-168`) — covered by SeekerDashboard.test.tsx D7 tests
- [x] JobCard restructure (header order, skills row, View/Save buttons) reviewed against `design/screens-jobs.jsx`; kept as-is if it's the sanctioned jobs-10/15 evolution, with any copy aligned (DEVIATIONS B16-B19) — confirmed as sanctioned evolution; copy "View job" is correct per jobs-10

## Tasks
- [completed] Move the jobs sort control (recent / salary) from the sidebar to the results header above the grid (AC: B13)
- [completed] Add `interview` to the application status set — STATUS_TAG pill (+ a migration if the column has a CHECK constraint gating values); expose it as an employer status-transition option if the review flow already sets statuses, else display-only (AC: C6)
- [completed] Add a live LPA readout beside the jobs salary slider via a small client island (AC: D9)
- [completed] Align the job-detail apply CTA copy to "Apply for this job" (AC: D10)
- [completed] Surface the posted date + manage actions on the employer posted-jobs row (AC: D8)
- [completed] Align the seeker saved-job row CTA copy + salary line to the design (AC: D7)
- [completed] Review the JobCard restructure (header order, skills row, View/Save buttons) vs the prototype; keep the sanctioned jobs-10/15 evolution and align copy (AC: B16-B19)
- [completed] Update affected jobs listing / dashboard tests (AC: B13, C6, D9)

## Notes
- exec_model: sonnet — mostly layout/copy parity; the one schema touch (`interview` status value) is a known pattern. Execute-sprint will auto-escalate if the status migration proves nontrivial.
- Doc check (analysis): `interview` is already in the design contract (handoff §3.8 seeker status pills) and `TECHNICAL-REQUIREMENTS.md §4.2` defines `applications.status` with no explicit CHECK enum — so no tech-spec amendment is needed; this restores documented design.
- Source: `plan/DEVIATIONS.md` B13, C6, D7, D8, D9, D10, and the JobCard half of B16-B19.
- C6 (interview status) is a small enum + pill addition — feasible on the existing applications schema; if the status enum is a Postgres type, this needs a migration.
- The salary slider live readout requires client JS in the otherwise-SSR filter form — acceptable; scope to a small client island.
- Remote toggle (DEVIATIONS C8) is intentionally NOT included — no `remote` column in the jobs schema (justified).
