---
id: story-templates-05
topic: templates
sprint: 5
story_points: 3
status: in-progress
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-31
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
- [ ] The results header shows a sort dropdown (e.g. Most downloaded / Most recent) that re-orders the grid (DEVIATIONS A3; `web/app/(public)/templates/page.tsx:99` vs `design/screens-main.jsx:546`)
- [ ] Sort options exclude "shortest by pages" (the `resources` table has no page-count column — see story-templates-01 / DEVIATIONS C7)
- [ ] A full-width `<NewsletterBanner source="templates" …>` section renders below the listing shell (DEVIATIONS A4; `design/screens-main.jsx:572` vs `web/app/(public)/templates/page.tsx:118`)
- [ ] Sort state survives via searchParams and composes with the existing category + file-format filters
- [ ] No regression to the faithful sidebar (search, category counts, file-format checkboxes, clear-all)

## Tasks
- [started] Add a sort dropdown (Most downloaded / Most recent) to the templates listing results header, wired via searchParams (AC 1, 4)
- [new] Ensure sort composes with the existing category + file-format filters (AC 4)
- [new] Add a full-width `<NewsletterBanner source="templates" …>` section below the listing shell (AC 2)
- [new] Confirm sort options exclude any page-count ordering — no schema column (AC 2)
- [new] Add/adjust tests: sort re-orders results + newsletter banner renders (AC 1, 2)

## Notes
- exec_model: sonnet — reuses the existing SortSelect pattern + NewsletterBanner component.
- Source: `plan/DEVIATIONS.md` A3, A4.
- The full-width banner is distinct from the sidebar mini-newsletter that §3.5 correctly excludes for templates.
- Reuse the existing `SortSelect` pattern from the blog listing and `<NewsletterBanner>` from story-newsletter-01.
