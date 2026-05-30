---
id: story-jobs-13
topic: jobs
sprint: 4
story_points: 2
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-30
executed_date: 2026-05-30
dependencies:
  - story-jobs-07
design:
  - design/screens-dashboard.jsx
---

# story-jobs-13 — Seeker dashboard stat cards

## User story
As a job seeker, I want a quick summary of my activity at the top of my dashboard, so that I can see my application status at a glance.

## Description
The seeker dashboard (`components/dashboard/SeekerDashboard.tsx`) shows the applications list but is missing the designed 4-card stats grid (`screens-dashboard.jsx`). Add a stats row rendering metrics derivable from the seeker's data; metrics that require tracking not yet in the schema are marked TBD rather than faked.

## Acceptance criteria
- [x] Seeker dashboard renders a 4-card stats grid above the applications list — `seeker-stats` grid above the filter chips; `SeekerDashboard.test.tsx` + `e2e/seeker-dashboard.spec.ts`
- [x] "Applications" total and per-status counts (submitted / reviewed / rejected) are shown from the seeker's own rows via RLS — page computes unfiltered counts from the seeker's applications; card shows total + "N submitted · N reviewed · N closed"; unit asserts the breakdown
- [x] "Saved jobs" count reflects the saved-jobs feature (`story-jobs-15`); shows 0 until that ships — `stats.saved` defaults 0 (no saved_items table yet); unit asserts "0"
- [x] Cards match `screens-dashboard.jsx` styling; numbers in dark-olive per §4.1 — `StatCard` value uses `text-text` (dark olive)
- [x] "Profile views" and "Match score" (the design's 4th/3rd cards) render "—" because view/match tracking is not yet modeled; a code comment flags the future tracking story — the number is never fabricated — both render "—"; code comment references a future analytics story; unit asserts exactly two "—" placeholders

## Tasks
- [completed] Add the 4-card stats grid (Applications, Saved jobs, Profile views, Match score) above the applications list in `SeekerDashboard.tsx`, matching `screens-dashboard.jsx`
- [completed] Compute "Applications" total + per-status counts (submitted / reviewed / rejected) from the seeker's own rows via RLS
- [completed] Wire the "Saved jobs" count to the saved-jobs feature (`story-jobs-15`); show 0 until that ships
- [completed] Render "Profile views" and "Match score" as "—" with a comment referencing a future tracking story (no fabricated values); numbers in dark-olive per §4.1
- [completed] Add a test asserting the status-derived counts and the "—" placeholders (no fabricated metrics)

## Notes
- Audit gap #16 Seeker (Partial). Profile-views/match-score require analytics not yet modeled.
- Analysis 2026-05-30: kept the four design-contract cards (UI-DESIGN-HANDOFF §3) and render the two untracked metrics as "—" per the no-fabrication rule; no schema change, no new dependency (the saved count degrades to 0 until `story-jobs-15`).
