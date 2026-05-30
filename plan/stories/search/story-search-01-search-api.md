---
id: story-search-01
topic: search
sprint: 4
story_points: 4
status: ready
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-30
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
- [ ] `GET /api/search?q=&type=articles|templates|experts|all` returns `{ ok, data: { results: [{ type, id, title, excerpt, url, rank }] } }` per §6.2
- [ ] Query is validated with Zod (`q` required/length-bounded; `type` enum, default `all`); empty/short `q` returns a clean empty result, not an error
- [ ] Results come from Postgres FTS via the existing tsvector indexes, ordered by rank
- [ ] Only published/active rows surface (unpublished articles, pending experts excluded)
- [ ] `url` is the correct canonical route per result type (`/blog/[slug]`, `/templates/[slug]`, `/experts/[id]`)
- [ ] Response shape matches the `{ ok }` convention in §6.1; unit + integration tests cover each `type`
- [ ] p95 latency < 500ms (§1)

## Tasks
- [new] Implement the `GET /api/search` route with Zod validation (`q` required + length-bounded; `type` enum default `all`); short/empty `q` → clean empty result
- [new] Query Postgres FTS over the existing `search_vector` GIN indexes on `articles`, `resources`, `experts`, ordered by rank
- [new] Restrict to published/active rows only (published articles, active experts); map each hit to `{type,id,title,excerpt,url,rank}` with the correct canonical `url` per type
- [new] Return the `{ ok, data: { results } }` shape per §6.1/§6.2
- [new] Add unit + integration tests covering each `type` and the empty-query path; verify p95 latency < 500ms

## Notes
- Audit gap X1 (Major). Endpoint + FTS indexes already in the tech spec — no feasibility gap.
- `none-needed` design: API-only story.
- Sprint-3 INDEX note flagged on-site search as "not yet storied"; this story (in Sprint 4) closes that.
