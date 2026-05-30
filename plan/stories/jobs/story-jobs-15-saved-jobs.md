---
id: story-jobs-15
topic: jobs
sprint: 4
story_points: 4
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-30
executed_date: 2026-05-30
dependencies:
  - story-jobs-02
  - story-jobs-07
design:
  - design/screens-jobs.jsx
  - design/screens-dashboard.jsx
---

# story-jobs-15 — Saved jobs (save action + persistence + seeker tab)

## User story
As a job seeker, I want to save roles I'm interested in, so that I can come back and apply to them later.

## Description
There is no save/bookmark capability anywhere: the job-detail "Save for later" button and the seeker dashboard "Saved jobs" tab are dead/placeholder. **OQ#12 is resolved (2026-05-30): a generalized `saved_items(user_id, item_type, item_id, saved_at)` table** (`item_type ∈ ('job','expert')`, self-scoped RLS) backs saved jobs here and saved experts in `story-experts-10`. This story creates `saved_items` + the `POST/DELETE /api/saved-items` endpoint, adds a save/unsave action (with `item_type='job'`) on the job card and detail page, and renders the real list in the seeker dashboard "Saved jobs" tab.

## Acceptance criteria
- [x] Migration adds the generalized `saved_items` table (per §4.2) with self-scoped RLS and `UNIQUE(user_id, item_type, item_id)` — `20260530000007_saved_items.sql`; `e2e/saved-jobs.spec.ts` (anon cannot read)
- [x] Authenticated seekers can save/unsave a job (`item_type='job'`) from the job detail page ("Save for later") and the `JobCard`; the control reflects saved state — `SaveButton` (detail + card variants) reads saved state on mount; E2E saves on detail → "Saved", unsaves → "Save for later"
- [x] Anonymous users hitting save are routed to `/login?redirect=…` — `SaveButton` anon branch; E2E asserts redirect to `/login?redirect=%2Fjobs%2F<id>`
- [x] `POST/DELETE /api/saved-items` validates `{item_type,item_id}` with Zod and enforces auth + self-scoped RLS; documented in §6.2 — `app/api/saved-items/route.ts` (user-session client → RLS); `route.test.ts` (upsert/onConflict, 401, 400, scoped delete)
- [x] Seeker dashboard "Saved jobs" tab lists saved roles (filtering `saved_items` to `item_type='job'`) with an apply CTA, and an empty state when none — seeker page fetches saved jobs; `SeekerDashboard` Saved tab list + "View & apply"; E2E asserts row + empty state after unsave
- [x] Seeker stat card "Saved jobs" count (from `story-jobs-13`) reflects the real total — page sets `stats.saved = savedIds.length`
- [x] Saving an already-saved job is idempotent (unique-constraint upsert) — `onConflict ignoreDuplicates`; `route.test.ts` + E2E assert a single row after a double-save

## Tasks
- [completed] Write migration: generalized `saved_items` table (id, user_id FK, item_type CHECK ('job','expert'), item_id, saved_at) + `UNIQUE(user_id, item_type, item_id)` + self-scoped RLS (read/insert/delete own)
- [completed] Implement `POST /api/saved-items` (idempotent upsert) and `DELETE /api/saved-items`, Zod-validating `{item_type,item_id}`, auth-required, RLS self-scoped
- [completed] Add a save/unsave control (`item_type='job'`) to the job detail "Save for later" and the `JobCard`, reflecting saved state; anon → `/login?redirect=…`
- [completed] Replace the seeker dashboard "Saved jobs" tab placeholder with the real list (saved_items filtered to jobs) + apply CTA + empty state
- [completed] Ensure the seeker "Saved jobs" stat card (story-jobs-13) reads the real count
- [completed] Add tests: save/unsave idempotency, anon redirect, RLS self-scoping, dashboard list + empty state

## Notes
- Audit gaps #16 Seeker (Saved tab), JD3 (Save for later), X3 (Saved jobs feature). OQ#12 resolved 2026-05-30.
- OQ#12 generalized to `saved_items` (not job-specific `saved_jobs`) so the same table + `/api/saved-items` endpoint backs `story-experts-10`'s "Save profile" (`item_type='expert'`). `story-experts-10` depends on this story for that table. Documented in `TECHNICAL-REQUIREMENTS.md` §4.1/§4.2/§6.2 + Appendix.
