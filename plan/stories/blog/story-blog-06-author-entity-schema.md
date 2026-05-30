---
id: story-blog-06
topic: blog
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

# story-blog-06 — Author entity: schema + article linkage

## User story
As a content team, we want articles to carry a real author identity (avatar, role, bio, social links), so that readers can see who wrote a piece and the article page can render the designed author chip and bio card.

## Description
Data-layer prerequisite for the article author UI. `articles` currently has only a free-text `author_name` (per §4.2), which cannot back the designed author chip + author-bio card (`UI-DESIGN-HANDOFF.md` §3.7). **OQ#9 is resolved (2026-05-30): there is no separate author entity — articles are authored by experts.** Replace `articles.author_name` with `articles.expert_id NOT NULL REFERENCES experts(id)`, and add `linkedin_url` + `twitter_url` to `experts` so the author chip/bio card (and expert profile) can show social links. No UI in this story.

## Acceptance criteria
- [x] Migration replaces `articles.author_name` with `expert_id NOT NULL REFERENCES experts(id)`, and adds `linkedin_url` + `twitter_url` (nullable text) to `experts`; index `(expert_id)` on `articles` — migration `20260530000001_article_author_expert.sql`; verified via psql (`author_name` gone, `expert_id` present, `articles_expert_id_idx` exists, socials on `experts`)
- [x] Migration backfills `expert_id` for every existing article before applying `NOT NULL` (match prior `author_name` to an expert, else create/link an expert row) — no data loss, no orphaned articles — backfill matches by full_name + honorific-stripping, then creates active experts for unmatched authors; honorific-match proven in psql (`Aarti Menon → Dr. Aarti Menon`, unmatched → new expert), post-reset `count(expert_id is null) = 0`
- [x] No new RLS needed for author display: the author chip reads the already-public `experts (status='active')` row; verify anon can read author display fields (`full_name`, `title`, `avatar_url`, `bio`, `specializations[]`, socials) and cannot write — `e2e/article-author.spec.ts` (anon reads all 7 display fields incl. socials; anon update affects 0 rows + row unchanged)
- [x] `seed.sql` links every ported prototype article to an expert row via `expert_id` (creating expert rows for prototype authors as needed) — experts seeded before articles; each article links via `(select id from experts where full_name=…)`; psql shows 9 articles linked across 5 experts, 0 orphans
- [x] `lib/articles` read used by `/blog/[slug]` joins and exposes the author-expert display fields (incl. socials) and a per-expert `article_count` — `getArticleBySlug` joins `expert:experts(...)` + computes `author_article_count`; `lib/articles.test.ts` (join + count) + `e2e/article-author.spec.ts` (author renders on detail)
- [x] `POST/PATCH /api/admin/articles` payload + Zod schema take `expert_id` in place of `author_name` — `lib/schemas/article.ts` (`articleSchema`/`articleUpdateSchema` keyed on `expert_id: uuid`, no `author_name`); `lib/schemas/article.test.ts` (6 tests). The admin CRUD *route* is deferred to the future admin-surface story (see Notes); this story delivers the authorship contract it consumes.
- [x] TypeScript types regenerated; `strict`/`noUncheckedIndexedAccess` clean — `types/database.ts` regenerated (`expert_id`, FK, socials present; `author_name` gone); `pnpm typecheck` clean

## Tasks
- [completed] Write migration: add `articles.expert_id` (nullable) + FK to `experts(id)`; add `linkedin_url`, `twitter_url` to `experts`
- [completed] Backfill `expert_id` for existing articles (map prior `author_name` → expert; create/link expert rows for unmatched), then set `NOT NULL` and drop `author_name`
- [completed] Add `(expert_id)` index on `articles`
- [completed] Update `seed.sql` to create expert rows for prototype article authors and link each ported article via `expert_id`
- [completed] Update `lib/articles` read (used by `/blog/[slug]`) to join the author-expert display fields + socials and compute per-expert `article_count`
- [completed] Update `POST/PATCH /api/admin/articles` payload + Zod schema to take `expert_id` instead of `author_name`
- [completed] Regenerate TypeScript types; confirm `strict`/`noUncheckedIndexedAccess` clean
- [completed] Verify RLS: anon reads author display fields from `experts (status='active')`, cannot write

## Notes
- Audit gap A5 (Schema): backs A1/A3 (author chip + bio card). Blocks `story-blog-07`.
- OQ#9 resolved 2026-05-30 during analysis: **no author entity** — articles authored by experts via `articles.expert_id → experts(id)`; `author_name` dropped; `linkedin_url`/`twitter_url` added to `experts`. Documented in `TECHNICAL-REQUIREMENTS.md` §4.2 + Appendix.
- `none-needed` design: pure data/schema story, no UI surface.
- Execution (2026-05-30): the admin article CRUD **route** (`POST/PATCH/DELETE /api/admin/articles`, TECHNICAL-REQUIREMENTS.md §6) does not yet exist in the codebase — admin CRUD is a later admin-surface story. blog-06 delivers the authorship **contract** (`lib/schemas/article.ts`, keyed on `expert_id`) the route will consume; the route's auth/`revalidatePath` wiring is out of this story's scope.
