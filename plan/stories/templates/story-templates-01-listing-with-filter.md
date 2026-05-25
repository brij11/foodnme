---
id: story-templates-01
topic: templates
sprint: 1
story_points: 4
status: ready
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-23
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
- [ ] `/templates` SSR with `searchParams.category`, cache `s-maxage=60, stale-while-revalidate=300`
- [ ] Sidebar (§3.5): search input → category list with counts (All · HACCP · Audit Checklists · SOP Templates · QC Inspection · Compliance Docs) → "Clear all filters" (no mini-newsletter here — that's blog/category only, per §3.5)
- [ ] Mobile: sidebar collapses into a bottom-sheet filter drawer
- [ ] `TemplateCard` per §3.2: whole card is a `<Link>` to `/templates/[slug]`; a round icon-button top-right triggers download (tooltip "Download template", turns green on hover, `stopPropagation` so it doesn't navigate)
- [ ] Card shows category tag (color rotation §1.2) + file-format badge (PDF/DOCX from `resources.file_type`), title, 2-line description
- [ ] Card bottom row: "{download_count} downloads" on the left, "View →" ghost affordance on the right (arrow grows on card hover)
- [ ] No "Free" badge anywhere even though `resources.is_free` exists
- [ ] Download icon-button triggers `/api/download` (story-templates-03)
- [ ] Empty state: `EmptyState` — title + message + CTA
- [ ] Card grid staggers 80ms / child, respects reduced motion

## Tasks
- [new] Build `app/(public)/templates/page.tsx` shell: SSR with `searchParams.category`, cache headers, sidebar + grid layout reusing `ListingSidebar` (AC#1, AC#2, AC#3)
- [new] Build `TemplateCard` per §3.2: whole-card link + top-right round download icon-button (tooltip, green-on-hover, `stopPropagation`) (AC#4, AC#8)
- [new] Card content: tag rotation §1.2 + file-format badge from `file_type`, title, 2-line description, "{download_count} downloads · View →" footer; no "Free" badge (AC#5, AC#6, AC#7)
- [new] Templates query + `EmptyState` + grid stagger (80ms, reduced-motion) (AC#9, AC#10)

## Notes
- _Analyzed 2026-05-23: (1) switched to the §3.5 sidebar layout (was pill bar); (2) replaced the "Download Free" primary CTA with the §3.2 `TemplateCard` design (whole-card link + corner download icon-button)._
- §3.2 mentions a "{pages} pages" segment in the card footer, but `resources` has **no page-count column** — the footer ships as "{download_count} downloads" only. Add a `resources.page_count` field + restore "pages" when admin upload captures it (not in scope here).
- "No Free badge" decision is explicit in `UI-DESIGN-HANDOFF.md` §4.2 — re-introduce only when paid templates land.
- Categories from blueprint §5 Module 3.
