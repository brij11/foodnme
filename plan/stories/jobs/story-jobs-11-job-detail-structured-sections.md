---
id: story-jobs-11
topic: jobs
sprint: 4
story_points: 3
status: ready
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-30
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
- [ ] "What you'll do" renders responsibilities as a checklist (from `story-jobs-09` fields)
- [ ] "Who we're looking for" renders requirements as a checklist
- [ ] Aside renders a detail meta list: job type, location, experience level, applicant count (from `jobs.applicant_count`), posted date
- [ ] Aside renders the info note ("Applications reviewed weekly…" or founder-approved copy)
- [ ] Header shows a "Featured" badge when `is_featured`
- [ ] Sections degrade gracefully when a job has no structured responsibilities/requirements (falls back to the description)
- [ ] Matches `screens-jobs.jsx` layout (1.5fr/1fr, sticky aside); green only on actionable elements

## Tasks
- [new] Render "What you'll do" as a checklist from `jobs.responsibilities` and "Who we're looking for" from `jobs.requirements` (story-jobs-09)
- [new] Build the aside detail meta list (job type, location, experience level, applicant count from `jobs.applicant_count`, posted date) + the info note copy
- [new] Show a "Featured" badge in the header when `jobs.is_featured`
- [new] Graceful fallback to the `description` when a job has no structured responsibilities/requirements
- [new] Implement the `screens-jobs.jsx` layout (1.5fr/1fr, sticky aside); green only on actionable elements
- [new] Add a test covering structured-sections render, the description fallback, and the featured badge

## Notes
- Audit gaps JD1, JD2, JD4, JD5, JD7 (Partial). Hard-depends on `story-jobs-09` (responsibilities/requirements/is_featured).
- Applicant count from the denormalized `jobs.applicant_count` (decision 2026-05-30; §4.2).
- "Save for later" (JD3) and "Similar roles" (JD6) are separate stories (`story-jobs-15`, `story-jobs-12`).
