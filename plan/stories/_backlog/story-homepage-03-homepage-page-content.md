---
id: story-homepage-03
topic: homepage
sprint: 1
original_sprint: 1
story_points: 4
status: deferred
owner: brij
tasks_populated: false
dependencies:
  - story-homepage-02
  - story-newsletter-01
design:
  - design/screens-main.jsx
---

# story-homepage-03 — Homepage page content (hero, stats, services snapshot, newsletter slot)

## User story
As a first-time visitor, I want a landing page that explains foodnme's value in a single scan, so that I can decide whether to dig into the blog, templates, or services.

## Description
Build `app/(public)/page.tsx` with the homepage narrative sections per blueprint §8 Screen 1 and `UI-DESIGN-HANDOFF.md` §3.6. Hero is editorial (typographic, no hero image). Stats row pulls counts from Supabase (articles published, templates available, industry topics, consultations done). Services snapshot renders three service summary cards. Newsletter banner section slots in `<NewsletterBanner />` from `story-newsletter-01`. Featured articles and featured templates sections are stubs filled by `story-homepage-04`.

## Acceptance criteria
- [ ] Hero H1 in Fraunces 700 ≈ 2.5rem: "Practical resources for a safer food ecosystem." (one H1 per page)
- [ ] Hero overline `INDIA'S FOOD TECHNOLOGY RESOURCE HUB` in Inter 700, uppercase, letter-spacing 0.14em
- [ ] Hero CTAs: "Browse Free Templates" (primary) + "Read the Blog" (ghost)
- [ ] Stats row renders 4 stats with approximate copy (e.g. `120+`, `4.2k`) — never rounded thousands
- [ ] Stat numbers rendered in `--color-text` (dark olive), not `--color-primary`
- [ ] Services snapshot section has surface-light background (`#F5F0E8`)
- [ ] Newsletter banner section renders the shared component
- [ ] Page is SSG with on-demand revalidation
- [ ] Lighthouse LCP < 2.0s, CLS < 0.1 on simulated 4G
- [ ] `generateMetadata` returns site-default title + description + OG card

## Tasks
<!-- Populated by the downstream task-breakdown step, not by this skill.
     Each task should map to one or more acceptance criteria above and be
     small enough to land in a single commit. Until populated, this section
     stays as the single TODO line below. -->
- [ ] TODO — break this story into implementation tasks

## Notes
- Stat copy rule from `UI-DESIGN-HANDOFF.md` §5.2 — approximate, not exact.
- Rendering strategy: SSG + on-demand revalidate per `TECHNICAL-REQUIREMENTS.md` §7.
- Hero variant: editorial (per TWEAK_DEFAULTS in `app.jsx`). Other variants (`split`, `minimal`) are Tweaks-panel only and do not ship to production.

> **⏸ DEFERRED to backlog during analysis 2026-05-23 (`status: deferred`, originally planned for Sprint 1).**
> Decision: Sprint 1 ships the **narrative homepage** per `UI-DESIGN-HANDOFF.md` §3.6 (value strip → 4 scenario framings → ONE large editorial feature → 2 testimonials → stats row → "Featured this week" → final CTA → "Good to know" Q&A → newsletter), **not** the simpler hero+stats+services+featured-grid this story currently describes. That scope is well over 5 SP, so this story must be split. Recommended children (each ≤ 5 SP), to be created via `/manage-stories split story-homepage-03`:
> - **homepage-03a** — Hero + value strip + Scenarios (4 need-framings) + final CTA shell
> - **homepage-03b** — Editorial feature (single large article preview) + Testimonials (2 blockquotes) + Stats row + "Good to know" Q&A
> - **homepage-03c** — "Featured this week" paired cards + newsletter slot (note: the paired card pairs a template with an **expert**; experts are Sprint 2, so ship template-only with an expert stub, or move 03c's expert half to Sprint 2)
> `story-homepage-04` (featured wiring) is folded into this restructure and is also in the backlog.
