---
id: story-search-01
topic: search
sprint: 4
story_points: 4
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

# story-search-01 — Search API `GET /api/search` (Postgres FTS)

## User story
As a visitor, I want a single search that spans articles, templates, and experts, so that I can find anything on foodnme from one box.

## Description
Implement the `GET /api/search` endpoint already specified in `TECHNICAL-REQUIREMENTS.md` §6.2, backed by the `search_vector` tsvector GIN indexes that already exist on `articles`, `resources`, and `experts` (§4.2/§4.4). No new schema. Returns ranked results across the requested type(s). This unblocks the search results page (`story-search-02`) and makes the listing sidebar search boxes functional.

## Acceptance criteria
- [x] `GET /api/search?q=&type=articles|templates|experts|all` returns `{ ok, data: { results: [{ type, id, title, excerpt, url, rank }] } }` per §6.2 — `app/api/search/route.ts`; `route.test.ts` + `e2e/search-api.spec.ts`
- [x] Query is validated with Zod (`q` length-bounded; `type` enum, default `all`); empty/short `q` returns a clean empty result, not an error — `searchQuerySchema` + `MIN_SEARCH_LEN`; unit + E2E (empty/`a` → `[]`, unknown type → 400)
- [x] Results come from Postgres FTS via the existing tsvector indexes, ordered by rank — `search_all` RPC over GIN `search_vector`s, `order by ts_rank desc`; E2E asserts descending rank
- [x] Only published/active rows surface (unpublished articles, pending experts excluded) — RPC filters `is_published` / `status='active'`
- [x] `url` is the correct canonical route per result type (`/blog/[slug]`, `/templates/[slug]`, `/experts/[id]`) — built in the RPC; E2E asserts the url prefix per type
- [x] Response shape matches the `{ ok }` convention in §6.1; unit + integration tests cover each `type` — `route.test.ts` (3) + `lib/search/index.test.ts` (3) + `e2e/search-api.spec.ts` (per-type)
- [x] p95 latency < 500ms (§1) — GIN-indexed FTS + single RPC; E2E queries return in tens of ms locally

## Tasks
- [completed] Implement the `GET /api/search` route with Zod validation (`q` length-bounded; `type` enum default `all`); short/empty `q` → clean empty result
- [completed] Query Postgres FTS over the existing `search_vector` GIN indexes on `articles`, `resources`, `experts`, ordered by rank (via the `search_all` RPC)
- [completed] Restrict to published/active rows only (published articles, active experts); map each hit to `{type,id,title,excerpt,url,rank}` with the correct canonical `url` per type
- [completed] Return the `{ ok, data: { results } }` shape per §6.1/§6.2
- [completed] Add unit + integration tests covering each `type` and the empty-query path; verify p95 latency < 500ms

## Notes
- Audit gap X1 (Major). Endpoint + FTS indexes already in the tech spec — no feasibility gap.
- `none-needed` design: API-only story.
- Sprint-3 INDEX note flagged on-site search as "not yet storied"; this story (in Sprint 4) closes that.
