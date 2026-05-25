---
id: story-blog-05
topic: blog
sprint: 1
story_points: 3
status: ready
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-23
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
- [ ] In-article CTA box renders only if `articles.related_resource_slug` is non-null and resolves to a template; otherwise the section is omitted (no empty card)
- [ ] CTA box: surface-light background, copy + button — link follows the resolved template's URL (`/templates/[slug]`)
- [ ] "You might also like" H3 + 3 `ArticleCard`s in a row
- [ ] Query excludes the current article and `is_published = false`
- [ ] Fallback: if same-category yields < 3, fill from most-recent overall
- [ ] Stagger entry on the related grid (80ms / child, reduced-motion respected)
- [ ] Component lazy-loads below the fold (`loading="lazy"` on related cover images)

## Tasks
- [new] Build the in-article CTA box: read `articles.related_resource_slug` → resolve `resources` row → render surface-light card linking to `/templates/[slug]`; omit entirely when null/unresolved (AC#1, AC#2)
- [new] Build the "You might also like" related query: same-category + most-recent, exclude current + unpublished, fallback to most-recent overall when < 3 (AC#3, AC#4, AC#5)
- [new] Render the 3-`ArticleCard` row with stagger (80ms, reduced-motion) and below-the-fold lazy cover images (AC#6, AC#7)

## Notes
- _Analyzed 2026-05-23: the article→template link is now backed by the **`articles.related_resource_slug` column** added to `TECHNICAL-REQUIREMENTS.md` §4.2 during this run (founder-approved). No remaining open questions._
- Admin UI for setting `related_resource_slug` per article lives in the deferred admin Article-CRUD story (not Sprint 1).
- Related-articles selection logic intentionally simple — full embeddings-based recommendations are out of scope.
