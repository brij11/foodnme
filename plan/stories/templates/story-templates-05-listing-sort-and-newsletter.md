---
id: story-templates-05
topic: templates
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
  - story-templates-01
  - story-newsletter-01
design:
  - design/screens-main.jsx
---

# story-templates-05 — Templates listing parity: sort dropdown + newsletter banner

## User story
As a visitor browsing templates, I want to sort results and a prompt to subscribe, so that I can order the list and stay informed of new templates.

## Description
The prototype templates listing has a sort dropdown in the results header and a full-width `<NewsletterBanner>` below the grid; the build dropped both. This story restores them. Covers DEVIATIONS.md **A3, A4**.

## Acceptance criteria
- [x] The results header shows a sort dropdown (e.g. Most downloaded / Most recent) that re-orders the grid (DEVIATIONS A3; `web/app/(public)/templates/page.tsx:99` vs `design/screens-main.jsx:546`) — covered by SortSelect.test.tsx + resources.test.ts
- [x] Sort options exclude "shortest by pages" (the `resources` table has no page-count column — see story-templates-01 / DEVIATIONS C7) — covered by SortSelect.test.tsx + resources.test.ts (never calls order with 'pages')
- [x] A full-width `<NewsletterBanner source="templates" …>` section renders below the listing shell (DEVIATIONS A4; `design/screens-main.jsx:572` vs `web/app/(public)/templates/page.tsx:118`) — covered by NewsletterBanner.test.tsx
- [x] Sort state survives via searchParams and composes with the existing category + file-format filters — covered by resources.test.ts (AC#4 compose test)
- [x] No regression to the faithful sidebar (search, category counts, file-format checkboxes, clear-all) — sidebar props unchanged; templates.test.tsx verifies TemplateCard renders

## Tasks
- [completed] Add a sort dropdown (Most downloaded / Most recent) to the templates listing results header, wired via searchParams (AC 1, 4)
- [completed] Ensure sort composes with the existing category + file-format filters (AC 4)
- [completed] Add a full-width `<NewsletterBanner source="templates" …>` section below the listing shell (AC 3)
- [completed] Confirm sort options exclude any page-count ordering — no schema column (AC 2)
- [completed] Add/adjust tests: sort re-orders results + newsletter banner renders (AC 1, 3)

## Notes
- exec_model: sonnet — reuses the existing SortSelect pattern + NewsletterBanner component.
- Source: `plan/DEVIATIONS.md` A3, A4.
- The full-width banner is distinct from the sidebar mini-newsletter that §3.5 correctly excludes for templates.
- Reuse the existing `SortSelect` pattern from the blog listing and `<NewsletterBanner>` from story-newsletter-01.
