---
id: story-templates-02
topic: templates
sprint: 1
story_points: 4
status: ready
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-23
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
- [ ] `/templates/[slug]` SSG via `generateStaticParams` over all templates
- [ ] On-demand revalidation when admin edits/uploads
- [ ] Breadcrumb: Home › Templates › {Category}
- [ ] H1 in Inter 700 (not Fraunces — Fraunces is hero-only)
- [ ] "What's Included" card renders a bullet list parsed from `resources.description` (markdown-style bullet lines); falls back to the plain paragraph if no bullets present
- [ ] Download button POSTs to `/api/download` (story-templates-03) with `template_id` and optional email
- [ ] Email field caption reads: "Enter your email to receive updates when this template is revised." (per blueprint §8 Screen 6)
- [ ] Download works WITHOUT email — email is optional, not gated
- [ ] "Similar Templates" section renders 3 `TemplateCard`s in the same category (§3.2 card design)
- [ ] Cross-sell CTA links to `/services#inquiry`
- [ ] `generateMetadata` returns per-template title + description + OG card

## Tasks
- [new] Build `app/(public)/templates/[slug]/page.tsx` as SSG (`generateStaticParams`) + on-demand revalidation + breadcrumb + Inter H1 (AC#1, AC#2, AC#3, AC#4)
- [new] "What's Included" card: parse markdown-style bullets from `resources.description`, fall back to paragraph (AC#5)
- [new] Download button → `POST /api/download` with `template_id` + optional email; ungated (works without email) + caption copy (AC#6, AC#7, AC#8)
- [new] "Similar Templates" grid (3 same-category `TemplateCard`s) + "Need a customized version?" cross-sell → `/services#inquiry` (AC#9, AC#10)
- [new] `generateMetadata` + per-template OG image via `next/og` (AC#11)

## Notes
- "Email is optional, not a hard gate" is explicit in blueprint §5 Module 3 — do not make it required.
- The page does NOT render a "Free" badge in the header — see `UI-DESIGN-HANDOFF.md` §4.2.
- Per-template OG image via `next/og` per `TECHNICAL-REQUIREMENTS.md` §7.3.
- _Analyzed 2026-05-23: resolved the "What's Included" source — Sprint 1 parses markdown-style bullets from the existing `resources.description` (text) column; a dedicated structured field is a future enhancement, not a Sprint-1 schema change. "Similar Templates" reuses the §3.2 `TemplateCard` from `story-templates-01`._
