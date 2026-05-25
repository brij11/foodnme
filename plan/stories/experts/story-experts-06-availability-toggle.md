---
id: story-experts-06
topic: experts
sprint: 2
story_points: 2
status: draft
owner: brij
tasks_populated: false
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
- [ ] Authenticated user; 401 otherwise
- [ ] User must own the row (`experts.user_id = current profile.id`); 403 otherwise
- [ ] Updates `is_available` only — nothing else changes
- [ ] Returns `{ ok: true, data: { is_available } }`
- [ ] Cache invalidation: `revalidatePath('/experts')` and `revalidatePath('/experts/' + id)`
- [ ] Idempotent: calling with the current value is a no-op (no toast spam, no DB write)
- [ ] Unit test covers happy path, wrong owner, no-op

## Tasks
<!-- Populated by the downstream task-breakdown step, not by this skill.
     Each task should map to one or more acceptance criteria above and be
     small enough to land in a single commit. Until populated, this section
     stays as the single TODO line below. -->
- [ ] TODO — break this story into implementation tasks

## Notes
- Endpoint per `TECHNICAL-REQUIREMENTS.md` §6.2.
- Narrow surface intentional — availability is the most-toggled field, splitting it from the general PATCH simplifies UI (single switch, single endpoint).
