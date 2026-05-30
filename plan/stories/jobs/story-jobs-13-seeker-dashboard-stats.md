---
id: story-jobs-13
topic: jobs
sprint: 4
story_points: 2
status: ready
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-30
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
- [ ] Seeker dashboard renders a 4-card stats grid above the applications list
- [ ] "Applications" total and per-status counts (submitted / reviewed / rejected) are shown from the seeker's own rows via RLS
- [ ] "Saved jobs" count reflects the saved-jobs feature (`story-jobs-15`); shows 0 until that ships
- [ ] Cards match `screens-dashboard.jsx` styling; numbers in dark-olive per §4.1
- [ ] "Profile views" and "Match score" (the design's 4th/3rd cards) render "—" because view/match tracking is not yet modeled; a code comment flags the future tracking story — the number is never fabricated

## Tasks
- [new] Add the 4-card stats grid (Applications, Saved jobs, Profile views, Match score) above the applications list in `SeekerDashboard.tsx`, matching `screens-dashboard.jsx`
- [new] Compute "Applications" total + per-status counts (submitted / reviewed / interview / rejected) from the seeker's own rows via RLS
- [new] Wire the "Saved jobs" count to the saved-jobs feature (`story-jobs-15`); show 0 until that ships
- [new] Render "Profile views" and "Match score" as "—" with a comment referencing a future tracking story (no fabricated values); numbers in dark-olive per §4.1
- [new] Add a test asserting the status-derived counts and the "—" placeholders (no fabricated metrics)

## Notes
- Audit gap #16 Seeker (Partial). Profile-views/match-score require analytics not yet modeled.
- Analysis 2026-05-30: kept the four design-contract cards (UI-DESIGN-HANDOFF §3) and render the two untracked metrics as "—" per the no-fabrication rule; no schema change, no new dependency (the saved count degrades to 0 until `story-jobs-15`).
