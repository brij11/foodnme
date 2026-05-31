---
id: story-experts-12
topic: experts
sprint: 5
story_points: 3
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-31
executed_date: 2026-06-01
exec_model: sonnet
dependencies:
  - story-experts-01
  - story-experts-08
  - story-experts-09
design:
  - design/screens-experts.jsx
---

# story-experts-12 — Experts listing & card parity (verified filter, sort, tag variant)

## User story
As a visitor browsing experts, I want to filter to verified experts and sort the directory, so that I can find credible experts the way the design intended.

## Description
The build's experts listing dropped the "Verified experts only" toggle and the sort control entirely. The build's own code comment justifies this as "no rating column (§4.2)" — **but that is false**: `experts.rating`, `review_count`, and `is_featured` all exist (`TECHNICAL-REQUIREMENTS.md:140-144`). These are genuine regressions on supported schema. Also fixes the ExpertCard specialization tag variant. Covers DEVIATIONS.md **A1, A2, C4** (and a confirm-only review of the **B16-B19** ExpertCard restructure).

## Acceptance criteria
- [x] Experts sidebar includes a "Verified experts only" toggle that filters on `is_featured` (DEVIATIONS A1; `web/components/experts/ExpertsFilterSidebar.tsx:45-51` vs `design/screens-experts.jsx:55-58`) — covered by `listExperts` tests in experts.test.ts (AC#1/DEVIATIONS A1)
- [x] Experts listing has a sort control (Top rated / Most experienced) backed by `rating` + `experience_years` (DEVIATIONS A2; `web/app/(public)/experts/page.tsx:62-67` vs `design/screens-experts.jsx:79-85`) — covered by sort tests in experts.test.ts (AC#2/DEVIATIONS A2)
- [x] The misleading "no rating column, §4.2" comment in `ExpertsFilterSidebar.tsx:7-8` is removed/corrected — docstring now correctly states is_featured exists at TECHNICAL-REQUIREMENTS.md §4.2 lines 140-144
- [x] ExpertCard specialization tags use the `neutral` tag variant, not `outline-green` (DEVIATIONS C4; `web/components/experts/ExpertCard.tsx:65` vs `design/ui.jsx:590`) — covered by ExpertCard.test.tsx (AC#4/DEVIATIONS C4)
- [x] ExpertCard restructure (availability placement, Verified text tag, View-profile button, "New" rating state) reviewed against `design/screens-experts.jsx`; kept if it's the sanctioned experts-09 evolution, with copy aligned ("Busy" vs "Unavailable") (DEVIATIONS B16-B19) — ExpertCard.tsx:83 uses "Busy"; covered by ExpertCard.test.tsx (AC#5/DEVIATIONS B19)
- [x] No regression to the faithful filters (search, available toggle, specialization multi-select, 2-col grid, re-stagger) — all filters present in ExpertsFilterSidebar.tsx; 2-col grid + stagger in experts/page.tsx

## Tasks
- [completed] Add a "Verified experts only" toggle to the experts sidebar filtering on `is_featured` (AC 1)
- [completed] Add a sort control (Top rated / Most experienced) backed by `rating` + `experience_years` (AC 2)
- [completed] Remove/correct the misleading "no rating column, §4.2" comment in `ExpertsFilterSidebar.tsx` (AC 3)
- [completed] Change ExpertCard specialization tags from `outline-green` to the `neutral` variant (AC 4)
- [completed] Review the ExpertCard restructure vs the prototype; keep the sanctioned experts-09 evolution and align copy ("Busy" vs "Unavailable") (AC 5)
- [completed] Add/adjust tests: verified filter + sort behavior + tag variant (AC 1, 2, 4)

## Notes
- exec_model: sonnet — restores filters/sort on already-existing schema columns (`is_featured`, `rating`, `experience_years`); no migration.
- Source: `plan/DEVIATIONS.md` A1, A2, C4, and the ExpertCard half of B16-B19.
- A1/A2 are the highest-priority Sprint-5 items: easy wins on existing schema that were dropped on a false premise. `outline-green` is reserved for the article-detail keyword row.
