---
id: story-blog-04
topic: blog
sprint: 1
story_points: 3
status: ready
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-23
dependencies:
  - story-blog-01
design:
  - design/screens-blog.jsx
---

# story-blog-04 — Category filter /blog/category/[category]

## User story
As a visitor interested in a specific topic (e.g. Food Safety), I want a dedicated URL listing only that category's articles, so that I can bookmark and share it.

## Description
Build `app/(public)/blog/category/[category]/page.tsx`. Identical to `/blog` (reuses `ListingSidebar`, `ArticleGrid`, `ArticleCard` from `story-blog-01`) except: H1 reflects the category name ("Food Safety Articles"), the category is pre-selected/active in the sidebar, breadcrumb reads "Home › Blog › {Category}", and `generateStaticParams` enumerates every category for SSG.

## Acceptance criteria
- [ ] `/blog/category/food-safety` returns only articles where `category = 'food-safety'`
- [ ] Page H1 reads "{Category Label} Articles"
- [ ] Category is pre-selected and visually marked active in the `ListingSidebar` (matches the listing's active style)
- [ ] Breadcrumb: Home › Blog › {Category}
- [ ] Empty state renders if zero published articles in the category (`EmptyState` — title + message + CTA)
- [ ] Page is SSG via `generateStaticParams` covering all 5 categories from blueprint §5 Module 2
- [ ] Cards link to `/blog/[slug]`
- [ ] On-demand revalidation on admin publish/edit
- [ ] `generateMetadata` returns category-specific title + description + OG card
- [ ] Lighthouse SEO score ≥ 95

## Tasks
- [new] Build `app/(public)/blog/category/[category]/page.tsx` reusing `ListingSidebar`/`ArticleGrid` with the category pre-selected active (AC#3, AC#7)
- [new] Category-scoped query + `generateStaticParams` over all 5 categories (SSG) + on-demand revalidation (AC#1, AC#6, AC#8)
- [new] Category H1 ("{Label} Articles") + breadcrumb + `EmptyState` for empty categories (AC#2, AC#4, AC#5)
- [new] `generateMetadata` (category title/description/OG) + verify Lighthouse SEO ≥ 95 (AC#9, AC#10)

## Notes
- Categories enumerated in blueprint §5 Module 2: Food Safety, QC, Regulatory, Processing, Industry Insights.
- _Analyzed 2026-05-23: aligned to the §3.5 sidebar layout chosen for `story-blog-01` (active category lives in the sidebar, not a pill). Otherwise fully grounded — no open questions._
- Revalidation path on admin publish: `revalidatePath('/blog/category/' + category)` per `TECHNICAL-REQUIREMENTS.md` §7.1.
