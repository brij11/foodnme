---
id: story-blog-01
topic: blog
sprint: 1
story_points: 5
status: ready
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-23
dependencies:
  - story-homepage-02
design:
  - design/screens-blog.jsx
---

# story-blog-01 — Blog listing /blog with sidebar filters and pagination

## User story
As a visitor researching food technology, I want a browsable blog index with a filter sidebar and pagination, so that I can scan many articles quickly without infinite scroll breaking back-button behavior.

## Description
Build `app/(public)/blog/page.tsx` using the shared **sidebar listing layout** from `UI-DESIGN-HANDOFF.md` §3.5 (pills were deliberately retired — they don't scale past 5–6 categories). Left sidebar: search input → category list with counts → "Clear all filters" → mini `NewsletterBanner` (blog variant). Main column: result count + sort dropdown → 2-column `ArticleCard` grid → "Load More". On mobile the sidebar collapses into a bottom-sheet filter drawer. Pagination is server-rendered links (NOT infinite scroll — SEO requirement per blueprint §15). Introduce shared components `ArticleCard`, `ArticleGrid`, `ListingSidebar`, `PageHeader`.

## Acceptance criteria
- [ ] `/blog` SSR with `searchParams` for `?category=` and `?page=`, cache header `s-maxage=60, stale-while-revalidate=300`
- [ ] Sidebar (§3.5): search input → category list with article counts (All · Food Safety · Quality Control · Regulatory Compliance · Processing · Industry Insights, mapped to slugs) → "Clear all filters" → mini `NewsletterBanner` (blog variant)
- [ ] Mobile: sidebar collapses into a bottom-sheet filter drawer
- [ ] Active category in the sidebar is visually marked active (`--color-primary`); inactive categories muted
- [ ] Main column header: result count + sort dropdown
- [ ] `ArticleCard` renders category tag (color rotation §1.2) + read-time tag, title (Inter 700), 2-line excerpt, author + date footer
- [ ] Hover: card lifts `translateY(-2px)` with `--shadow-card`
- [ ] Filter change triggers `key=` reset on grid so stagger re-runs (80ms/child, reduced-motion respected)
- [ ] Empty state: `EmptyState` variant `filter` — title + message + CTA, never bare "No results."
- [ ] Pagination is server-rendered "Load More" / numbered links (`/blog?page=2`), not infinite scroll
- [ ] `generateMetadata` returns title "Food Technology Blog — foodnme" + OG card

## Tasks
- [new] Build `app/(public)/blog/page.tsx` shell: SSR reading `?category=`/`?page=`, cache headers, two-column layout (AC#1, AC#5)
- [new] Build shared `ListingSidebar`: search input + category list with counts + active-state styling + "Clear all filters" + slot for mini-newsletter (AC#2, AC#4)
- [new] Add mobile bottom-sheet behavior for the sidebar (AC#3)
- [new] Build `ArticleCard` + `ArticleGrid` (tag rotation §1.2, read-time tag, title/excerpt/author-date, hover lift, stagger with `key=` reset) (AC#6, AC#7, AC#8)
- [new] Build the articles query + server-rendered pagination links; `EmptyState` variant `filter` (AC#9, AC#10)
- [new] `PageHeader` + `generateMetadata` (title + OG) (AC#11)

## Notes
- _Analyzed 2026-05-23: switched from a horizontal category pill bar to the §3.5 **sidebar listing layout** (founder decision; pills don't scale + sidebar carries multi-select for Jobs/Experts later). `ListingSidebar` is the shared heavy piece reused by Templates/Jobs/Experts._
- If `ListingSidebar` (with the mobile bottom-sheet) proves larger than estimated at execution, split it into its own component story rather than letting this story exceed 5 SP.
- Articles query: `select * from articles where is_published = true [and category = ?] order by published_at desc limit 12 offset (page - 1) * 12`.
- Search box (article titles + tags) is part of Sprint 3 federated search (`story-search-*`); this story leaves the input as a stub linking to `/search?type=articles`.
