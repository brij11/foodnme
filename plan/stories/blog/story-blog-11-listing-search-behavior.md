---
id: story-blog-11
topic: blog
sprint: 5
story_points: 2
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-31
executed_date: 2026-05-31
exec_model: sonnet
dependencies:
  - story-blog-01
  - story-search-02
design:
  - design/screens-blog.jsx
---

# story-blog-11 — Blog/category search behavior (in-page filter vs /search)

## User story
As a visitor searching within the blog, I want the search box to behave the way the design intends, so that finding articles is predictable.

## Description
In the prototype, the listing sidebar search filters articles **in place** and the result count reacts. In the build, the sidebar search is a GET form that navigates away to the global `/search` page — the listing has no `?q=` filter. This is a product decision, not a clear bug: `/search` (a cross-entity FTS page) was added after the prototype. This story resolves the decision and implements it. Covers DEVIATIONS.md **A8**.

> **DECISION NEEDED (founder/product):** Option 1 — keep search delegated to the global `/search` page (accept as an intentional evolution; update the handoff to match). Option 2 — wire an in-page `?q=` filter on `/blog` + `/blog/category` so the count and grid react, matching the prototype. The acceptance criteria below assume the chosen option is confirmed first.

## Acceptance criteria
- [x] **Decision (2026-05-31): delegate to `/search`.** Recorded in `UI-DESIGN-HANDOFF.md` §3.5
- [x] The handoff §3.5 listing description states search routes to `/search`, and the sidebar search input copy/placeholder makes that behavior clear
- [x] `/blog` and `/blog/category/*` search inputs route to `/search` (no in-page `?q=` filtering claimed on listings)
- [x] Category page search behaves identically to the blog listing

## Tasks
- [completed] Record the delegate-to-`/search` decision in `UI-DESIGN-HANDOFF.md` §3.5 (done during analysis, 2026-05-31) (AC 1)
- [completed] Update listing sidebar search placeholder copy to convey global search (e.g. "Search all of foodnme…") (AC 3)
- [completed] Verify `/blog` and `/blog/category/*` search inputs route to `/search` and the pages don't imply in-page `?q=` filtering; add/adjust a test (AC 4)

## Notes
- exec_model: sonnet — copy/routing confirmation + handoff note; the decision (delegate to `/search`) is already made.
- **Resolved (analysis, 2026-05-31):** delegate to the global `/search` page (Option 1); handoff §3.5 updated. The in-page `?q=` branch is dropped.
- Source: `plan/DEVIATIONS.md` A8 (`[partial]` — product decision).
- Build ref: `web/components/listing/ListingSidebar.tsx:42-52` (`<form action="/search" method="get">`). Design ref: `plan/design/screens-blog.jsx:56-59,107`.
- Kept `status: draft` (not blocked) since both options are feasible on existing infrastructure — only the product call is pending.
- Tests added: `web/components/listing/search-routing.test.tsx` — 5 tests covering form action, method, hidden type field, placeholder copy, and category-page parity (AC 3 + AC 4).
- UI-DESIGN-HANDOFF.md §3.5 now explicitly documents the `/search` routing decision.
- Both `/blog` and `/blog/category/*` placeholders updated to "Search all of foodnme…".
