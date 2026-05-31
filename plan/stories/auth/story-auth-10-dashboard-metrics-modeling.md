---
id: story-auth-10
topic: auth
sprint: 5
story_points: 2
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-31
exec_model: sonnet
executed_date: 2026-05-31
dependencies:
  - story-auth-07
  - story-jobs-07
  - story-jobs-13
  - story-jobs-14
design:
  - design/screens-dashboard.jsx
---

# story-auth-10 — Dashboard metrics scope alignment (drop unmodeled tiles)

## User story
As a dashboard user, I want the stat tiles to show only real, modeled numbers, so that the dashboard is honest and uncluttered rather than padded with empty placeholders.

## Description
Resolved during Sprint-5 analysis by **amending the design contract** rather than building analytics infrastructure: `UI-DESIGN-HANDOFF.md §3.8` now states the dashboards render only metrics backed by modeled data this milestone, and the unmodeled tiles are dropped (not shown as `"—"`). This story aligns the build to that amended contract by removing the placeholder stat tiles. The metrics themselves (profile views, match score, avg time-to-hire) remain a future open question — `TECHNICAL-REQUIREMENTS.md` OQ#13 — to revisit when dashboard analytics are prioritized. Originates from DEVIATIONS.md **A5, B7, B8, B9** (the `[deferred]` dashboard metrics).

## Acceptance criteria
- [x] SeekerDashboard renders only the Applications + Saved stat tiles; the "Profile views" and "Match score" tiles are removed entirely (no `"—"` placeholder) — `SeekerDashboard.test.tsx` asserts absence
- [x] EmployerDashboard renders only Active listings + Total applicants + Pending review; the "Avg. time to hire" tile is removed entirely (no `"—"`) — `EmployerDashboard.test.tsx` asserts absence
- [x] The employer recent-applicants list shows no match-score column — confirmed and locked with `EmployerDashboard.test.tsx`
- [x] ExpertDashboard tiles are unchanged (Inquiries, Avg rating, Response time, Availability) — `ExpertDashboard.test.tsx` confirms Profile views and Active engagements absent
- [x] Each stat grid reflows cleanly with fewer tiles — SeekerDashboard uses `grid-cols-2`, EmployerDashboard uses `lg:grid-cols-3` (no empty cells)
- [x] Affected dashboard tests assert the removed tiles are absent — 21 tests pass

## Tasks
- [completed] Remove the Seeker "Profile views" + "Match score" stat tiles and reflow the stat grid (AC 1, 5)
- [completed] Remove the Employer "Avg. time to hire" stat tile and reflow the stat grid (AC 2, 5)
- [completed] Confirm the recent-applicants list has no match-score column and lock it with a test (AC 3)
- [completed] Verify the Expert dashboard tiles already match amended §3.8 — no change expected (AC 4)
- [completed] Update dashboard component tests to assert the removed tiles are absent (AC 6)

## Notes
- Source: `plan/DEVIATIONS.md` A5, B7, B8, B9 (all tagged `[deferred]`).
- exec_model: sonnet — pure UI tile-removal + grid reflow; no schema/security. (Analysis needed a doc reconciliation, but the build work itself is trivial — 1 signal.)
- **Resolved (analysis, 2026-05-31):** founder chose to **amend the design contract** rather than model the metrics. `UI-DESIGN-HANDOFF.md §3.8` updated (metrics-scope note) + `TECHNICAL-REQUIREMENTS.md` OQ#13 added. Story re-scoped from "model the metrics" (was 5 SP, blocked) to "drop the placeholder tiles to match the amended contract" (2 SP) and marked ready.
- The metrics return only when modeled (view-event tracking, match-score definition, hire-event timestamps) — tracked as OQ#13; a future story would re-add the tiles.
