---
id: story-experts-10
topic: experts
sprint: 4
story_points: 4
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-30
executed_date: 2026-05-30
dependencies:
  - story-experts-02
  - story-experts-08
  - story-jobs-15
design:
  - design/screens-experts.jsx
---

# story-experts-10 — Expert detail enrichment (engagement types, similar experts, save, stats)

## User story
As a business evaluating an expert, I want to see how I can engage them, their reputation, and similar experts, so that I can make a confident contact decision.

## Description
`app/(public)/experts/[id]/page.tsx` has hero, about, specializations, certifications, and a basic quick-stats aside. Add the designed sections from `screens-experts.jsx`: an **engagement types** block (Hourly consult / Project / Retainer with prices), a **similar experts** grid, a **"Save profile"** action, and extended **quick-stats** rows (rating, reviews, response time). Engagement/rating data comes from `story-experts-08`.

## Acceptance criteria
- [x] Engagement-types block renders the available types (hourly/project/retainer) with their pricing from `experts.engagement_types` (`story-experts-08`) — `engagement-types` section; `e2e/expert-detail-enrichment.spec.ts` asserts Hourly consult + Retainer
- [x] "Similar experts" grid renders related experts (by overlapping specialization), excluding the current expert and non-active profiles; hidden when none — `getSimilarExperts` (overlaps, `neq` current, active, featured-first); rendered grid (verified via RSC: Aarti → Karthik only, self excluded); hidden when empty
- [x] Quick-stats aside adds rating, review count, and response time alongside experience/rate/location — `quick-stats` rows; E2E asserts Rating/Reviews/Response time
- [x] "Save profile" saves/unsaves the expert via `POST/DELETE /api/saved-items` with `item_type='expert'`; gated to authenticated users (anonymous → `/login?redirect=…`); control reflects saved state and is idempotent — generalized `SaveButton itemType="expert"`; E2E asserts anon→`/login?redirect=%2Fexperts%2F<id>` and authed save persists one expert-typed row
- [x] Avatar uses `next/image` per §7.5 (replacing the raw `<img>`), here and on the card — `next/image` on the detail hero + `ExpertCard` (hosts already allow-listed in `next.config`)
- [x] Sections degrade gracefully when optional data (reviews, engagement types) is absent — engagement block + rating/reviews rows render only when present
- [x] Matches `screens-experts.jsx` layout; green only on actionable elements — ported sections; experts-detail a11y E2E passes

## Tasks
- [completed] Add the engagement-types block (hourly / project / retainer with prices) reading `experts.engagement_types`, per `screens-experts.jsx`
- [completed] Add the "Similar experts" grid (overlapping specialization; exclude current expert + non-active; hidden when none)
- [completed] Extend the quick-stats aside with rating, review count, and response time alongside experience / rate / location
- [completed] Add the "Save profile" save/unsave control wired to `POST/DELETE /api/saved-items` (`item_type='expert'`); authed-only with anon → `/login?redirect=…`; reflect saved state; idempotent
- [completed] Replace the raw `<img>` avatar with `next/image` (per §7.5) on the detail page and the card
- [completed] Ensure graceful degradation when reviews / engagement types are absent; match layout; green only on actionable elements
- [completed] Add tests for engagement-types render, similar-experts filtering, and save/unsave (incl. anon redirect)

## Notes
- Audit gaps ED1–ED5 (Partial). Hard-depends on `story-experts-08`.
- Save-persistence decision (2026-05-30): the generalized `saved_items` table (OQ#12) is created by `story-jobs-15`; this story now **depends on `story-jobs-15`** and reuses `saved_items` with `item_type='expert'` (option a). Execution must build jobs-15 first — note that experts-10 was analyzed before jobs-15 in this run, but the dependency is recorded for `/execute-sprint`. No cycle (jobs-15 depends only on jobs-02/jobs-07).
