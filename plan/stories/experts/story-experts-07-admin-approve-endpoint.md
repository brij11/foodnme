---
id: story-experts-07
topic: experts
sprint: 2
story_points: 2
status: draft
owner: brij
tasks_populated: false
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
- [ ] Authenticated admin only; 401 / 403 otherwise
- [ ] Expert row must be `status='pending'`; 409 otherwise
- [ ] Transitions `status` to `'active'`; if body `feature=true`, also sets `is_featured=true`
- [ ] `revalidatePath` for `/experts` and `/experts/[id]` called
- [ ] ZeptoMail to expert: "Your profile is live on foodnme"
- [ ] Audit log entry (same `admin_audit_log` discussion as story-jobs-08 — flag during execution)
- [ ] Unit tests: happy path, non-admin, wrong state, feature flag

## Tasks
<!-- Populated by the downstream task-breakdown step, not by this skill.
     Each task should map to one or more acceptance criteria above and be
     small enough to land in a single commit. Until populated, this section
     stays as the single TODO line below. -->
- [ ] TODO — break this story into implementation tasks

## Notes
- Endpoint per `TECHNICAL-REQUIREMENTS.md` §6.2.
- Reject flow not in this story — Phase 2 keeps it manual (founder edits DB + emails the expert). If rejection volume rises, add a `/reject` endpoint as its own story.
- Admin UI button is deferred (no admin design yet).
