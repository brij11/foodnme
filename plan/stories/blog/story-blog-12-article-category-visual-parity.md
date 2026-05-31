---
id: story-blog-12
topic: blog
sprint: 5
story_points: 2
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-31
executed_date: 2026-06-01
exec_model: sonnet
dependencies:
  - story-blog-02
  - story-blog-04
  - story-blog-07
design:
  - design/screens-blog.jsx
---

# story-blog-12 — Article & category visual parity

## User story
As a reader, I want article callouts and category headers to match the design, so that the editorial layout reads as intended.

## Description
Three smaller blog-detail/category deviations: the orange accent pull-quote variant is missing (both callouts render green), the article header author-chip lacks its bordered-pill chrome, and category pages dropped the sub-copy and use a generic overline. Covers DEVIATIONS.md **C5, D3, D4**.

## Acceptance criteria
- [x] Article detail has TWO distinct callout weights: a green-bordered `<blockquote>` AND an orange/accent-bordered `.pull-quote` variant (DEVIATIONS C5; `web/components/.../PullQuote.tsx:9` + `components.tsx:27` vs `design/styles.css:911-913`) — covered by components.test.tsx "PullQuote renders an accent-bordered pull-quote div"
- [x] The article header author chip is wrapped in a bordered/rounded "pill" surface matching `.header-author-chip` (DEVIATIONS D4; `web/components/blog/AuthorChip.tsx:27` vs `design/styles.css:3081+`) — covered by author.test.tsx "wraps content in a bordered pill surface"
- [x] Category page header shows a count sub-line ("{n} articles on {label} — sorted by recency.") and uses `cat.label` as the overline, not a hardcoded "Knowledge Hub" (DEVIATIONS D3; `web/app/(public)/blog/category/[category]/page.tsx:83` vs `design/screens-blog.jsx:309,311`) — covered by listing.test.tsx "renders cat.label as overline" + "renders the count sub-line"

## Tasks
- [completed] Give the `PullQuote` component an accent/orange left border + tint so it reads distinctly from the green-bordered `<blockquote>` (AC 1)
- [completed] Wrap the article header author chip in a bordered/rounded "pill" surface matching `.header-author-chip` (AC 2)
- [completed] Add the category-page header count sub-line and use `cat.label` as the overline instead of a hardcoded "Knowledge Hub" (AC 3)
- [completed] Update affected blog component tests (AC 1, 3)

## Notes
- exec_model: sonnet — presentational MDX/component + copy changes.
- Source: `plan/DEVIATIONS.md` C5, D3, D4.
- C5 is the only design-system rule item here; D3/D4 are cosmetic. All article-detail polish from Sprint 4 (author chip contents, reading progress, share row, bio card) is already faithful — this is the remaining gap.
