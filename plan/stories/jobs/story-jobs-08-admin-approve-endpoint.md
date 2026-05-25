---
id: story-jobs-08
topic: jobs
sprint: 2
story_points: 2
status: draft
owner: brij
tasks_populated: false
dependencies:
  - story-jobs-03
  - story-auth-05
design: none-needed
---

# story-jobs-08 — POST /api/admin/jobs/:id/approve (admin)

## User story
As the founder, I want a single endpoint to flip a pending job to active, so that I can wire it to a one-click approval action in the admin UI when that ships.

## Description
Implement `POST /app/api/admin/jobs/[id]/approve/route.ts`. Requires `profiles.is_admin = true`. Updates `jobs.status` from `pending` to `active`. On success, calls `revalidatePath('/jobs')` and `revalidatePath('/jobs/' + id)`. Sends ZeptoMail notification to the employer ("Your job is live").

## Acceptance criteria
- [ ] Authenticated admin only; 401 otherwise, 403 if not admin
- [ ] Job must currently be `status='pending'`; otherwise 409 with friendly message
- [ ] Transitions `status` to `'active'` atomically
- [ ] `revalidatePath('/jobs')` and `revalidatePath('/jobs/' + id)` called
- [ ] Employer notified via ZeptoMail
- [ ] Audit log: write an `admin_audit_log` row with actor, action, target (table+row id, before+after status, ts) — if `admin_audit_log` doesn't yet exist, add the migration here (small surface)
- [ ] Unit test covers happy path, non-admin, wrong state

## Tasks
<!-- Populated by the downstream task-breakdown step, not by this skill.
     Each task should map to one or more acceptance criteria above and be
     small enough to land in a single commit. Until populated, this section
     stays as the single TODO line below. -->
- [ ] TODO — break this story into implementation tasks

## Notes
- Endpoint per `TECHNICAL-REQUIREMENTS.md` §6.2.
- The admin UI button that calls this endpoint is deferred (no admin design yet); CLI/curl access is acceptable interim.
- An `admin_audit_log` table is not in current schema (`TECHNICAL-REQUIREMENTS.md` §4) — flag with founder when this story is picked up; may need a tech-spec amendment.
