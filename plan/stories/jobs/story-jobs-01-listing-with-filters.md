---
id: story-jobs-01
topic: jobs
sprint: 2
story_points: 4
status: draft
owner: brij
tasks_populated: false
dependencies:
  - story-auth-06
design:
  - design/screens-jobs.jsx
---

# story-jobs-01 — Jobs listing /jobs with filters (job_type, experience_level, location)

## User story
As a food-tech job seeker, I want to browse active jobs filtered by type, experience, and location, so that I see only roles I might actually apply to.

## Description
Build `app/(public)/jobs/page.tsx` using the JobsListingPage layout from `design/screens-jobs.jsx`. SSR with `searchParams` for `job_type`, `experience_level`, `location`. Only `status='active'` jobs are shown. Cards render company initial, title, company name, location, job type, salary range.

## Acceptance criteria
- [ ] `/jobs` SSR with `searchParams`, cache `s-maxage=60, stale-while-revalidate=300`
- [ ] Query filters by `status = 'active'` AND optionally `job_type`, `experience_level`, ILIKE on `location`
- [ ] Filter UI: select/multi-select for job_type, experience_level; text input for location
- [ ] Job card uses `company_initial` (2-letter rendering field) per `plan/design/data.jsx` rendering-only fields
- [ ] Cards link to `/jobs/[id]`
- [ ] Empty state when no matches: title + message + "Clear filters" CTA
- [ ] Stagger card entry; reduced-motion respected
- [ ] Pagination via `?page=`, not infinite scroll

## Tasks
<!-- Populated by the downstream task-breakdown step, not by this skill.
     Each task should map to one or more acceptance criteria above and be
     small enough to land in a single commit. Until populated, this section
     stays as the single TODO line below. -->
- [ ] TODO — break this story into implementation tasks

## Notes
- RLS allows anon reads of active jobs per `TECHNICAL-REQUIREMENTS.md` §4.1.
- Salary range: render "₹X – ₹Y / yr" if both set; "From ₹X" if only min; omit if neither.
- Featured employer logos are not in Phase 2 scope.
