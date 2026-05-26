---
id: story-jobs-08
topic: jobs
sprint: 2
story_points: 2
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-26
executed_date: 2026-05-26
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
- [x] Authenticated admin only; 401 otherwise, 403 if not admin
- [x] Job must currently be `status='pending'`; otherwise 409 with friendly message
- [x] Transitions `status` to `'active'` atomically
- [x] `revalidatePath('/jobs')` and `revalidatePath('/jobs/' + id)` called
- [x] Employer notified via ZeptoMail
- [x] Audit log: write an `admin_audit_log` row (actor_id, action, target_table='jobs', target_id, before/after jsonb, created_at) per `TECHNICAL-REQUIREMENTS.md` §4.2. This story owns the `admin_audit_log` migration (first table user); `story-experts-07` reuses it.
- [x] Unit test covers happy path, non-admin, wrong state

## Tasks
- [completed] Write `supabase/migrations/<ts>_admin_audit_log.sql` creating `admin_audit_log` per §4.2 with RLS (admin-read-only, server insert via service role); regenerate types
- [completed] Scaffold `POST app/api/admin/jobs/[id]/approve/route.ts` — admin-only gate (401 unauthed, 403 non-admin)
- [completed] State guard: 409 with friendly message if job is not currently `status='pending'`; otherwise transition to `'active'` atomically
- [completed] Call `revalidatePath('/jobs')` + `revalidatePath('/jobs/' + id)` on success
- [completed] Notify employer via ZeptoMail ("Your job is live")
- [completed] Write the `admin_audit_log` row (actor, action, target, before/after status)
- [completed] Unit tests: happy path, non-admin (403), wrong state (409)

## Notes
- Endpoint per `TECHNICAL-REQUIREMENTS.md` §6.2.
- The admin UI button that calls this endpoint is deferred (no admin design yet); CLI/curl access is acceptable interim.
- `admin_audit_log` was added to `TECHNICAL-REQUIREMENTS.md` §4.1/§4.2 during analysis (2026-05-26). This story owns its migration; `story-experts-07` reuses the table.

## Execution
- _Executed 2026-05-26: `POST /api/admin/jobs/:id/approve` — admin-only (reuses `lib/admin` getAdminActor 401/403), pending→active (409 otherwise), `admin_audit_log` write (table already created by story-experts-07; this story reuses it rather than re-creating), revalidates `/jobs`, employer ZeptoMail. 4 unit tests + 2 E2E (pending hidden → approve → live; non-admin rejected)._
