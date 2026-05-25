---
id: story-templates-01
topic: templates
sprint: 1
story_points: 4
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-23
executed_date: 2026-05-26
dependencies:
  - story-homepage-02
  - story-blog-01
design:
  - design/screens-main.jsx
---

# story-templates-01 — Templates listing /templates with sidebar filter

## User story
As a QA manager or auditor, I want to browse downloadable compliance templates filtered by category, so that I can grab a HACCP plan or audit checklist without creating an account.

## Description
Build `app/(public)/templates/page.tsx` using the shared **sidebar listing layout** (`ListingSidebar` from `story-blog-01`, per `UI-DESIGN-HANDOFF.md` §3.5) and a 2-column `TemplateCard` grid. The `TemplateCard` follows the §3.2 final design: the **whole card is a link** to the detail page (acts as "Preview"), with a single **round download icon-button in the top-right corner** for the download action. No "Free" badge (per §4.2).

## Acceptance criteria
- [x] `/templates` SSR with `searchParams.category`, cache `s-maxage=60, stale-while-revalidate=300` — _SSR+searchParams verified (E2E category filter; build shows `ƒ /templates` dynamic). Cache directive set in `next.config.mjs headers()` for `/templates`; **manual/infra check** — Next 14 forces `no-store` on searchParams-dynamic pages in `next start`, honored at the Vercel CDN (same as blog-01, see Notes)_
- [x] Sidebar (§3.5): search input → category list with counts (All · HACCP · Audit Checklists · SOP Templates · QC Inspection · Compliance Docs) → "Clear all filters" (no mini-newsletter here — that's blog/category only, per §3.5) — _reuses `ListingSidebar` (no `newsletter` slot); E2E asserts the searchbox + all 6 category links_
- [x] Mobile: sidebar collapses into a bottom-sheet filter drawer — _`ListingShell`; E2E at 375px opens the "Filters" dialog containing the Categories nav_
- [x] `TemplateCard` per §3.2: whole card is a `<Link>` to `/templates/[slug]`; a round icon-button top-right triggers download (tooltip "Download template", turns green on hover, `stopPropagation` so it doesn't navigate) — _stretched-link card (whole card → detail) + sibling `TemplateDownloadButton`; E2E asserts the card link href + that clicking download POSTs `/api/download` **without** navigating. **Visual:** tooltip "Download template" + green-on-hover (`hover:bg-primary`). Production note: the download control is a **sibling** of the stretched link (not a button nested in an anchor) to avoid the nested-interactive a11y violation — same user behavior as the prototype's `stopPropagation`_
- [x] Card shows category tag (color rotation §1.2) + file-format badge (PDF/DOCX from `resources.file_type`), title, 2-line description — _`templates.test.tsx` (tag + `DOCX` badge + title + description); E2E asserts both `DOCX` and `PDF` badges render from `file_type`_
- [x] Card bottom row: "{download_count} downloads" on the left, "View →" ghost affordance on the right (arrow grows on card hover) — _component test ("1,840 downloads" + "View"); E2E. **Visual:** arrow grows via `group-hover:translate-x-0.5`_
- [x] No "Free" badge anywhere even though `resources.is_free` exists — _`TemplateCard` never renders `is_free`; component test (`queryByText(/free/i)` absent) + E2E (`count=0`)_
- [x] Download icon-button triggers `/api/download` (story-templates-03) — _`TemplateDownloadButton` POSTs `{ template_id }` to `/api/download` then redirects to the returned signed URL; E2E intercepts the POST and asserts the URL + `template_id` body. The endpoint itself lands in **story-templates-03** (the wiring is verified here)_
- [x] Empty state: `EmptyState` — title + message + CTA — _E2E `?category=does-not-exist` → `EmptyState` (title + "Clear filters" CTA)_
- [x] Card grid staggers 80ms / child, respects reduced motion — _`TemplateGrid` keyed by active category; per-child `animationDelay: i*80ms` + `motion-reduce:animate-none` (same kit as blog-01's `ArticleGrid`); E2E runs the reduced-motion path with all cards present_

## Tasks
- [completed] Build `app/(public)/templates/page.tsx` shell: SSR with `searchParams.category`, cache headers, sidebar + grid layout reusing `ListingSidebar` (AC#1, AC#2, AC#3)
- [completed] Build `TemplateCard` per §3.2: whole-card link + top-right round download icon-button (tooltip, green-on-hover, `stopPropagation`) (AC#4, AC#8)
- [completed] Card content: tag rotation §1.2 + file-format badge from `file_type`, title, 2-line description, "{download_count} downloads · View →" footer; no "Free" badge (AC#5, AC#6, AC#7)
- [completed] Templates query + `EmptyState` + grid stagger (80ms, reduced-motion) (AC#9, AC#10)

## Notes
- _Analyzed 2026-05-23: (1) switched to the §3.5 sidebar layout (was pill bar); (2) replaced the "Download Free" primary CTA with the §3.2 `TemplateCard` design (whole-card link + corner download icon-button)._
- §3.2 mentions a "{pages} pages" segment in the card footer, but `resources` has **no page-count column** — the footer ships as "{download_count} downloads" only. Add a `resources.page_count` field + restore "pages" when admin upload captures it (not in scope here).
- "No Free badge" decision is explicit in `UI-DESIGN-HANDOFF.md` §4.2 — re-introduce only when paid templates land.
- Categories from blueprint §5 Module 3.
- _Executed 2026-05-26: `app/(public)/templates/page.tsx` reuses the blog-01 listing kit (`ListingShell`/`ListingSidebar`/`PageHeader`/`EmptyState`) over the **`resources` table seeded by blog-05**. Data layer added to `lib/resources.ts`: `listResources({category})` (most-downloaded first) + `getTemplateCategoryCounts()`; `id` added to the `Resource` projection so the download control can send `template_id`. New components under `components/templates/`: `TemplateCard` (server, **stretched-link** pattern so the whole card links to the detail while the download control stays a sibling — avoids the nested-interactive a11y violation), `TemplateDownloadButton` (`"use client"`, POSTs `/api/download`), `TemplateGrid` (80ms stagger). `templateCategoryLabel` added to `lib/categories.ts`. **No sort dropdown and no file-format filter** in the sidebar — neither is in the AC set (the prototype had both); default order is most-downloaded. Tests: 7 unit (4 `resources` + 3 `TemplateCard` incl. component axe) + 7 E2E (`templates-listing.spec.ts`, incl. the `/api/download` POST intercept for AC#8). **AC#1 cache header is the documented manual/infra check** (same Next-14 `no-store` limitation as blog-01)._
