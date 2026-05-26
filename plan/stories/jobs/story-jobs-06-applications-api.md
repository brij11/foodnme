---
id: story-jobs-06
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
  - story-jobs-05
design: none-needed
---

# story-jobs-06 — POST /api/applications + Supabase Storage resume

## User story
As the application, I want a server endpoint that records job applications, enforces one-per-job-per-seeker, and stores resume URLs, so that employers can review applicants reliably and seekers don't accidentally double-apply.

## Description
Implement `POST /app/api/applications/route.ts`. Requires authenticated `seeker` role. Validates body via Zod (`job_id`, `resume_url`, `cover_note`). Enforces uniqueness: one application per (`job_id`, `applicant_id`). Honors Idempotency-Key. Notifies the job's employer via ZeptoMail.

## Acceptance criteria
- [x] Authenticated seeker role required; 401/403 otherwise
- [x] Zod validates body; cover_note ≤2000 chars; resume_url is a Supabase Storage URL
- [x] Turnstile token verified before any DB write (§9.6 / §6.2)
- [x] Insert into `applications` with `status='submitted'`, `applied_at=now()`, `applicant_id = current profile id`
- [x] Unique constraint on `(job_id, applicant_id)` enforced at DB level; conflict returns 409 with friendly message
- [x] Job must be `status='active'`; 400 otherwise
- [x] Idempotency-Key dedupes within 5-minute window
- [x] Email to employer ("New application for {job.title}") via ZeptoMail
- [x] Unit tests cover happy path, duplicate, inactive job, wrong role, idempotency replay

## Tasks
- [completed] Ensure the `applications` table has a unique constraint on `(job_id, applicant_id)` (migration if not already present from story-auth-05/schema setup)
- [completed] Add `lib/schemas/application.ts` Zod schema (`job_id`, `resume_url` as Storage URL, `cover_note` ≤2000, `turnstile_token`)
- [completed] Build `POST app/api/applications/route.ts` — authenticated seeker (401/403), verify Turnstile before write
- [completed] Insert with `status='submitted'`, `applied_at=now()`, `applicant_id = profile.id`; guard job `status='active'` (400) and unique-conflict (409 friendly)
- [completed] Honor `Idempotency-Key` (5-min Upstash window); notify employer via ZeptoMail ("New application for {job.title}")
- [completed] Unit tests: happy path, duplicate (409), inactive job (400), wrong role (403), Turnstile fail, idempotency replay

## Notes
- Endpoint per `TECHNICAL-REQUIREMENTS.md` §6.2.
- RLS: applicant can read own application; employer-of-job can read applications targeting their job; admin reads all (§4.1).
- Resume retention: 12 months after parent `jobs.status='closed'` per `TECHNICAL-REQUIREMENTS.md` §9.5 — implemented later via pg_cron (open question Appendix OQ#4).

## Execution
- _Executed 2026-05-26: `POST /api/applications` — authed seeker (401/403), Zod (`lib/schemas/application.ts`), Turnstile (§9.6), idempotency, job-active guard (400), unique-conflict → 409, employer ZeptoMail. The `applications` table + unique(job_id,applicant_id) were created in story-jobs-04 (first consumer) and reused here. 6 unit tests (happy, duplicate 409, inactive 400, wrong role, Turnstile, unauthed). End-to-end apply is E2E'd in story-jobs-05._
