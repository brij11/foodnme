---
id: story-search-02
topic: search
sprint: 4
story_points: 3
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-30
executed_date: 2026-05-30
dependencies:
  - story-search-01
design:
  - follows-template: story-blog-01
---

# story-search-02 — Search results page `/search` + wire sidebar search inputs

## User story
As a visitor who typed a query, I want a results page that shows matching articles, templates, and experts, so that my search actually goes somewhere instead of a 404.

## Description
Every listing sidebar already submits to `/search` (`components/listing/ListingSidebar.tsx` `action="/search"`), but no `/search` route exists, so every search box 404s. Build `app/(public)/search/page.tsx` consuming `story-search-01`'s API, rendering grouped/typed results that reuse the existing listing card components, with the `type` facet and an empty state. Confirm all sidebar search inputs land here correctly.

## Acceptance criteria
- [x] `/search?q=…&type=…` renders results from `GET /api/search` (no 404) — `app/(public)/search/page.tsx` uses the same `runSearch` lib as the API; `e2e/search-page.spec.ts` (200 + results render)
- [x] Results reuse existing cards (`ArticleCard`, `TemplateCard`, `ExpertCard`) grouped or filterable by type — page batch-fetches full rows by id (`getArticlesByIds`/`getTemplatesByIds`/`getExpertsByIds`) and renders the real cards in rank order; E2E asserts cards render
- [x] A type facet (All / Articles / Templates / Experts) updates results and is reflected in the URL — facet links carry `?q=&type=`; E2E clicks Templates → URL `type=templates`
- [x] Result count shown; three-part `EmptyState` (title + message + action) when `q` yields nothing or is empty — `result-count` + `EmptyState`; E2E asserts empty-query + no-match states (no 404)
- [x] Every listing sidebar search box (blog, templates, jobs, experts) submits here with the correct `type` prefilled — blog→`articles`, templates→`templates` via `ListingSidebar`'s hidden `type` input; E2E submits both and lands on `/search` with the right type. (Jobs/Experts use their own in-page FTS filter sidebars, not a `/search` box — see Notes.)
- [x] Page is server-rendered; query echoed in the search box; `generateMetadata` sets a `noindex` results page title — `force-dynamic`, `metadata.robots.index=false`, query echoed via `defaultValue`; E2E asserts the searchbox value

## Tasks
- [completed] Build the server-rendered `app/(public)/search/page.tsx` consuming `GET /api/search` from query params (shared `runSearch` lib)
- [completed] Render results reusing `ArticleCard` / `TemplateCard` / `ExpertCard` in rank order (batch-fetched by id)
- [completed] Add the type facet (All / Articles / Templates / Experts) reflected in the URL; show result count
- [completed] Add the three-part `EmptyState` (title + message + action) for no-results / empty query; echo the query in the search box
- [completed] Confirm the blog + templates sidebar search boxes submit to `/search` with the correct `type` prefilled
- [completed] `generateMetadata` sets a `noindex` results-page title; add a test for render, type facet, and empty state

## Notes
- Audit gap X1 (Major). Design: `follows-template: story-blog-01` — results reuse the listing layout/cards; no dedicated prototype search screen exists.
- Hard-depends on `story-search-01`.
