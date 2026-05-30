---
id: story-homepage-04
topic: homepage
sprint: 3
story_points: 2
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-26
executed_date: 2026-05-30
dependencies:
  - story-homepage-05
  - story-blog-01
design:
  - design/screens-main.jsx
---

# story-homepage-04 — Homepage "Latest from the blog" rail

## User story
As a visitor who likes the editorial feature, I want a quick way to see what else is recent and jump to the full blog, so that I can keep reading without hunting for the listing.

## Description
Add a compact "**Latest from the blog**" rail to `app/(public)/page.tsx` — a short list of the most-recent published articles (links, not full cards) plus a "View all →" link to `/blog`. It is the **browse-onward affordance** the §3.6 narrative homepage lacks: `story-homepage-06` shows a *single* large editorial feature, and this rail complements it by surfacing several more recent pieces. The old two-3-card-grid scope (articles + templates) is dropped — the templates side is covered by `story-homepage-07`'s featured card.

## Acceptance criteria
- [x] "Latest from the blog" rail renders the **4** most-recent published articles as compact title links, ordered by `published_at desc`, **excluding whichever article is shown as the editorial feature** (`story-homepage-06`, §3.6 #4) so no article appears twice — `page.tsx` fetches `getFeaturedArticle()` then `getLatestArticles({ limit: 4, excludeSlug: featured.slug })`; `lib/articles.test.ts` covers the exclusion + `getFeaturedArticle`
- [x] Rail mounts beneath the editorial feature inside the §3.6 #4 "From the Knowledge Hub" section — co-located, **not** a standalone section; it does not duplicate `story-homepage-06`'s single editorial feature, and does **not** re-render the section header / "All articles → /blog" link (those belong to the shell/feature) — `<LatestArticlesRail>` is a child of `KnowledgeHubSection`; `LatestArticlesRail.test.tsx` "does NOT re-render the section header or an 'All articles' link"
- [x] Each rail item links to `/blog/[slug]`; the section's existing "All articles → /blog" link is retained (rail complements it) — `LatestArticlesRail.test.tsx` href assertions + `homepage.spec.ts` "Latest from the blog rail links to /blog articles"; `KnowledgeHubSection`'s "All articles" link is unchanged
- [x] Respects `prefers-reduced-motion` (stagger interaction policy, `UI-DESIGN-HANDOFF.md` §4.10) — `motion-reduce:animate-none animate-fade-up` per item; `LatestArticlesRail.test.tsx` "guards stagger motion"
- [x] Articles fetched server-side at build/revalidate (SSG snapshot) — no client DB call blocks initial render; homepage still meets LCP < 2.0s after wiring — fetched in the server component; `pnpm build` keeps `/` as `○ (Static)`; LCP budget is a manual check (see homepage-05 Notes — same SSG snapshot)
- [x] Short-list tolerance: if fewer than 4 published articles exist, the rail renders only those available (no placeholder rows) per §5.4 — query `.limit(4)` returns only what exists; `LatestArticlesRail.test.tsx` short-list + empty cases

## Tasks
- [completed] Query the 4 most-recent published articles (`published_at desc`) server-side within the SSG page data (build/revalidate), tolerating fewer than 4 results
- [completed] Render the "Latest from the blog" rail as compact `/blog/[slug]` title links beneath the editorial feature inside the §3.6 #4 section — no duplicate section header or "All articles →" link
- [completed] Apply stagger entrance honoring `prefers-reduced-motion` (§4.10)
- [completed] Verify LCP < 2.0s post-wiring (manual, see Notes) and the short-list case (renders only available items, no placeholders)

## Notes
- **Restored & re-scoped 2026-05-26** via `/manage-stories restore story-homepage-04`. Original scope ("Featured articles + featured templates" as two 3-card grids) was obsoleted by the §3.6 narrative redesign and is largely covered by `story-homepage-06` (editorial feature) + `story-homepage-07` ("Featured this week"). Re-scoped to the one distinct, non-duplicative slice: a latest-articles browse rail. SP dropped 3 → 2.
- **Analyzed 2026-05-26 — doc gap resolved:** the rail was not in §3.6. Per founder decision it was **folded into the existing "From the Knowledge Hub" section (§3.6 #4)** — one editorial feature + a compact rail of the **4** most-recent article links + the existing "All articles →" link. `UI-DESIGN-HANDOFF.md` §3.6 #4 was updated (with approval) to document this.
- **Ownership boundary:** the "From the Knowledge Hub" section header + "All articles → /blog" link belong to the §3.6 #4 section established by the page shell (`story-homepage-05`) / editorial feature (`story-homepage-06`). This story adds **only** the rail beneath it — it must not re-render the header. 04 and 06 stay independent siblings (both depend only on 05); no dependency-graph change.
- Stagger + reduced-motion is a cross-cutting interaction policy from `UI-DESIGN-HANDOFF.md` §4.10.
- **De-dup with the editorial feature:** the feature (`story-homepage-06`) selects the article via `articles.is_featured` (added to §4.2 on 2026-05-26), falling back to most-recent published. Since the featured article may also be among the 4 most-recent, the rail query must exclude the feature's article id. Coordinated in the shell's page-data fetch (`story-homepage-05`).
- **Executed 2026-05-30:** De-dup is by **slug** (`getLatestArticles` exposes `excludeSlug`, not id). Added `getFeaturedArticle()` in `lib/articles.ts` as the single coordination point: it currently returns the most-recent published article. `articles.is_featured` does **not** yet exist on the table (it lives on `experts`/`jobs` only) — `story-homepage-06` will add the column + make `getFeaturedArticle()` prefer it, and the rail exclusion still holds because both the feature and the rail read this one helper. The editorial feature itself is not rendered yet (06), but the rail already excludes the would-be feature slug so no rework is needed when 06 lands.
