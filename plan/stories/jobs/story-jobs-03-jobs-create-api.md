---
id: story-jobs-03
topic: jobs
sprint: 2
story_points: 4
status: draft
owner: brij
tasks_populated: false
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
- [ ] Authenticated session required; 401 otherwise
- [ ] User's `profiles.role` must be `'employer'`; 403 otherwise
- [ ] Zod validates all fields; salary_max >= salary_min when both present; expires_at > now
- [ ] Turnstile token verified before DB write
- [ ] Insert sets `status='pending'`, `employer_id = current user's profile.id`
- [ ] Returns `{ ok: true, data: { id } }` on success
- [ ] Idempotency-Key dedupes inserts within 5 minutes
- [ ] Email to founder ("New job pending review") via ZeptoMail
- [ ] Unit tests cover happy path, wrong role, Zod fail, Turnstile fail, idempotency replay

## Tasks
<!-- Populated by the downstream task-breakdown step, not by this skill.
     Each task should map to one or more acceptance criteria above and be
     small enough to land in a single commit. Until populated, this section
     stays as the single TODO line below. -->
- [ ] TODO — break this story into implementation tasks

## Notes
- Endpoint per `TECHNICAL-REQUIREMENTS.md` §6.2.
- Pending → active flow lives in `story-jobs-08` (admin approval endpoint).
- ZeptoMail "new job pending" notification is an addition to the contract — keep it because the founder's approval is the bottleneck.
