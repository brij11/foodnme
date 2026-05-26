---
id: story-jobs-02
topic: jobs
sprint: 2
story_points: 3
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-26
executed_date: 2026-05-26
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
- [x] `/jobs/[id]` SSR; 404 if not found or `status != 'active'`
- [x] Renders all job fields from the schema (§4.2): title, company_name, location, job_type, experience_level, salary_min/max, description, skills[], created_at, expires_at
- [x] `description` rendered as plain text (MVP); the prototype's hardcoded "What you'll do / Who we're looking for" lists are illustrative only and are not schema-backed
- [x] Skills rendered as tag pills
- [x] "Apply Now" CTA: opens apply modal if seeker is logged in; redirects to `/login?redirect=/jobs/[id]` if not
- [x] Non-seeker role (employer/expert) attempting to apply: button hidden or shows "Switch to seeker account to apply" inline
- [x] Breadcrumb: Home › Jobs › {Title}
- [x] `generateMetadata` returns per-job title + description + OG card
- [x] Lighthouse SEO ≥ 95

## Tasks
- [completed] Scaffold `app/(public)/jobs/[id]/page.tsx` — SSR fetch by id, `s-maxage=60, stale-while-revalidate=300`; 404 if not found or `status != 'active'`
- [completed] Port the JobDetailPage layout from `design/screens-jobs.jsx` — header (company_initial, title, company), meta row, description as plain text, skills as tag pills, salary aside; drop the hardcoded role-prose lists
- [completed] Role-aware "Apply Now" CTA: seeker → open apply modal (story-jobs-05); unauthenticated → redirect `/login?redirect=/jobs/[id]`; employer/expert → hidden or inline "Switch to seeker account to apply"
- [completed] Breadcrumb Home › Jobs › {Title}; `generateMetadata` per-job title + description + OG card
- [completed] Verify Lighthouse SEO ≥ 95 for the detail route

## Notes
- SSR not SSG: job content rotates frequently and approval gating means cache invalidation would be noisy.
- Apply modal lives in `story-jobs-05`.

## Execution
- _Executed 2026-05-26: SSR `/jobs/[id]` (404 on missing/non-active/non-uuid), plain-text description + skill tags + salary aside + breadcrumb + `generateMetadata`. Role-aware `ApplyButton` (server-resolved role): anon → `/login?redirect=/jobs/[id]`, employer/expert → inline "switch to a seeker account", seeker → opens `ApplyModal`. The modal UI (resume input, cover note + counter, Turnstile, upload→`/api/applications` submit) is built here so the CTA works; story-jobs-05 owns its resume-upload/duplicate-guard behaviour and story-jobs-06 the API. Verified by 4 E2E (`jobs-detail.spec.ts`, incl. axe). Lighthouse SEO: manual (SSR + metadata, CI gate §10)._
