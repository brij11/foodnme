---
id: story-jobs-10
topic: jobs
sprint: 4
story_points: 3
status: ready
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-30
dependencies:
  - story-jobs-01
  - story-jobs-09
design:
  - design/screens-jobs.jsx
---

# story-jobs-10 — JobCard enrichment

## User story
As a job seeker scanning the board, I want each card to show how recent and competitive a role is, so that I can prioritise which listings to open.

## Description
`components/jobs/JobCard.tsx` is missing several designed fields. Per `screens-jobs.jsx`, the card should show posted date, applicant count, experience level, a 2-line description snippet, and a "Featured" badge for featured roles. Applicant count is aggregated from `applications`; the featured flag comes from `story-jobs-09`.

## Acceptance criteria
- [ ] Card shows posted date (relative or short date) and applicant count (from `jobs.applicant_count`)
- [ ] Card shows experience level alongside location and job type
- [ ] Card shows a 2-line (clamped) description snippet
- [ ] Featured roles render a "Featured" badge per design tokens (from `jobs.is_featured`, `story-jobs-09`)
- [ ] Applicant count reads the denormalized `jobs.applicant_count` column on the listing query — no per-card N+1 aggregation
- [ ] Card remains accessible and layout-stable (no CLS) with and without optional fields
- [ ] Matches `screens-jobs.jsx` density/type; green only on actionable elements

## Tasks
- [new] Extend `JobCard.tsx` to show posted date (relative/short) and applicant count (`jobs.applicant_count`)
- [new] Add experience level alongside location and job type
- [new] Add a 2-line clamped description snippet
- [new] Render a "Featured" badge for `is_featured` roles per design tokens
- [new] Ensure the `lib/jobs` card columns include `applicant_count`, `is_featured`, `experience_level` (no extra per-card query)
- [new] Verify accessibility + layout stability (no CLS) with and without optional fields; density/type match; green only on actionable
- [new] Add a test for the enriched fields and the featured-badge / no-applicant-count edge cases

## Notes
- Audit gaps J1–J4 (Partial/Minor). Featured badge depends on `is_featured` from `story-jobs-09`.
- Applicant count sourced from the denormalized `jobs.applicant_count` (decision 2026-05-30; trigger on `applications` insert) — added to `TECHNICAL-REQUIREMENTS.md` §4.2.
