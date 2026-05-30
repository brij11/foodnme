---
id: story-jobs-11
topic: jobs
sprint: 4
story_points: 3
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-30
executed_date: 2026-05-30
dependencies:
  - story-jobs-02
  - story-jobs-09
design:
  - design/screens-jobs.jsx
---

# story-jobs-11 — Job detail structured sections + aside meta

## User story
As a job seeker reading a listing, I want responsibilities, requirements, and key facts laid out clearly, so that I can quickly judge whether the role fits.

## Description
`app/(public)/jobs/[id]/page.tsx` renders only "About the role" (raw description) + Skills + salary + Apply. Add the designed structure from `screens-jobs.jsx`: a "What you'll do" responsibilities checklist, a "Who we're looking for" requirements checklist, an aside detail meta list (type, location, experience, applicants, posted), an info note, and a featured badge in the header. Content comes from the structured fields in `story-jobs-09`.

## Acceptance criteria
- [x] "What you'll do" renders responsibilities as a checklist (from `story-jobs-09` fields) — `CheckList` from `job.responsibilities`; `e2e/job-detail-sections.spec.ts` asserts the heading + first item
- [x] "Who we're looking for" renders requirements as a checklist — `CheckList` from `job.requirements`; E2E asserts heading + first item
- [x] Aside renders a detail meta list: job type, location, experience level, applicant count (from `jobs.applicant_count`), posted date — meta `<ul>`; E2E asserts "Job type" + "Applicants"
- [x] Aside renders the info note ("Applications reviewed weekly…" or founder-approved copy) — info note rendered; E2E asserts the copy
- [x] Header shows a "Featured" badge when `is_featured` — `Tag variant="accent"` in the header; E2E (featured job) asserts it
- [x] Sections degrade gracefully when a job has no structured responsibilities/requirements (falls back to the description) — checklists only render when their array is non-empty; "About the role" description always present
- [x] Matches `screens-jobs.jsx` layout (1.5fr/1fr, sticky aside); green only on actionable elements — `lg:grid-cols-[1.6fr_1fr]`, `lg:sticky lg:top-24` aside; jobs-detail a11y E2E still passes

## Tasks
- [completed] Render "What you'll do" as a checklist from `jobs.responsibilities` and "Who we're looking for" from `jobs.requirements` (story-jobs-09)
- [completed] Build the aside detail meta list (job type, location, experience level, applicant count from `jobs.applicant_count`, posted date) + the info note copy
- [completed] Show a "Featured" badge in the header when `jobs.is_featured`
- [completed] Graceful fallback to the `description` when a job has no structured responsibilities/requirements
- [completed] Implement the `screens-jobs.jsx` layout (1.5fr/1fr, sticky aside); green only on actionable elements
- [completed] Add a test covering structured-sections render, the description fallback, and the featured badge

## Notes
- Audit gaps JD1, JD2, JD4, JD5, JD7 (Partial). Hard-depends on `story-jobs-09` (responsibilities/requirements/is_featured).
- Applicant count from the denormalized `jobs.applicant_count` (decision 2026-05-30; §4.2).
- "Save for later" (JD3) and "Similar roles" (JD6) are separate stories (`story-jobs-15`, `story-jobs-12`).
