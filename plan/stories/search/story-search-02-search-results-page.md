---
id: story-search-02
topic: search
sprint: 4
story_points: 3
status: ready
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-30
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
- [ ] `/search?q=…&type=…` renders results from `GET /api/search` (no 404)
- [ ] Results reuse existing cards (`ArticleCard`, `TemplateCard`, `ExpertCard`) grouped or filterable by type
- [ ] A type facet (All / Articles / Templates / Experts) updates results and is reflected in the URL
- [ ] Result count shown; three-part `EmptyState` (title + message + action) when `q` yields nothing or is empty
- [ ] Every listing sidebar search box (blog, templates, jobs, experts) submits here with the correct `type` prefilled
- [ ] Page is server-rendered; query echoed in the search box; `generateMetadata` sets a `noindex` results page title

## Tasks
- [new] Build the server-rendered `app/(public)/search/page.tsx` consuming `GET /api/search` from query params
- [new] Render results reusing `ArticleCard` / `TemplateCard` / `ExpertCard`, grouped or filterable by type
- [new] Add the type facet (All / Articles / Templates / Experts) reflected in the URL; show result count
- [new] Add the three-part `EmptyState` (title + message + action) for no-results / empty query; echo the query in the search box
- [new] Confirm every listing sidebar search box (blog, templates, jobs, experts) submits to `/search` with the correct `type` prefilled
- [new] `generateMetadata` sets a `noindex` results-page title; add a test for render, type facet, and empty state

## Notes
- Audit gap X1 (Major). Design: `follows-template: story-blog-01` — results reuse the listing layout/cards; no dedicated prototype search screen exists.
- Hard-depends on `story-search-01`.
