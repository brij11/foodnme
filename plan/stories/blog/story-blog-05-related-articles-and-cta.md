---
id: story-blog-05
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
  - story-blog-02
design:
  - design/screens-blog.jsx
---

# story-blog-05 — Related articles widget + in-article CTA box on article detail

## User story
As a reader finishing an article, I want a few related articles surfaced and a contextual template CTA, so that I can keep reading or download a useful resource without searching.

## Description
Append two sections to the article detail page: (1) an in-article CTA box — accent-tinted card linking to a relevant template, sourced from the article's `related_resource_slug` (resolves to a `resources` row); (2) a "You might also like" row showing 3 related `ArticleCard`s. Related selection: same category + most recent, excluding the current article. Falls back to most-recent overall if fewer than 3 matches.

## Acceptance criteria
- [x] In-article CTA box renders only if `articles.related_resource_slug` is non-null and resolves to a template; otherwise the section is omitted (no empty card) — _`ArticleTemplateCTA` returns `null` when the resolved resource is null; E2E renders it on the HACCP article (slug set) and asserts `count=0` on `fssai-licensing-changes-2026` (null slug)_
- [x] CTA box: surface-light background, copy + button — link follows the resolved template's URL (`/templates/[slug]`) — _reuses the `CTABox` primitive (surface-light bg, title+body+button); E2E asserts the "Get the template →" link → `/templates/haccp-team-charter` and the resolved title heading_
- [x] "You might also like" H3 + 3 `ArticleCard`s in a row — _`RelatedArticles` (`aria-labelledby` H3); E2E asserts the heading + exactly 3 cards in the section_
- [x] Query excludes the current article and `is_published = false` — _`getRelatedArticles` (`.neq("slug")` + `.eq("is_published", true)`); E2E asserts the current article is absent from the related cards; unit test covers the dedup_
- [x] Fallback: if same-category yields < 3, fill from most-recent overall — _`getRelatedArticles` tops up from most-recent overall (dedup + exclude current); unit test (`articles.test.ts`); E2E food-safety has 1 sibling so it fills to 3_
- [x] Stagger entry on the related grid (80ms / child, reduced-motion respected) — _`RelatedArticles` per-child `animationDelay: i*80ms` + `motion-reduce:animate-none` (same kit as blog-01); E2E runs the reduced-motion path with all 3 cards present_
- [x] Component lazy-loads below the fold (`loading="lazy"` on related cover images) — _related cards reuse `ArticleCard` whose `next/image` is non-`priority` → renders `loading="lazy"`; E2E asserts the first related cover img has `loading="lazy"`_

## Tasks
- [completed] Build the in-article CTA box: read `articles.related_resource_slug` → resolve `resources` row → render surface-light card linking to `/templates/[slug]`; omit entirely when null/unresolved (AC#1, AC#2)
- [completed] Build the "You might also like" related query: same-category + most-recent, exclude current + unpublished, fallback to most-recent overall when < 3 (AC#3, AC#4, AC#5)
- [completed] Render the 3-`ArticleCard` row with stagger (80ms, reduced-motion) and below-the-fold lazy cover images (AC#6, AC#7)

## Notes
- _Analyzed 2026-05-23: the article→template link is now backed by the **`articles.related_resource_slug` column** added to `TECHNICAL-REQUIREMENTS.md` §4.2 during this run (founder-approved). No remaining open questions._
- Admin UI for setting `related_resource_slug` per article lives in the deferred admin Article-CRUD story (not Sprint 1).
- Related-articles selection logic intentionally simple — full embeddings-based recommendations are out of scope.
- _Executed 2026-05-26: **blog-05 owns the `resources` seed** — it is the first story to need template data, so `supabase/seed.sql` now seeds the 9 prototype templates (ported from `data.jsx`) before `articles`, and templates-01/02/03 reuse those rows. Data layer: `lib/resources.ts` (`getResourceBySlug`) + `getRelatedArticles` in `lib/articles.ts` (same-category newest → top-up from most-recent overall, dedup + exclude current/unpublished). Components: `ArticleTemplateCTA` (reuses `CTABox`, omits when unresolved) + `RelatedArticles` (3-card row, 80ms stagger, reused `ArticleCard` lazy covers), both wired into `app/(public)/blog/[slug]/page.tsx`. **The HACCP article's `related_resource_slug` points to `haccp-team-charter`** (a distinct, complementary template) rather than the dairy plan its in-MDX CTABox already links — avoids a redundant double-CTA and keeps the blog-03 "Download template" locator unique; the structured CTA button reads "Get the template →". Tests: 3 unit (`getRelatedArticles`) + 4 E2E (`article-related-cta.spec.ts`) green; `article-mdx.spec.ts` regression re-run green._
