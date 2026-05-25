---
id: story-jobs-02
topic: jobs
sprint: 2
story_points: 3
status: draft
owner: brij
tasks_populated: false
dependencies:
  - story-jobs-01
design:
  - design/screens-jobs.jsx
---

# story-jobs-02 — Job detail /jobs/[id]

## User story
As a seeker browsing a job, I want a focused detail page that shows the full description, required skills, salary range, and an "Apply Now" CTA, so that I can decide quickly and start the application.

## Description
Build `app/(public)/jobs/[id]/page.tsx` using the JobDetailPage layout from `design/screens-jobs.jsx`. SSR with `s-maxage=60, stale-while-revalidate=300`. Renders title, company, location, job type, experience level, salary, description (plain text MVP), skills tags, posted-at, expires-at. "Apply Now" CTA opens the apply modal (`story-jobs-05`); if user is unauthenticated, redirect them to `/login?redirect=/jobs/[id]`.

## Acceptance criteria
- [ ] `/jobs/[id]` SSR; 404 if not found or `status != 'active'`
- [ ] Renders all job fields from the schema (§3.4)
- [ ] Skills rendered as tag pills
- [ ] "Apply Now" CTA: opens apply modal if seeker is logged in; redirects to `/login?redirect=/jobs/[id]` if not
- [ ] Non-seeker role (employer/expert) attempting to apply: button hidden or shows "Switch to seeker account to apply" inline
- [ ] Breadcrumb: Home › Jobs › {Title}
- [ ] `generateMetadata` returns per-job title + description + OG card
- [ ] Lighthouse SEO ≥ 95

## Tasks
<!-- Populated by the downstream task-breakdown step, not by this skill.
     Each task should map to one or more acceptance criteria above and be
     small enough to land in a single commit. Until populated, this section
     stays as the single TODO line below. -->
- [ ] TODO — break this story into implementation tasks

## Notes
- SSR not SSG: job content rotates frequently and approval gating means cache invalidation would be noisy.
- Apply modal lives in `story-jobs-05`.
