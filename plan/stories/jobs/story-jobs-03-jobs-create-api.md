---
id: story-jobs-03
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
  - story-auth-05
design: none-needed
---

# story-jobs-03 — POST /api/jobs (employer create) with Zod, Turnstile, idempotency

## User story
As an employer, I want to submit a new job posting through a validated API endpoint that resists spam and double-submission, so that the founder's approval queue stays clean.

## Description
Implement `POST /app/api/jobs/route.ts`. Requires authenticated `employer` role (verified via server Supabase client). Validates body with Zod (`title`, `company_name`, `location`, `job_type`, `salary_min`, `salary_max`, `experience_level`, `description`, `skills[]`, `expires_at`). Turnstile token verified. Inserts row with `status='pending'` and `employer_id = profile.id`. Honors `Idempotency-Key` via Upstash.

## Acceptance criteria
- [x] Authenticated session required; 401 otherwise
- [x] User's `profiles.role` must be `'employer'`; 403 otherwise
- [x] Zod validates all fields; salary_max >= salary_min when both present; expires_at > now
- [x] Turnstile token verified before DB write
- [x] Insert sets `status='pending'`, `employer_id = current user's profile.id`
- [x] Returns `{ ok: true, data: { id } }` on success
- [x] Idempotency-Key dedupes inserts within 5 minutes
- [x] Email to founder ("New job pending review") via ZeptoMail
- [x] Unit tests cover happy path, wrong role, Zod fail, Turnstile fail, idempotency replay

## Tasks
- [completed] Add `lib/schemas/job.ts` Zod schema for all fields + refinements: `salary_max >= salary_min` when both present, `expires_at > now`
- [completed] Scaffold `POST app/api/jobs/route.ts` — require authenticated session (401) and `profiles.role = 'employer'` (403) via server Supabase client
- [completed] Verify Turnstile token server-side before any DB write (§9.6)
- [completed] Insert `jobs` row with `status='pending'` + `employer_id = profile.id`; return `{ ok: true, data: { id } }`
- [completed] Honor `Idempotency-Key` header — dedupe inserts via Upstash Redis (5-minute window, §6.1)
- [completed] Send ZeptoMail "New job pending review" notification to founder
- [completed] Unit tests: happy path, wrong role (403), Zod failure, Turnstile failure, idempotency replay

## Notes
- Endpoint per `TECHNICAL-REQUIREMENTS.md` §6.2.
- Pending → active flow lives in `story-jobs-08` (admin approval endpoint).
- ZeptoMail "new job pending" notification is an addition to the contract — keep it because the founder's approval is the bottleneck.

## Execution
- _Executed 2026-05-26: `POST /api/jobs` — authed employer (401/403), Zod (`lib/schemas/job.ts`, salary + future-expiry refinements), Turnstile before write (§9.6), Upstash idempotency replay (§6.1), service-role insert (`status='pending'`, `employer_id`), founder ZeptoMail. 6 unit tests (happy, wrong role, Zod, Turnstile, unauthed, idempotency replay). The employer-create UI flow is E2E'd in story-jobs-04._
