---
id: story-newsletter-01
topic: newsletter
sprint: 1
story_points: 2
status: ready
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-23
dependencies:
  - story-homepage-01
design:
  - design/screens-main.jsx
---

# story-newsletter-01 — NewsletterBanner reusable component

## User story
As a reader on any content page, I want a clearly labeled newsletter signup with copy that explains the value, so that I subscribe when I find the content useful — not because I'm guilted by a popup.

## Description
Build a reusable `NewsletterBanner` component used by homepage, blog listing, article detail, templates listing, and template detail. Surface-light background, H3 + subtext + inline email input + Subscribe button, "No spam. Unsubscribe anytime." caption. Props: `headline`, `subtext`, `source` (passed through to the API for `newsletter_subscribers.source`).

## Acceptance criteria
- [ ] Background `--color-surface-light` (#F5F0E8)
- [ ] H3, subtext, inline email + Subscribe button — Inter/Plex per spec
- [ ] Caption: "No spam. Unsubscribe anytime."
- [ ] `source` prop passed through to `/api/newsletter` (e.g. `homepage`, `blog`, `template`)
- [ ] Submit POSTs to `/api/newsletter` (story-newsletter-02)
- [ ] Turnstile widget renders inline (per `TECHNICAL-REQUIREMENTS.md` §9.6)
- [ ] Success state replaces the form with confirmation: "Subscribed — check your inbox."
- [ ] Failure state inline error; do not lose input
- [ ] Email field is `type="email"` with HTML5 validation as a first pass; Zod validates server-side
- [ ] Component is server-renderable (form action) — no required client JS for first paint
- [ ] Mini footer-newsletter variant (smaller surface, single line) rendered conditionally via prop, not a separate component

## Tasks
- [new] Build `NewsletterBanner` markup: surface-light bg, H3 + subtext + inline email + Subscribe button + "No spam. Unsubscribe anytime." caption; `headline`/`subtext`/`source` props (AC#1–4)
- [new] Render inline Turnstile widget per §9.6; `type="email"` HTML5 first pass (server-side Zod in story-newsletter-02) (AC#6, AC#9)
- [new] Wire submit → `POST /api/newsletter` with `source`; success-replaces-form + inline failure state that preserves input (AC#5, AC#7, AC#8)
- [new] Add the compact `mini` prop variant (single-line footer form) and confirm the base renders server-side via form action with no client JS required for first paint (AC#10, AC#11)

## Notes
- Reuse points: homepage, blog listing, article detail, templates listing, template detail.
- Two copy variants per `UI-DESIGN-HANDOFF.md` (homepage variant vs. blog variant) — pass via `headline`/`subtext` props.
- Mini footer-newsletter variant: smaller surface, single line — render conditionally via prop, not a separate component.
- _Analyzed 2026-05-23: no open questions — ACs fully grounded in §9.6 + the §3 component inventory; promoted the mini-variant note into an explicit acceptance criterion._
