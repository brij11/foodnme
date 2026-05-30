---
id: story-templates-04
topic: templates
sprint: 4
story_points: 2
status: ready
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-30
dependencies:
  - story-templates-01
design:
  - design/screens-main.jsx
---

# story-templates-04 — Templates file-format (PDF/DOCX) filter

## User story
As someone who needs an editable document, I want to filter templates by file format, so that I can find a DOCX I can customize rather than a fixed PDF.

## Description
The templates listing reuses the shared `ListingSidebar`, which offers only search + category — the designed PDF/DOCX file-format filter (`screens-main.jsx` Templates sidebar) is missing. Add a file-format filter to the templates sidebar, backed by `resources.file_type`, with state preserved in the URL query params like the existing category filter.

## Acceptance criteria
- [ ] Templates sidebar renders a file-format filter (at least PDF and DOCX) below the category list
- [ ] Selecting a format filters the grid to matching `resources.file_type`; multiple formats union
- [ ] Filter state is encoded in the URL query params and survives refresh / back-forward
- [ ] Result count and the `EmptyState` reflect the active format filter
- [ ] "Clear all filters" resets format alongside category and search
- [ ] Works in both the desktop rail and the mobile filter drawer

## Tasks
- [new] Extend the shared `ListingSidebar` with a generic optional facet prop (preferred over a templates-specific sidebar) to host the file-format filter below the category list
- [new] Render PDF + DOCX format options backed by `resources.file_type`; multiple selections union
- [new] Encode the format filter in URL query params (survives refresh / back-forward), like the existing category filter
- [new] Make the result count and `EmptyState` reflect the active format filter; "Clear all filters" resets format alongside category + search
- [new] Ensure it works in both the desktop rail and the mobile filter drawer
- [new] Add a test for format filtering, multi-select union, URL round-trip, and clear-all

## Notes
- Audit gap #5 (Partial). `resources.file_type` already exists (§4.2) — no schema gap.
- Decide whether to extend the shared `ListingSidebar` with an optional facets slot or add a templates-specific sidebar; prefer the shared component with a generic facet prop.
