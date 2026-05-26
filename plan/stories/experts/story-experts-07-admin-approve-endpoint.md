---
id: story-experts-07
topic: experts
sprint: 2
story_points: 2
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-26
executed_date: 2026-05-26
dependencies:
  - story-experts-04
  - story-auth-05
design: none-needed
---

# story-experts-07 — POST /api/admin/experts/:id/approve (admin)

## User story
As the founder, I want a single endpoint to flip a pending expert to active (and optionally toggle is_featured), so that I can ship the admin UI later without redoing this logic.

## Description
Implement `POST /app/api/admin/experts/[id]/approve/route.ts`. Requires `profiles.is_admin = true`. Body: `{ feature?: boolean }` — when `true`, sets `is_featured=true` alongside the status flip. Updates `experts.status` from `pending` to `active`. On success, `revalidatePath('/experts')` and `revalidatePath('/experts/' + id)`. Notifies the expert via ZeptoMail.

## Acceptance criteria
- [x] Authenticated admin only; 401 / 403 otherwise — `route.test.ts` (401 unauthed, 403 non-admin) via shared `getAdminActor`
- [x] Expert row must be `status='pending'`; 409 otherwise — `route.test.ts` "already-active → 409"
- [x] Transitions `status` to `'active'`; if body `feature=true`, also sets `is_featured=true` — `route.test.ts` (feature + no-feature) + `experts-admin-approve.spec.ts` (Verified badge appears)
- [x] `revalidatePath` for `/experts` and `/experts/[id]` called — in route; E2E confirms the directory updates after approval
- [x] ZeptoMail to expert: "Your profile is live on foodnme" — sent best-effort (no-key skip locally)
- [x] Audit log entry: write an `admin_audit_log` row (actor_id, action, target_table='experts', target_id, before/after jsonb) — `route.test.ts` asserts the insert; **this story created the `admin_audit_log` table** (first consumer; jobs-08 reuses it — execution order put experts-07 before jobs-08)
- [x] Unit tests: happy path, non-admin, wrong state, feature flag — `route.test.ts` (5 cases) + 2 E2E

## Tasks
- [completed] Build `POST app/api/admin/experts/[id]/approve/route.ts` — admin-only gate (401 unauthed, 403 non-admin)
- [completed] State guard: 409 if expert not `status='pending'`; otherwise transition `status` to `'active'`, and set `is_featured=true` when body `feature=true`
- [completed] Call `revalidatePath('/experts')` + `revalidatePath('/experts/' + id)`; notify expert via ZeptoMail ("Your profile is live on foodnme")
- [completed] Write the `admin_audit_log` row (actor, action, target_table='experts', before/after) — **table created here** (`20260526000005_admin_audit_log.sql`); jobs-08 reuses it
- [completed] Unit tests: happy path, non-admin (403), wrong state (409), feature flag sets is_featured

## Notes
- _Executed 2026-05-26: shared `lib/admin.ts` (`getAdminActor` 401/403 + `writeAudit`) reused by jobs-08. Created the `admin_audit_log` table here (first consumer; experts-07 precedes jobs-08 in execution order). Approve transitions pending→active (+optional feature), audits, revalidates, emails. 5 unit tests + 2 E2E (pending-hidden→approve→live+featured; non-admin rejected)._

## Notes
- Endpoint per `TECHNICAL-REQUIREMENTS.md` §6.2.
- Reject flow not in this story — Phase 2 keeps it manual (founder edits DB + emails the expert). If rejection volume rises, add a `/reject` endpoint as its own story.
- Admin UI button is deferred (no admin design yet).
