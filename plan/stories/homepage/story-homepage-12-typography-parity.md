---
id: story-homepage-12
topic: homepage
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
  - story-homepage-05
  - story-homepage-06
design:
  - design/screens-main.jsx
---

# story-homepage-12 — Homepage typography & accent parity

## User story
As a reader, I want the homepage typography to follow the locked type roles, so that the editorial hierarchy reads exactly as designed.

## Description
The build uses Fraunces (`font-display`) for stat numbers and IBM Plex (`font-body`) for testimonial blockquotes — the inverse of the contract. Per `TECHNICAL-REQUIREMENTS.md §8` + handoff §1.3, **stat numbers are Inter** and **testimonial blockquotes are Fraunces** (the one beat where §1.3 mandates Fraunces over the "H1-only" rule). Also fixes the value-strip left accent color. Covers DEVIATIONS.md **C1, C2, C3, D2**.

## Acceptance criteria
- [x] Hero stat-strip numbers use Inter (`font-heading`), not Fraunces — color stays dark `text-text` (DEVIATIONS C1; `web/components/home/Hero.tsx:17`) — covered by Hero.test.tsx "stat-strip numbers use font-heading"
- [x] Homepage stats-row numbers use Inter (`font-heading`), not Fraunces (DEVIATIONS C2; `web/components/home/HomeStats.tsx:25`) — covered by HomeStats.test.tsx "stat numbers use font-heading"
- [x] Testimonial blockquotes use Fraunces (`font-display`) per §3.6 #5 + §1.3 (DEVIATIONS C3; `web/components/home/Testimonials.tsx:45` vs `design/styles.css:2661-2662`) — covered by Testimonials.test.tsx "blockquotes use font-display"
- [x] ValueStrip left-edge accent color matches the intended design (confirm green primary vs amber) (DEVIATIONS D2; `web/components/home/ValueStrip.tsx:8` vs `design/styles.css:2528-2529`) — covered by ValueStrip.test.tsx "left-edge accent uses border-primary"
- [x] No other Fraunces usages introduced on UI/section headings (Fraunces stays hero-H1 + testimonials + newsletter heading only) — grepped: no new font-display added to section headings by this story; pre-existing H2 strays (FeaturedThisWeek, KnowledgeHubSection, Scenarios, GoodToKnow) are deferred to a separate sweep

## Tasks
- [completed] Change Hero stat-strip number font from `font-display` to `font-heading` (Inter), keep `text-text` (AC 1)
- [completed] Change HomeStats number font from `font-display` to `font-heading` (AC 2)
- [completed] Change Testimonials blockquote font from `font-body` to `font-display` (Fraunces) (AC 3)
- [completed] Set the ValueStrip left-edge accent to the prototype's primary green (AC 4)
- [completed] Grep the homepage for stray `font-display` on non-H1 / non-testimonial headings; adjust component tests (AC 5)

## Notes
- exec_model: sonnet — font-class / token swaps only.
- Decision (analysis): D2 value-strip left accent is set to the prototype's primary green (`--color-primary`); source of truth = prototype. Confirmed: `.value-strip::before { background: var(--color-primary) }` in `design/styles.css:2528`.
- Source: `plan/DEVIATIONS.md` C1, C2, C3, D2.
- Note the §8-vs-§1.3 typography tension: §8 says "Fraunces = hero H1 only," but §1.3 explicitly lists testimonials + newsletter headings as Fraunces. Testimonials are the sanctioned exception — C3 aligns to it.
- AC5 audit finding: pre-existing stray font-display on section H2s (FeaturedThisWeek, KnowledgeHubSection, Scenarios, GoodToKnow) not introduced by this story — deferred for a future sweep. ValueStrip `.value-line` uses font-display per prototype `.value-strip .value-line { font-family: var(--font-display) }` — this is correct and intentional.
- Also fixed two pre-existing TypeScript errors in auth test mocks (login/page.test.tsx + client.test.ts) that were blocking pnpm typecheck gate.
