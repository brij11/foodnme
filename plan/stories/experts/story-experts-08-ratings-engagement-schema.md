---
id: story-experts-08
topic: experts
sprint: 4
story_points: 3
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-30
executed_date: 2026-05-30
dependencies: []
design:
  - none-needed
---

# story-experts-08 — Expert ratings, reviews & engagement-types schema

## User story
As a business evaluating an expert, I want to see ratings and engagement options, so that I can judge reputation and how I'd work with them — which the data model must first support.

## Description
Data-layer prerequisite for the designed expert card + detail. `experts` has no `rating`, `review_count`, or `response_time`, and no engagement-type/pricing model (§4.2). **OQ#10 is resolved (2026-05-30): no reviews table.** Add `rating numeric(2,1)`, `review_count int`, `response_time text`, and `engagement_types jsonb` (array of `{kind,title,desc,price}` with `kind ∈ ('hourly','project','retainer')`; the hourly price derives from `hourly_rate`) directly to `experts`. No UI in this story.

## Acceptance criteria
- [x] Migration adds `rating numeric(2,1)`, `review_count int DEFAULT 0`, `response_time text`, and `engagement_types jsonb` to `experts`, with RLS unchanged — `20260530000002_expert_ratings_engagement.sql`; psql confirms all 4 columns + no RLS change; `e2e/expert-ratings.spec.ts` (anon still cannot write)
- [x] `rating` and `review_count` are **stored directly** (rating is `numeric(2,1)`, one-decimal precision, 0.0–5.0) — not aggregated/computed from any reviews table — stored columns with `check (rating between 0 and 5)`; no reviews table exists; E2E asserts 0 ≤ rating ≤ 5 and review_count > 0
- [x] `engagement_types` rows validate against the `{kind,title,desc,price}` shape (`kind ∈ ('hourly','project','retainer')`); hourly entry's price reflects `hourly_rate` — `experts_engagement_types_valid` CHECK via the IMMUTABLE `valid_engagement_types(jsonb)` fn; `e2e/expert-ratings.spec.ts` rejects a `kind:'bogus'` insert and accepts a valid one; seed hourly price = `₹{hourly_rate}/hr`
- [x] `seed.sql` populates rating, review_count, response_time, and engagement_types for ported prototype experts — all 8 experts populated (psql: rating/review_count/response_time + 3 engagement types each)
- [x] `lib/experts` reads used by the card and detail page expose the new fields — `ExpertCardData` gains `rating`/`review_count`/`response_time`; `ExpertDetail` adds `engagement_types: EngagementType[]`; `CARD_COLUMNS`/`DETAIL_COLUMNS` updated
- [x] TypeScript types regenerated; strict-clean — `types/database.ts` regenerated (engagement_types/review_count/response_time present); `pnpm typecheck` clean

## Tasks
- [completed] Write migration adding `rating numeric(2,1)`, `review_count int DEFAULT 0`, `response_time text`, `engagement_types jsonb` to `experts`
- [completed] Add a check/validation so `engagement_types` entries conform to `{kind,title,desc,price}` with `kind ∈ ('hourly','project','retainer')`
- [completed] Update `seed.sql`: populate rating, review_count, response_time, and the three engagement-type entries for each ported prototype expert (hourly price from `hourly_rate`)
- [completed] Extend `lib/experts` card + detail reads to expose the new fields
- [completed] Regenerate TypeScript types; confirm strict-clean
- [completed] Verify RLS unchanged: anon reads the new fields on `experts (status='active')`, cannot write

## Notes
- Audit gaps E5 + ED6 (Schema): backs `story-experts-09` (card) and `story-experts-10` (detail).
- OQ#10 resolved 2026-05-30 during analysis: **no reviews table** — rating/review_count/response_time stored directly + `engagement_types jsonb`. Documented in `TECHNICAL-REQUIREMENTS.md` §4.2 + Appendix.
- `none-needed` design: pure data/schema story.
