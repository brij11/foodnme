---
id: story-jobs-06
topic: jobs
sprint: 2
story_points: 3
status: draft
owner: brij
tasks_populated: false
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
- [ ] Authenticated seeker role required; 401/403 otherwise
- [ ] Zod validates body; cover_note ≤2000 chars; resume_url is a Supabase Storage URL
- [ ] Insert into `applications` with `status='submitted'`, `applied_at=now()`, `applicant_id = current profile id`
- [ ] Unique constraint on `(job_id, applicant_id)` enforced at DB level; conflict returns 409 with friendly message
- [ ] Job must be `status='active'`; 400 otherwise
- [ ] Idempotency-Key dedupes within 5-minute window
- [ ] Email to employer ("New application for {job.title}") via ZeptoMail
- [ ] Unit tests cover happy path, duplicate, inactive job, wrong role, idempotency replay

## Tasks
<!-- Populated by the downstream task-breakdown step, not by this skill.
     Each task should map to one or more acceptance criteria above and be
     small enough to land in a single commit. Until populated, this section
     stays as the single TODO line below. -->
- [ ] TODO — break this story into implementation tasks

## Notes
- Endpoint per `TECHNICAL-REQUIREMENTS.md` §6.2.
- RLS: applicant can read own application; employer-of-job can read applications targeting their job; admin reads all (§4.1).
- Resume retention: 12 months after parent `jobs.status='closed'` per `TECHNICAL-REQUIREMENTS.md` §9.5 — implemented later via pg_cron (open question Appendix OQ#4).
