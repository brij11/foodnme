---
id: story-blog-10
topic: blog
sprint: 5
story_points: 3
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-31
executed_date: 2026-06-01
exec_model: sonnet
dependencies:
  - story-blog-01
  - story-blog-04
design:
  - design/screens-blog.jsx
---

# story-blog-10 — Blog listing parity: featured editorial slot + popular tags

## User story
As a visitor browsing the Knowledge Hub, I want a highlighted lead article and a quick way to jump by tag, so that I can find a way in without scanning the whole grid.

## Description
The prototype blog listing renders a large `<FeaturedArticle>` editorial slot above the grid (when unfiltered) and a "Popular tags" block in the sidebar; the build dropped both. This story restores them on both `/blog` and `/blog/category/[category]` (the tags block is shared via `ListingSidebar`). Covers DEVIATIONS.md **A6, A7**.

## Acceptance criteria
- [x] On `/blog` page 1 with no category filter, a large featured-article editorial slot renders above the grid and is excluded from the grid below it (DEVIATIONS A6; `design/screens-blog.jsx:44-48` vs `web/app/(public)/blog/page.tsx:84-113`) — blog-featured-tags.test.tsx "shows featured when no category filter and page = 1"
- [x] The listing sidebar includes a "Popular tags" block with clickable tag pills (DEVIATIONS A7; `design/screens-blog.jsx:76-83` vs `web/components/listing/ListingSidebar.tsx:40-121`) — blog-featured-tags.test.tsx "renders a 'Popular tags' heading and tag pills"
- [x] Tag pills use the neutral tag style and link to a tag-filtered view (or `/search?q=`, per the search decision in story-blog-11) — blog-featured-tags.test.tsx "tag pills link to /search?q=<tag>"
- [x] Category pages reuse the same Popular-tags sidebar block — `blog/category/[category]/page.tsx` passes `popularTags={[...BLOG_POPULAR_TAGS]}` to `ListingSidebar` (code verified; same sidebar component)
- [x] Featured slot is suppressed when a category filter or pagination beyond page 1 is active — blog-featured-tags.test.tsx "suppresses featured when a category filter is active" + "suppresses featured on page 2+"
- [x] No regression to the faithful sidebar pieces (search, category counts, clear-all, mini newsletter) — blog-featured-tags.test.tsx "still renders search input, category list, and clear-all link"

## Tasks
- [completed] Add a featured-article editorial slot above the grid on `/blog` page 1 with no active category filter, and exclude that article from the grid below (AC 1, 5)
- [completed] Add a "Popular tags" block to `ListingSidebar` rendering clickable neutral tag pills (AC 2, 3)
- [completed] Reuse the Popular-tags sidebar block on `/blog/category/[category]` pages (AC 4)
- [completed] Route tag pills to `/search?q=<tag>` (per story-blog-11's resolved search model) (AC 3)
- [completed] Add/adjust tests: featured-slot visibility rules + sidebar popular-tags render (AC 1, 2, 5)

## Notes
- exec_model: sonnet — ports the prototype FeaturedArticle + popular-tags block; composes existing listing components.
- Source: `plan/DEVIATIONS.md` A6, A7.
- The prototype `<FeaturedArticle>` lives in `plan/design/screens-blog.jsx`; the build already has an `EditorialFeature` pattern on the homepage that can be adapted.
- Tag destination depends on story-blog-11 (search model) — coordinate so tag pills route consistently.
