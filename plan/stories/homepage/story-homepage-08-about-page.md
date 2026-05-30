---
id: story-homepage-08
topic: homepage
sprint: 4
story_points: 3
status: ready
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-30
dependencies:
  - story-homepage-02
design:
  - design/screens-main.jsx
---

# story-homepage-08 — About page (`/about`)

## User story
As a first-time visitor weighing whether to trust foodnme, I want an About page that explains who runs it and why, so that I can judge the credibility of the content before I act on it.

## Description
Build the static About page at `app/(public)/about/page.tsx`, which is currently missing entirely — the navbar, footer, and the login/register Terms & Privacy links all point to `/about` and 404 today. Port the prototype `AboutPage` from `screens-main.jsx`: hero, stats row, mission, "what we do" cards, founder section, values, and final CTA. Route is SSG with on-demand revalidation per `TECHNICAL-REQUIREMENTS.md` §7.

## Acceptance criteria
- [ ] `app/(public)/about/page.tsx` renders and resolves (no 404) at `/about`
- [ ] Hero: display H1 (Fraunces, single H1 per page) with the italic-emphasis treatment + `body-lead` intro, per the prototype
- [ ] Stats row of 4 metrics renders (counts grounded in real/approximate values per §6 copy rules — never round thousands)
- [ ] Mission section (2-column intro + mission statement) renders
- [ ] "What we do" renders 4 cards (blog, templates, jobs, experts) each linking to its surface
- [ ] Founder section renders (image + bio + credentials checklist + stats)
- [ ] Values section renders 3 numbered cards (01–03)
- [ ] Final CTA renders with the "Book a consultation" button (opens the global consultation modal) + a services link
- [ ] Page is SSG with on-demand revalidation; `generateMetadata` returns title + description + OG card
- [ ] No emoji; green used only on actionable elements (§1.1 design rules)

## Tasks
- [new] Create `app/(public)/about/page.tsx` and port the `AboutPage` structure from `screens-main.jsx` (line 859): hero, stats row, mission, "what we do", founder, values, CTA
- [new] Hero: single H1 (Fraunces, italic-emphasis treatment) + `body-lead` intro per prototype
- [new] Stats row of 4 metrics (real/approximate values per §6 copy rules — never round thousands)
- [new] Mission section (2-column intro + mission statement) + "What we do" 4 cards (blog/templates/jobs/experts) each linking to its surface
- [new] Founder section (image + bio + credentials checklist + stats) and Values section (3 numbered cards 01–03)
- [new] Final CTA wired to open the global consultation modal ("Book a consultation") + a services link
- [new] Make the route SSG with on-demand revalidation; add `generateMetadata` (title + description + OG card)
- [new] Verify §1.1 rules (no emoji; green only on actionable elements; single H1) and add a smoke test asserting `/about` resolves (no 404) and renders each section

## Notes
- Audit gap #8 (Major): page absent; breaks nav, footer, and auth T&C/Privacy links.
- `/about` is already listed in `TECHNICAL-REQUIREMENTS.md` §7 routing (SSG) — no tech-feasibility gap.
- Founder bio / credentials / stats copy reuse the prototype `AboutPage` content as the source of truth; replace placeholder figures with founder-approved numbers.
- Follow-up (out of scope): real Terms & Privacy pages — auth links currently target `/about` as a placeholder.
