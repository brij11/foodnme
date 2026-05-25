---
id: story-homepage-01
topic: homepage
sprint: 1
story_points: 4
status: ready
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-23
dependencies: []
design:
  - design/screens-main.jsx
---

# story-homepage-01 — Tailwind theme tokens + Google Fonts + base UI primitives

## User story
As the founder building the production site, I want Tailwind configured with the design tokens and base UI primitives available, so that every subsequent page can compose from a consistent visual system without re-implementing styles.

## Description
Configure `tailwind.config.ts` to extend with the colors, spacing, radius, and shadow tokens from `FoodTech_Theme_Fresh_Sustainability_Minimal (1).md`. Set up the Google Fonts loader for Fraunces, Inter, IBM Plex Sans, and IBM Plex Mono. Build the base UI primitives (`Button`, `Card`, `Badge`/`Tag`, `Input`, `Textarea`, `Select`, `Alert`) referenced across screens. Thin `globals.css` for resets + `@font-face` only.

## Acceptance criteria
- [ ] `tailwind.config.ts` exposes `--color-primary`, `--color-secondary`, `--color-accent`, `--color-background`, `--color-text`, `--color-muted`, `--color-border`, `--color-card-bg`, `--color-surface-light` as theme colors
- [ ] Fraunces, Inter, IBM Plex Sans, IBM Plex Mono load via `next/font/google` with `display: swap`
- [ ] `Button` variants: primary, ghost, outline; sizes: sm, md, lg; respects `:disabled` and `:focus-visible`
- [ ] `Tag` supports the five tag colors from `UI-DESIGN-HANDOFF.md` §1.2 (`green`, `safe`, `orange`, `neutral`, `accent`)
- [ ] `Input`, `Textarea`, `Select` render error state when passed an `error` prop
- [ ] All primitives pass Axe-core with zero serious violations
- [ ] Bundle size of primitives chunk ≤ 20 KB gzipped

## Tasks
- [new] Extend `tailwind.config.ts` with the color, spacing (`--sp-*`), radius (`--radius-*`), and shadow (`--shadow-card/dropdown/elevated`) tokens from the theme reference (AC#1)
- [new] Wire `next/font/google` for Fraunces, Inter, IBM Plex Sans, IBM Plex Mono (`display: swap`); reduce `globals.css` to resets + `@font-face` only (AC#2)
- [new] Build `Button` primitive — primary/ghost/outline × sm/md/lg, `:disabled` + `:focus-visible` states (AC#3)
- [new] Build `Tag` primitive with the five `green|safe|orange|neutral|accent` variants from §1.2 (AC#4)
- [new] Build `Input`, `Textarea`, `Select` with `error`-prop state, plus `Card`, `Badge`, `Alert` (AC#5)
- [new] Add Axe-core check (zero serious) and a CI bundle-size assertion (≤ 20 KB gzipped) on the primitives chunk (AC#6, AC#7)

## Notes
- Tokens source: `design/FoodTech_Theme_Fresh_Sustainability_Minimal (1).md` and `TECHNICAL-REQUIREMENTS.md` §2 (Tailwind chosen; **OQ#7 resolved 2026-05-23 — Tailwind is locked; plain-CSS migration dropped**).
- Typography rules from `UI-DESIGN-HANDOFF.md` §1.3: Fraunces = hero H1 only, Inter = UI, IBM Plex Sans = body.
- Color rule from `UI-DESIGN-HANDOFF.md` §4.1: logo, stat numbers, service-card icons stay dark olive (`--color-text`), not `--color-primary`.
- _Analyzed 2026-05-23: no open questions — ACs are testable and grounded; resolved OQ#7 as the doc-reconciliation for this story._
