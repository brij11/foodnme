---
id: story-templates-06
topic: templates
sprint: 5
story_points: 2
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-31
executed_date: 2026-06-01
exec_model: sonnet
dependencies:
  - story-templates-02
design:
  - design/screens-main.jsx
---

# story-templates-06 — Template detail parity: metadata strip + notify affordance

## User story
As a visitor on a template detail page, I want to see the template's metadata and a clear way to be notified of revisions, so that I can assess and follow the resource.

## Description
The prototype template detail shows a metadata strip (Format / Pages / Last updated / Downloads) inside the "What's Inside" card and a standalone "Notify" submit affordance with confirmation microcopy. The build dropped the metadata strip and downgraded notify to a bare email input. Covers DEVIATIONS.md **B14, B15**.

## Acceptance criteria
- [x] The detail page shows a metadata strip with Format / Last updated / Downloads (Pages omitted — no schema column) (DEVIATIONS B14; `web/components/templates/WhatsIncluded.tsx:20` vs `design/screens-main.jsx:638`) — covered by `templates.test.tsx` "WhatsIncluded metadata strip" (5 tests)
- [x] The "notify on revision" affordance is a clear control with submit + success/error microcopy ("You'll be the first to know.") (DEVIATIONS B15; `web/components/templates/TemplateDownloadPanel.tsx:71` vs `design/screens-main.jsx:662`) — covered by `templates.test.tsx` "TemplateDownloadPanel notify affordance" (5 tests)
- [x] Notify submission reuses the existing newsletter/email-capture path (no new endpoint required) — covered by "POSTs to /api/newsletter with source='template-notify'" assertion
- [x] No regression to the faithful detail pieces (breadcrumb, What's-Inside list, request-customization CTA, sticky download panel, similar-templates rail) — all 403 Vitest tests pass + pnpm build clean

## Tasks
- [completed] Add a metadata strip (Format / Last updated / Downloads) to the template detail "What's Inside" area (AC 1)
- [completed] Restore a clear "notify on revision" control with submit + success/error microcopy, reusing the existing email-capture path (AC 2, 3)
- [completed] Add/adjust tests: metadata strip renders + notify success/error states (AC 1, 2)

## Notes
- exec_model: sonnet — presentational strip + reuse of the existing notify/email path; no new endpoint.
- Source: `plan/DEVIATIONS.md` B14, B15.
- "Pages" is intentionally absent everywhere (DEVIATIONS C7 — justified, no schema column); the metadata strip surfaces only the columns that exist.
