---
id: story-jobs-09
topic: jobs
sprint: 4
story_points: 2
status: ready
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-30
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
- [ ] Migration adds `responsibilities text[]`, `requirements text[]`, and `is_featured boolean DEFAULT false` to `jobs`, with RLS unchanged
- [ ] `POST /api/jobs` Zod schema + post-job form payload extended to accept the new fields (back-compatible: existing `description` still supported)
- [ ] `seed.sql` populates the structured fields for ported prototype jobs
- [ ] `lib/jobs` read used by `/jobs/[id]` and the card exposes the new fields
- [ ] TypeScript types regenerated; strict-clean

## Tasks
- [new] Write migration adding `responsibilities text[]`, `requirements text[]`, `is_featured boolean DEFAULT false` to `jobs` (RLS unchanged)
- [new] Extend `POST /api/jobs` Zod schema + post-job form payload to accept the new fields (optional; back-compatible with `description`-only)
- [new] Update `seed.sql` to populate responsibilities/requirements/is_featured for ported prototype jobs
- [new] Extend the `lib/jobs` reads used by `/jobs/[id]` and the card to expose the new fields
- [new] Regenerate TypeScript types; confirm strict-clean

## Notes
- Audit gaps JD8 + J4 (Schema): backs `story-jobs-10` (card featured badge) and `story-jobs-11` (structured detail sections).
- OQ#11 resolved 2026-05-30 during analysis: array columns + `is_featured`, `description` kept for back-compat. Documented in `TECHNICAL-REQUIREMENTS.md` §4.2 + Appendix.
- `none-needed` design: pure data/schema story.
