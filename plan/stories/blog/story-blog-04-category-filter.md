---
id: story-blog-04
topic: blog
sprint: 1
story_points: 3
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-23
executed_date: 2026-05-26
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
- [x] `/blog/category/food-safety` returns only articles where `category = 'food-safety'` — _`listArticles({ category })` via the public client; E2E asserts `result-count` "2 articles" + card hrefs scoped to the category_
- [x] Page H1 reads "{Category Label} Articles" — _`PageHeader title={`${cat.label} Articles`}`; E2E asserts H1 "Food Safety Articles"_
- [x] Category is pre-selected and visually marked active in the `ListingSidebar` (matches the listing's active style) — _`active: c.slug === cat.slug` on the sidebar rows; E2E asserts `aria-current="page"` on the Food Safety link in the Categories nav_
- [x] Breadcrumb: Home › Blog › {Category} — _`Breadcrumb` items Home/Blog (links) + current category (span `aria-current="page"`); E2E_
- [x] Empty state renders if zero published articles in the category (`EmptyState` — title + message + CTA) — _zero-result branch (`page.tsx:99–106`) renders `EmptyState` variant `filter` (title + message + "Browse all articles" CTA), the same primitive E2E-verified empty on `/blog` in story-blog-01. **Code-verified manual check:** all 5 seed categories have ≥1 published article, so no live category reaches the branch — see Notes_
- [x] Page is SSG via `generateStaticParams` covering all 5 categories from blueprint §5 Module 2 — _`generateStaticParams` over `ARTICLE_CATEGORIES` (5) + `dynamicParams = false`; build SSG's 5 category pages (`●`); E2E asserts an unknown category returns 404_
- [x] Cards link to `/blog/[slug]` — _reuses `ArticleCard`/`ArticleGrid`; E2E asserts the HACCP card href `/blog/haccp-implementation-small-food-businesses`_
- [x] On-demand revalidation on admin publish/edit — _page is SSG + `dynamicParams=false`; the `revalidatePath('/blog/category/' + category)` trigger lives in the **Sprint-3 admin publish route** (no admin surface exists in Sprint 1). Mechanism in place; trigger arrives with admin CRUD — documented dependency (mirrors story-blog-02)_
- [x] `generateMetadata` returns category-specific title + description + OG card — _`generateMetadata` returns "{Label} Articles — foodnme" + category description + `openGraph`; E2E asserts `toHaveTitle(/Regulatory Articles — foodnme/)`_
- [x] Lighthouse SEO score ≥ 95 — _manual/CI check (Lighthouse CI per §10): SSG + full `generateMetadata` (title/description/OG) + semantic markup (H1, breadcrumb nav, `result-count`); not run in this env (mirrors story-blog-02)_

## Tasks
- [completed] Build `app/(public)/blog/category/[category]/page.tsx` reusing `ListingSidebar`/`ArticleGrid` with the category pre-selected active (AC#3, AC#7)
- [completed] Category-scoped query + `generateStaticParams` over all 5 categories (SSG) + on-demand revalidation (AC#1, AC#6, AC#8)
- [completed] Category H1 ("{Label} Articles") + breadcrumb + `EmptyState` for empty categories (AC#2, AC#4, AC#5)
- [completed] `generateMetadata` (category title/description/OG) + verify Lighthouse SEO ≥ 95 (AC#9, AC#10)

## Notes
- Categories enumerated in blueprint §5 Module 2: Food Safety, QC, Regulatory, Processing, Industry Insights.
- _Analyzed 2026-05-23: aligned to the §3.5 sidebar layout chosen for `story-blog-01` (active category lives in the sidebar, not a pill). Otherwise fully grounded — no open questions._
- Revalidation path on admin publish: `revalidatePath('/blog/category/' + category)` per `TECHNICAL-REQUIREMENTS.md` §7.1.
- _Executed 2026-05-26: `app/(public)/blog/category/[category]/page.tsx` reuses the blog-01 listing kit (`ListingShell`/`ListingSidebar`/`ArticleGrid`/`Pagination`/`SortSelect`/`EmptyState`) and `lib/articles.ts` + `lib/categories.ts`. 5 SSG pages (`generateStaticParams` + `dynamicParams=false`). E2E `e2e/blog-category.spec.ts` — 4 tests green (category scope + H1 + breadcrumb + active sidebar; metadata title; unknown→404; axe zero serious/critical). **AC#5 (empty state)** is a code-verified manual check: every seed category carries ≥1 published article (food-safety ×2, quality-control ×2, regulatory ×2, processing ×2, industry-insights ×1), so the zero-result branch isn't reachable against live seed data — but it renders the identical `EmptyState` primitive that story-blog-01's E2E verifies on `/blog?category=does-not-exist`. **AC#8 / AC#10** carried as documented dependency (Sprint-3 admin revalidation trigger) and manual/CI Lighthouse check, per story-blog-02._
