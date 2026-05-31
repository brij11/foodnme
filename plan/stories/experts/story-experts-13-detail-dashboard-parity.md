---
id: story-experts-13
topic: experts
sprint: 5
story_points: 3
status: in-progress
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-31
exec_model: sonnet
dependencies:
  - story-experts-10
  - story-experts-11
design:
  - design/screens-experts.jsx
  - design/screens-dashboard.jsx
---

# story-experts-13 — Expert detail & dashboard parity

## User story
As an expert and a visitor viewing an expert, I want engagement options and dashboard controls laid out as designed, so that the profile and dashboard read the way the prototype intended.

## Description
Expert-detail and expert-dashboard layout deviations: engagement types render as a vertical list instead of the designed 3-card grid, the quick-stats aside reorders/conditionally hides rows, the dashboard availability toggle moved out of the header into a separate tab, and the dashboard stat tiles were relabeled (Profile views + Active engagements dropped). Covers DEVIATIONS.md **B10, B11, B12, D12**.

## Acceptance criteria
- [ ] Expert-detail engagement types render as a responsive 3-up card grid (Hourly / Project / Retainer), not a stacked list (DEVIATIONS B12; `web/app/(public)/experts/[id]/page.tsx:138-156` vs `design/screens-experts.jsx:173-186`)
- [ ] Expert-dashboard stat tiles either restore the prototype labels (Profile views, Inquiries, Avg. rating, Active engagements) or the swap is documented in the handoff (DEVIATIONS B10; `web/components/dashboard/ExpertDashboard.tsx:117-132`)
- [ ] Availability toggle is surfaced on the dashboard overview header (in addition to / instead of the separate tab) per the design (DEVIATIONS B11; `web/components/dashboard/ExpertDashboard.tsx:186-206`)
- [ ] Expert-detail quick-stats aside ordering reviewed against the design; the graceful "New"/unrated handling is preserved (DEVIATIONS D12; `web/app/(public)/experts/[id]/page.tsx:161-201`)
- [ ] No regression to faithful detail pieces (hero, bio, specializations, certifications, contact modal, save, similar-experts rail)

## Tasks
- [completed] Render expert-detail engagement types as a responsive 3-up card grid (Hourly / Project / Retainer) (AC 1)
- [completed] Restore the prototype expert-dashboard stat-tile labels, or document the swap in the handoff (AC 2)
- [completed] Surface the availability toggle on the dashboard overview header in addition to the tab (AC 3)
- [completed] Review the quick-stats aside ordering vs design; preserve the graceful "New"/unrated handling (AC 4)
- [completed] Update affected expert detail/dashboard tests (AC 1, 3)

## Notes
- exec_model: sonnet — layout + label changes on existing data.
- Source: `plan/DEVIATIONS.md` B10, B11, B12, D12.
- "Profile views" / "Active engagements" depend on data that may not be modeled (see story-auth-10); if so, scope this story to the layout/label changes and the toggle placement, leaving unmodeled tiles as documented placeholders.
