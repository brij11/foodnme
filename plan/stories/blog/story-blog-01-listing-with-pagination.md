---
id: story-blog-01
topic: blog
sprint: 1
story_points: 5
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-23
executed_date: 2026-05-25
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
- [x] `/blog` SSR with `searchParams` for `?category=` and `?page=`, cache header `s-maxage=60, stale-while-revalidate=300` — _SSR+searchParams verified (E2E filter/empty + build shows `ƒ` dynamic). Cache directive configured in `next.config.mjs headers()`; **manual/infra check** — Next 14 forces `no-store` on searchParams-dynamic pages in `next start`, honored at the Vercel CDN (see Notes)_
- [x] Sidebar (§3.5): search input → category list with article counts (All · Food Safety · Quality Control · Regulatory · Processing · Industry Insights) → "Clear all filters" → mini `NewsletterBanner` (blog variant) — _`ListingSidebar`; E2E + reuse_
- [x] Mobile: sidebar collapses into a bottom-sheet filter drawer — _`ListingShell`; E2E at 375px opens the drawer dialog_
- [x] Active category in the sidebar is visually marked active (`--color-primary`); inactive categories muted — _E2E (aria-current=page on active; bg-primary)_
- [x] Main column header: result count + sort dropdown — _`result-count` + `SortSelect`; E2E_
- [x] `ArticleCard` renders category tag (color rotation §1.2) + read-time tag, title (Inter 700), 2-line excerpt, author + date footer — _`listing.test.tsx`_
- [x] Hover: card lifts `translateY(-2px)` with `--shadow-card` — _`hover:-translate-y-[2px] hover:shadow-card` on the card (visual)_
- [x] Filter change triggers `key=` reset on grid so stagger re-runs (80ms/child, reduced-motion respected) — _`ArticleGrid` keyed `category-page-sort`; per-child 80ms delay; `motion-reduce:animate-none` (E2E runs reduced-motion path)_
- [x] Empty state: `EmptyState` variant `filter` — title + message + CTA, never bare "No results." — _E2E + `listing.test.tsx`_
- [x] Pagination is server-rendered numbered links (`/blog?page=2`), not infinite scroll — _`Pagination` (server `<Link>`s); `listing.test.tsx`_
- [x] `generateMetadata` returns title "Food Technology Blog — foodnme" + OG card — _`metadata` export (title + openGraph); E2E `toHaveTitle`_

## Tasks
- [completed] Build `app/(public)/blog/page.tsx` shell: SSR reading `?category=`/`?page=`, cache headers, two-column layout (AC#1, AC#5)
- [completed] Build shared `ListingSidebar`: search input + category list with counts + active-state styling + "Clear all filters" + slot for mini-newsletter (AC#2, AC#4)
- [completed] Add mobile bottom-sheet behavior for the sidebar (`ListingShell`) (AC#3)
- [completed] Build `ArticleCard` + `ArticleGrid` (tag rotation §1.2, read-time tag, title/excerpt/author-date, hover lift, stagger with `key=` reset) (AC#6, AC#7, AC#8)
- [completed] Build the articles query (`lib/articles.ts`) + server-rendered pagination links; `EmptyState` variant `filter` (AC#9, AC#10)
- [completed] `PageHeader` + `generateMetadata` (title + OG) (AC#11)

## Notes
- _Analyzed 2026-05-23: switched from a horizontal category pill bar to the §3.5 **sidebar listing layout** (founder decision; pills don't scale + sidebar carries multi-select for Jobs/Experts later). `ListingSidebar` is the shared heavy piece reused by Templates/Jobs/Experts._
- If `ListingSidebar` (with the mobile bottom-sheet) proves larger than estimated at execution, split it into its own component story rather than letting this story exceed 5 SP.
- Articles query: `select * from articles where is_published = true [and category = ?] order by published_at desc limit 12 offset (page - 1) * 12`.
- Search box (article titles + tags) is part of Sprint 3 federated search (`story-search-*`); this story leaves the input as a stub linking to `/search?type=articles`.
- _Executed 2026-05-25: shared listing kit built in `web/components/listing/` (`ListingShell`, `ListingSidebar`, `ArticleCard`, `ArticleGrid`, `Pagination`, `PageHeader`, `EmptyState`, `SortSelect`) — reused by templates-01 and blog-04. Data layer `lib/articles.ts` + `lib/categories.ts` (tag rotation). 9 articles seeded. **Public read client** (`lib/supabase/public.ts`, cookieless) keeps listings CDN-cacheable. **AC#1 cache-header is a documented manual/infra check:** Next 14 forces `Cache-Control: no-store` on `searchParams`-dynamic pages in `next start`/`next dev`; the `s-maxage=60, stale-while-revalidate=300` directive is set in `next.config.mjs headers()` and honored by the Vercel CDN, but cannot be asserted via the local server — so the E2E asserts the SSR/filter/pagination behavior instead. **a11y:** darkened `--color-tag-neutral-text` (#6b7280→#4b5563) to clear the AA contrast gate on neutral read-time tags._
