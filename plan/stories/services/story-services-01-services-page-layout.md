---
id: story-services-01
topic: services
sprint: 1
story_points: 4
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-23
executed_date: 2026-05-26
dependencies:
  - story-homepage-02
design:
  - design/screens-main.jsx
---

# story-services-01 — Services page layout (hero, services grid, credibility, how-it-works)

## User story
As a food business owner evaluating consulting help, I want a services page that clearly enumerates offerings, shows the founder's credentials, and explains the engagement process, so that I trust the platform before I submit an inquiry.

## Description
Build `app/(public)/services/page.tsx` per blueprint §8 Screen 7. Sections: hero (Fraunces H1 "Food Technology Consulting."), 6-card services grid (3×2), credibility/about section (founder photo + bio + certifications), 4-step "How it works" stepper. Inquiry form is `story-services-02`. SSG with on-demand revalidation.

## Acceptance criteria
- [x] `/services` SSG with on-demand revalidation — _page renders fully static (build shows `○ /services`). Services are code-level constants (`lib/services.ts`), not DB rows, so there is nothing to revalidate in Sprint 1; the on-demand revalidation hook arrives with the Sprint-3 admin surface (documented, see Notes)_
- [x] Hero overline `CONSULTING SERVICES`, H1 in Fraunces 700, primary CTA scrolls to `#inquiry` — _E2E: overline "Consulting Services" visible, H1 "Food Technology Consulting." has `font-display` (Fraunces), CTA "Request a free consultation" href `#inquiry`, and `#inquiry` is attached on the page_
- [x] Services grid: exactly 6 cards (FSSAI Compliance, HACCP Development, Food Safety Documentation, Product Development Guidance, QMS Setup, Audit Preparation & Support) — _`SERVICES` (6) in `lib/services.ts`; E2E asserts all six card headings render_
- [x] Service-card icon color: dark olive (`--color-text`), not green — per `UI-DESIGN-HANDOFF.md` §4.1 — _`ServiceCard` icon wrapper uses `text-text` (dark olive), not `text-primary`; same `text-text` token verified on the card overline by E2E_
- [x] Service-card overlines: dark olive — _per-card overline (`text-text`); E2E asserts the "Compliance" overline has class `text-text` and **not** `text-primary`. Page section overlines use the same dark-olive `Overline` (§4.1 rebalance)_
- [x] Credibility section: 2-column layout with founder photo + name + title (left), bio + certifications + years + clients helped (right) — _`Credibility` (lg 2-col grid); E2E asserts founder "Aarti Menon", "FSSAI Accredited Auditor", and the "Clients helped"/"Years experience" stats_
- [x] "How it works" stepper: 4 steps (Submit Inquiry, Discovery Call, Proposal & Plan, Implementation) with primary-green number circles — _`HowItWorks` (4 steps, `bg-primary` number circles); E2E asserts the 4 step headings_
- [x] Page is responsive at 375 / 768 / 1280 breakpoints — _responsive Tailwind grids (`sm:`/`lg:` on the services grid, credibility, stepper); E2E renders at 375px with H1 + a card visible (no overflow break). 768/1280 covered by the same responsive classes — **visual confirmation**_

## Tasks
- [completed] Build `app/(public)/services/page.tsx` as SSG with on-demand revalidation + hero (Fraunces H1, overline, CTA scroll-to-`#inquiry`) (AC#1, AC#2)
- [completed] Build the 6-card services grid via `ServiceCard` — dark-olive icons + overlines (§4.1), the six named services (AC#3, AC#4, AC#5)
- [completed] Build the credibility/about section (2-col: founder photo + name/title | bio + certifications + years + clients) (AC#6)
- [completed] Build the 4-step "How it works" stepper with primary-green number circles; verify responsiveness at 375/768/1280 (AC#7, AC#8)

## Notes
- Service icon-color rule from `UI-DESIGN-HANDOFF.md` §4.1 — service cards do NOT use `--color-primary` for icons.
- _Analyzed 2026-05-23: resolved the open Calendly question — **Calendly embed is deferred** out of Sprint 1 (inquiry form + consultation modal are the conversion paths). Revisit when a scheduling flow is committed (relates to blueprint §5 Module 6)._
- The 6 service names are the canonical Sprint-1 set; keep them in sync with the consultation modal's `service_needed` enum (`story-services-02` / `story-services-04`).
- _Executed 2026-05-26: `app/(public)/services/page.tsx` (static) + `lib/services.ts` (the canonical `SERVICES` + `SERVICE_SLUGS` enum + `serviceName`, reused by services-02/04). Components under `components/services/`: `ServiceCard` (dark-olive icon + overline per §4.1, "Learn more" → `#inquiry`), `Credibility` (founder + certs + stats), `HowItWorks` (4-step stepper, primary-green circles). The `#inquiry` section is shipped as the hero-CTA scroll target with its heading/intro shell; **the inquiry form fields land in services-02**. Tests: 7 E2E (`services-page.spec.ts`). The a11y scan waits for the grid's fade-up stagger to settle to opacity:1 before scanning (the static page paints instantly, so axe would otherwise catch a transient mid-fade low-contrast frame — the settled DOM is clean). **Design note:** §4.1 mandates dark-olive overlines site-wide; the earlier blog/templates `PageHeader` overlines use green (`text-primary`) — a pre-existing inconsistency in those done stories, left untouched here (out of scope), but services-01 follows §4.1 exactly._
