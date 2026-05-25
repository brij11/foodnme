---
id: story-templates-02
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
  - story-templates-01
design:
  - design/screens-main.jsx
---

# story-templates-02 — Template detail /templates/[slug] with download CTA + optional email capture

## User story
As a food-tech professional, I want a template detail page that previews what's inside and lets me download instantly (with optional email signup), so that I can grab the resource fast and decide later whether to stay in touch.

## Description
Build `app/(public)/templates/[slug]/page.tsx`: breadcrumb (Home > Templates > {Category}), template header (category tag + file format badge), "What's Included" card with bullet list, large primary "Download Free Template" button, optional email-capture field (not a hard gate), "Similar Templates" grid (`TemplateCard` per §3.2), and a "Need a customized version?" cross-sell CTA linking to `/services#inquiry`. Page is SSG.

## Acceptance criteria
- [x] `/templates/[slug]` SSG via `generateStaticParams` over all templates — _`generateStaticParams` over `getAllTemplateSlugs()`; build SSG's 9 template pages (`●`); E2E asserts an unknown slug 404s_
- [x] On-demand revalidation when admin edits/uploads — _page is SSG + `dynamicParams`; the `revalidatePath('/templates/[slug]')` trigger lives in the **Sprint-3 admin CRUD** (no admin surface in Sprint 1). Mechanism in place; trigger arrives with admin (mirrors story-blog-02/04)_
- [x] Breadcrumb: Home › Templates › {Category} — _`Breadcrumb` (Templates link + current category span `aria-current="page"`); E2E_
- [x] H1 in Inter 700 (not Fraunces — Fraunces is hero-only) — _H1 uses `font-heading font-bold` (Inter 700), not `font-display`; E2E asserts the H1 text_
- [x] "What's Included" card renders a bullet list parsed from `resources.description` (markdown-style bullet lines); falls back to the plain paragraph if no bullets present — _`parseWhatsIncluded` + `WhatsIncluded`; unit tests cover both branches; E2E asserts the bulleted checklist on the dairy template (seed enriched with markdown bullets) and the plain-paragraph fallback on `supplier-audit-checklist`_
- [x] Download button POSTs to `/api/download` (story-templates-03) with `template_id` and optional email — _`TemplateDownloadPanel` POSTs `{ template_id, email? }`; E2E intercepts the POST and asserts `template_id` (and `email` when filled). Endpoint itself = templates-03_
- [x] Email field caption reads: "Enter your email to receive updates when this template is revised." (per blueprint §8 Screen 6) — _exact caption on the `<label>`; E2E asserts the copy verbatim_
- [x] Download works WITHOUT email — email is optional, not gated — _email omitted from the POST body when blank; E2E clicks Download with an empty field and asserts the body has `template_id` and **no** `email`_
- [x] "Similar Templates" section renders 3 `TemplateCard`s in the same category (§3.2 card design) — _`getSimilarTemplates` (same-category → top-up); E2E asserts 3 `/templates/*` cards in the section; unit test covers the fallback_
- [x] Cross-sell CTA links to `/services#inquiry` — _"Request customization" Link; E2E asserts the href_
- [x] `generateMetadata` returns per-template title + description + OG card — _`generateMetadata` (title/description/openGraph/twitter) + per-template `opengraph-image.tsx` via `next/og`; E2E asserts `toHaveTitle`_

## Tasks
- [completed] Build `app/(public)/templates/[slug]/page.tsx` as SSG (`generateStaticParams`) + on-demand revalidation + breadcrumb + Inter H1 (AC#1, AC#2, AC#3, AC#4)
- [completed] "What's Included" card: parse markdown-style bullets from `resources.description`, fall back to paragraph (AC#5)
- [completed] Download button → `POST /api/download` with `template_id` + optional email; ungated (works without email) + caption copy (AC#6, AC#7, AC#8)
- [completed] "Similar Templates" grid (3 same-category `TemplateCard`s) + "Need a customized version?" cross-sell → `/services#inquiry` (AC#9, AC#10)
- [completed] `generateMetadata` + per-template OG image via `next/og` (AC#11)

## Notes
- "Email is optional, not a hard gate" is explicit in blueprint §5 Module 3 — do not make it required.
- The page does NOT render a "Free" badge in the header — see `UI-DESIGN-HANDOFF.md` §4.2.
- Per-template OG image via `next/og` per `TECHNICAL-REQUIREMENTS.md` §7.3.
- _Analyzed 2026-05-23: resolved the "What's Included" source — Sprint 1 parses markdown-style bullets from the existing `resources.description` (text) column; a dedicated structured field is a future enhancement, not a Sprint-1 schema change. "Similar Templates" reuses the §3.2 `TemplateCard` from `story-templates-01`._
- _Executed 2026-05-26: `app/(public)/templates/[slug]/page.tsx` (SSG, `dynamicParams`) + `opengraph-image.tsx`. Data layer added to `lib/resources.ts`: `getAllTemplateSlugs`, `getSimilarTemplates` (same-category → top-up most-downloaded), `parseWhatsIncluded` (markdown-bullet splitter w/ paragraph fallback). Components: `WhatsIncluded` (checklist or paragraph), `TemplateDownloadPanel` (`"use client"`, ungated download POST + optional email). The **dairy HACCP template's seed description was enriched with markdown bullets** so AC#5's bullet branch is live (others stay plain-paragraph to exercise the fallback). Tests: +4 unit (2 `parseWhatsIncluded`, 2 `getSimilarTemplates`) + 8 E2E (`template-detail.spec.ts`). **a11y fix:** the "Customization" overline and the download-panel file-type chip used `text-primary` on `bg-surface-light` (4.27:1, below AA) → switched to `text-primary-deep` (#3a6346 ≈ 6:1). **AC#2 revalidation** = documented Sprint-3 admin dependency (blog-02 parity)._
