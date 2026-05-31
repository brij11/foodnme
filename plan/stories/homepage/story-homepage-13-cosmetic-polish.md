---
id: story-homepage-13
topic: homepage
sprint: 5
story_points: 1
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-31
exec_model: sonnet
executed_date: 2026-05-31
dependencies:
  - story-homepage-08
  - story-services-01
design:
  - design/screens-main.jsx
---

# story-homepage-13 — Cross-surface cosmetic polish

## User story
As a stakeholder reviewing the site against the design, I want the small cross-surface copy/visual nits cleaned up, so that no remaining detail reads as off-brand.

## Description
Catch-all for the low-severity cosmetic deviations that don't belong to a single feature story. Covers DEVIATIONS.md **D5, D6**. (Other D-items are folded into their surface stories: D1→homepage-11, D2→homepage-12, D3/D4→blog-12, D7–D10→jobs-16, D11→homepage-10, D12→experts-13.)

## Acceptance criteria
- [x] About-page newsletter-subscriber stat reads "4.2k" (approximate style, §5.2), not "4,200+" (DEVIATIONS D5; `web/app/(public)/about/page.tsx:55` vs `design/screens-main.jsx:896`)
- [x] ServiceCard "Learn more" affordance matches the prototype's ghost-button treatment (DEVIATIONS D6; `web/components/services/ServiceCard.tsx:22-30` vs `design/ui.jsx:444`)
- [x] No new stat copy uses round thousands anywhere (§5.2 spot-check on touched surfaces)

## Tasks
- [completed] Change the About newsletter-subscriber stat from "4,200+" to "4.2k" (AC 1)
- [completed] Restore the ServiceCard "Learn more" ghost-button treatment (AC 2)
- [completed] Spot-check touched surfaces for round-thousand stat copy per §5.2 (AC 3)

## Notes
- exec_model: sonnet — copy change + one component-styling nit.
- Source: `plan/DEVIATIONS.md` D5, D6.
- AC 1 covered by `web/app/(public)/about/page.test.tsx` (source-level assertion). AC 2 covered by `web/components/services/ServiceCard.test.tsx` (4 tests). AC 3 covered by cross-surface grep + same test files.
- AuthShell.tsx login panel also had "4,200+" (§5.2 violation) — fixed alongside D5.
- D13 (build added a free-text Location filter on jobs/experts that the prototype lacked) is an accepted enhancement — no action; recorded here so it isn't re-raised.
