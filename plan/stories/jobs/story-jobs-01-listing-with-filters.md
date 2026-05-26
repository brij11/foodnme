---
id: story-jobs-01
topic: jobs
sprint: 2
story_points: 4
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-26
executed_date: 2026-05-26
dependencies:
  - story-auth-06
design:
  - design/screens-jobs.jsx
---

# story-jobs-01 — Jobs listing /jobs with filters (job_type, experience_level, location)

## User story
As a food-tech job seeker, I want to browse active jobs filtered by type, experience, and location, so that I see only roles I might actually apply to.

## Description
Build `app/(public)/jobs/page.tsx` using the JobsListingPage layout from `design/screens-jobs.jsx`. SSR with `searchParams` for `q` (search), `job_type`, `experience_level`, `location`, `salary_min`, and `sort`. Only `status='active'` jobs are shown. Cards render company initial, title, company name, location, job type, salary range.

Filter set decided during analysis (parallel to story-experts-01): **free-text search (ILIKE on title/company_name/skills) + job_type multi + experience_level multi + location ILIKE + salary-min slider + sort (recent / highest salary)**. The prototype's remote-only toggle is dropped — `jobs` (§4.2) has no `remote` column. Jobs has no `search_vector`, so search is ILIKE, not FTS.

## Acceptance criteria
- [x] `/jobs` SSR with `searchParams`, cache `s-maxage=60, stale-while-revalidate=300`
- [x] Query filters by `status = 'active'` AND optionally `job_type`, `experience_level`, ILIKE on `location`, free-text `q` (ILIKE on title/company_name/skills), and `salary_max >= salary_min` floor
- [x] Filter UI: free-text search box; multi-select for job_type + experience_level; text input for location; salary-min slider; sort dropdown (recent / highest salary). No remote toggle (no schema column).
- [x] Job card uses `company_initial` (2-letter rendering field) per `plan/design/data.jsx` rendering-only fields
- [x] Cards link to `/jobs/[id]`
- [x] Empty state when no matches: title + message + "Clear filters" CTA
- [x] Stagger card entry; reduced-motion respected
- [x] Pagination via `?page=`, not infinite scroll

## Tasks
- [completed] Scaffold `app/(public)/jobs/page.tsx` — SSR reading `searchParams` (`q`, `job_type[]`, `experience_level[]`, `location`, `salary_min`, `sort`, `page`), cache `s-maxage=60, stale-while-revalidate=300`
- [completed] Build the query: `status='active'`, optional job_type/experience_level IN-filters, location ILIKE, `q` ILIKE on title/company_name/skills, salary floor; sort recent (`created_at desc`) or highest salary (`salary_max desc`)
- [completed] Port the sidebar from `design/screens-jobs.jsx` — search, job_type + experience_level checkboxes (JOB_TYPES / EXPERIENCE_LEVELS), location input, salary-min slider, sort dropdown, "Clear all filters"; omit remote toggle
- [completed] Render `JobCard` using `company_initial`; salary copy "₹X – ₹Y / yr" / "From ₹X" / omit per Notes; links to `/jobs/[id]`
- [completed] Empty state (title + message + "Clear filters" CTA); stagger entry with `key=` reset, reduced-motion
- [completed] Pagination via `?page=` (offset/limit), not infinite scroll

## Notes
- RLS allows anon reads of active jobs per `TECHNICAL-REQUIREMENTS.md` §4.1.
- Salary range: render "₹X – ₹Y / yr" if both set; "From ₹X" if only min; omit if neither.
- Featured employer logos are not in Phase 2 scope.

## Execution
- _Executed 2026-05-26: created the `jobs` table + RLS + 7-job seed (this story owns the migration; first consumer). SSR `/jobs` with GET-form filters (q ILIKE title/company_name + exact-skill contains, job_type/experience IN, location ILIKE, salary-min floor, sort recent/salary), `?page=` pagination, staggered cards, empty state. Enabled the Jobs nav link (updated the stale homepage-02 Navbar test). Verified by 6 E2E (`jobs-listing.spec.ts`, incl. axe) + `jobs.test.ts` (companyInitial, salary). Note: skill free-text is exact-contains (PostgREST array limit), not partial ILIKE._
