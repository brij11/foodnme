---
id: story-jobs-12
topic: jobs
sprint: 4
story_points: 2
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-30
executed_date: 2026-05-30
dependencies:
  - story-jobs-02
design:
  - design/screens-jobs.jsx
---

# story-jobs-12 — Job detail "Similar roles" section

## User story
As a job seeker who just read a listing, I want to see similar roles, so that I can keep exploring relevant opportunities without going back to the board.

## Description
Add the "Similar roles" 3-card grid to the job detail page (absent today), per `screens-jobs.jsx`. Similar jobs are selected by shared signals (experience level, overlapping skills, job type) excluding the current job, surfacing only open/active listings.

## Acceptance criteria
- [x] Job detail renders a "Similar roles" section of up to 3 `JobCard`s below the main content — section below the main grid; `e2e/job-detail-sections.spec.ts` asserts ≤3 cards
- [x] Selection excludes the current job and only includes active/open listings — `getSimilarJobs` filters `status='active'` + `neq id`; `lib/jobs.test.ts` asserts current-job exclusion + dedup
- [x] Similarity uses a defined signal (e.g. shared experience level + skill overlap); deterministic ordering — skill `overlaps` first, then same `experience_level` top-up; both ordered `created_at desc`; unit tests cover both paths
- [x] Section is hidden entirely when there are zero similar roles (no empty heading) — `{similar.length > 0 ? …}`; `lib/jobs.test.ts` asserts `[]` when nothing matches
- [x] Matches the related-grid pattern already used on article/template detail — `sm:grid-cols-2 lg:grid-cols-3` of `JobCard`, mirroring `getRelatedArticles`/RelatedArticles

## Tasks
- [completed] Add a `lib/jobs` query for similar jobs: same `experience_level` + overlapping `skills`, exclude current job, active/open only, deterministic ordering, limit 3
- [completed] Render a "Similar roles" section of up to 3 `JobCard`s below the main content on `app/(public)/jobs/[id]/page.tsx`, reusing the related-grid pattern from article/template detail
- [completed] Hide the section entirely (no empty heading) when zero similar roles
- [completed] Add a test covering similarity selection, current-job exclusion, and the hidden-when-empty case

## Notes
- Audit gap JD6 (Partial). Mirrors the existing "Related articles" / "Similar templates" pattern.
