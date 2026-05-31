---
id: story-homepage-12
topic: homepage
sprint: 5
story_points: 2
status: in-progress
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-31
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
- [ ] Hero stat-strip numbers use Inter (`font-heading`), not Fraunces — color stays dark `text-text` (DEVIATIONS C1; `web/components/home/Hero.tsx:17`)
- [ ] Homepage stats-row numbers use Inter (`font-heading`), not Fraunces (DEVIATIONS C2; `web/components/home/HomeStats.tsx:25`)
- [ ] Testimonial blockquotes use Fraunces (`font-display`) per §3.6 #5 + §1.3 (DEVIATIONS C3; `web/components/home/Testimonials.tsx:45` vs `design/styles.css:2661-2662`)
- [ ] ValueStrip left-edge accent color matches the intended design (confirm green primary vs amber) (DEVIATIONS D2; `web/components/home/ValueStrip.tsx:8` vs `design/styles.css:2528-2529`)
- [ ] No other Fraunces usages introduced on UI/section headings (Fraunces stays hero-H1 + testimonials + newsletter heading only)

## Tasks
- [completed] Change Hero stat-strip number font from `font-display` to `font-heading` (Inter), keep `text-text` (AC 1)
- [completed] Change HomeStats number font from `font-display` to `font-heading` (AC 2)
- [completed] Change Testimonials blockquote font from `font-body` to `font-display` (Fraunces) (AC 3)
- [completed] Set the ValueStrip left-edge accent to the prototype's primary green (AC 4)
- [started] Grep the homepage for stray `font-display` on non-H1 / non-testimonial headings; adjust component tests (AC 5)

## Notes
- exec_model: sonnet — font-class / token swaps only.
- Decision (analysis): D2 value-strip left accent is set to the prototype's primary green (`--color-primary`); source of truth = prototype.
- Source: `plan/DEVIATIONS.md` C1, C2, C3, D2.
- Note the §8-vs-§1.3 typography tension: §8 says "Fraunces = hero H1 only," but §1.3 explicitly lists testimonials + newsletter headings as Fraunces. Testimonials are the sanctioned exception — C3 aligns to it.
- D2 (value-strip accent green vs amber) needs a quick confirm; prototype uses green `--color-primary`, build uses `border-accent`.
