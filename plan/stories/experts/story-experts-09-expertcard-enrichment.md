---
id: story-experts-09
topic: experts
sprint: 4
story_points: 3
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-30
executed_date: 2026-05-30
dependencies:
  - story-experts-01
  - story-experts-08
design:
  - design/screens-experts.jsx
---

# story-experts-09 — ExpertCard enrichment

## User story
As a business browsing the directory, I want each expert card to show their rating and a short bio, so that I can shortlist credible experts at a glance.

## Description
`components/experts/ExpertCard.tsx` is missing designed elements. Per `screens-experts.jsx`, the card should show a rating (star + number + reviews count), a 2-line bio snippet, and the top 3 specializations (currently 2). Rating/reviews come from `story-experts-08`.

## Acceptance criteria
- [x] Card shows a rating: star icon + numeric rating + review count — `ExpertCard.tsx` rating row (filled `star` + `rating.toFixed(1)` + count); `ExpertCard.test.tsx`, `e2e/expert-ratings.spec.ts`
- [x] Card shows a 2-line (clamped) bio snippet — `line-clamp-2` bio paragraph; `ExpertCard.test.tsx` asserts the clamp class
- [x] Card shows up to 3 specialization tags (was 2) — `slice(0, 3)`; test asserts the 4th tag is dropped
- [x] Rating/reviews read from the `story-experts-08` fields (no hard-coded data); cards with no reviews render gracefully (e.g. "New") — reads `expert.rating`/`expert.review_count`; renders "New" when `review_count === 0`; test covers the fallback
- [x] Existing avatar/availability/rate/View-profile elements preserved — test asserts initials, availability, rate, Verified badge, and the View-profile link href all remain
- [x] Matches `screens-experts.jsx` density/type; green only on actionable elements — ported layout (rating uses `text-accent` star, View-profile keeps the only hover-primary affordance); experts-listing a11y E2E still passes

## Tasks
- [completed] Add the rating display to `ExpertCard.tsx` (star icon + numeric `rating` + `review_count`) reading the `story-experts-08` fields; render "New" (or omit) gracefully when `review_count` is 0
- [completed] Add a 2-line clamped bio snippet from `experts.bio`
- [completed] Show up to 3 specialization tags (raised from 2)
- [completed] Preserve existing avatar / availability / rate / View-profile elements and the Verified badge
- [completed] Match `screens-experts.jsx` density/type; green confined to actionable elements
- [completed] Add a test covering rating render, the "New"/no-reviews fallback, and the 3-tag cap

## Notes
- Audit gaps E1–E3 (Partial/Minor). Rating reads the `story-experts-08` fields (analyzed 2026-05-30).
- E4 (quick filters): "Available now" already exists in `ExpertsFilterSidebar`; confirm/extend "Verified only" there if still missing — out of this card story's core scope.
