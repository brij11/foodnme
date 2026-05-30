---
id: story-jobs-09
topic: jobs
sprint: 4
story_points: 2
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

# story-jobs-09 — Structured job fields + `is_featured` schema

## User story
As an employer posting a role, I want to capture responsibilities and requirements as distinct lists, so that the job detail page can present them clearly instead of as one wall of text.

## Description
Data-layer prerequisite for the designed job detail and card. `jobs` currently stores a single `description` text and has no `is_featured` (§4.2), so the "What you'll do" / "Who we're looking for" sections and the featured badge cannot render. **OQ#11 is resolved (2026-05-30):** add `responsibilities text[]`, `requirements text[]`, and `is_featured boolean DEFAULT false` to `jobs`; `description` is retained for back-compat. Update the post-job validation/schema and seed accordingly. No UI in this story.

## Acceptance criteria
- [x] Migration adds `responsibilities text[]`, `requirements text[]`, and `is_featured boolean DEFAULT false` to `jobs`, with RLS unchanged — `20260530000004_job_structured_fields.sql`; `e2e/jobs-schema.spec.ts` (anon reads the fields, still cannot write)
- [x] `POST /api/jobs` Zod schema + post-job form payload extended to accept the new fields (back-compatible: existing `description` still supported) — `jobSchema` gains optional `responsibilities`/`requirements` (default `[]`) + `is_featured`; route persists the arrays (is_featured stays admin-controlled); existing `route.test.ts` (9 tests) green with the description-only payload
- [x] `seed.sql` populates the structured fields for ported prototype jobs — all 7 jobs get 3 responsibilities + 3 requirements; 2 marked `is_featured` (psql verified)
- [x] `lib/jobs` read used by `/jobs/[id]` and the card exposes the new fields — `JobCardData` gains `is_featured`; `JobDetail` adds `responsibilities`/`requirements`; `CARD_COLUMNS`/`DETAIL_COLUMNS` updated
- [x] TypeScript types regenerated; strict-clean — `types/database.ts` regenerated; `pnpm typecheck` clean

## Tasks
- [completed] Write migration adding `responsibilities text[]`, `requirements text[]`, `is_featured boolean DEFAULT false` to `jobs` (RLS unchanged)
- [completed] Extend `POST /api/jobs` Zod schema + post-job form payload to accept the new fields (optional; back-compatible with `description`-only)
- [completed] Update `seed.sql` to populate responsibilities/requirements/is_featured for ported prototype jobs
- [completed] Extend the `lib/jobs` reads used by `/jobs/[id]` and the card to expose the new fields
- [completed] Regenerate TypeScript types; confirm strict-clean

## Notes
- Audit gaps JD8 + J4 (Schema): backs `story-jobs-10` (card featured badge) and `story-jobs-11` (structured detail sections).
- OQ#11 resolved 2026-05-30 during analysis: array columns + `is_featured`, `description` kept for back-compat. Documented in `TECHNICAL-REQUIREMENTS.md` §4.2 + Appendix.
- `none-needed` design: pure data/schema story.
