---
id: story-experts-06
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
design: none-needed
---

# story-experts-06 — Expert availability toggle (PATCH /api/experts/:id/availability)

## User story
As an expert, I want a single toggle to mark myself available or unavailable, so that visitors don't message me when I'm at capacity.

## Description
Implement `PATCH /app/api/experts/[id]/availability/route.ts`. Requires authenticated user owning that expert row. Body: `{ is_available: boolean }`. Updates only the `is_available` column — does NOT touch `status` (no re-approval needed). Returns the updated boolean.

## Acceptance criteria
- [x] Authenticated user; 401 otherwise — route guards `getUser()`
- [x] User must own the row (`experts.user_id = current profile.id`); 403 otherwise — `route.test.ts` "non-owner → 403"
- [x] Updates `is_available` only — nothing else changes — `route.test.ts` asserts `update({ is_available })` exactly; `availability-toggle.spec.ts` confirms persistence (status untouched)
- [x] Returns `{ ok: true, data: { is_available } }` — `route.test.ts`
- [x] Cache invalidation: `revalidatePath('/experts')` and `revalidatePath('/experts/' + id)` — `route.test.ts` asserts the call (and that it's skipped on no-op)
- [x] Idempotent: calling with the current value is a no-op (no toast spam, no DB write) — `route.test.ts` "no-op when the value is unchanged → no write, no revalidate"
- [x] Unit test covers happy path, wrong owner, no-op — `route.test.ts` (4 cases) + dashboard E2E

## Tasks
- [completed] Build `PATCH app/api/experts/[id]/availability/route.ts` — auth required (401), owner check `experts.user_id = current profile.id` (403)
- [completed] Add `lib/schemas/availability.ts` Zod (`{ is_available: boolean }`); update only `is_available`, never `status`
- [completed] No-op guard: if the incoming value equals the current value, skip the DB write and return success (no toast spam)
- [completed] On change: `revalidatePath('/experts')` + `revalidatePath('/experts/' + id)`; return `{ ok: true, data: { is_available } }`
- [completed] Wire the expert-dashboard toggle switch to this endpoint; unit tests: happy path, wrong owner (403), no-op

## Notes
- _Executed 2026-05-26: narrow PATCH endpoint (owner-only, no admin bypass per AC) updating just `is_available`; no-op short-circuits before any write/revalidate. `AvailabilityToggle` (role=switch) wired into the expert dashboard's Availability tab. 4 route unit tests + a dashboard E2E that flips the switch and confirms DB persistence._

## Notes
- Endpoint per `TECHNICAL-REQUIREMENTS.md` §6.2.
- Narrow surface intentional — availability is the most-toggled field, splitting it from the general PATCH simplifies UI (single switch, single endpoint).
