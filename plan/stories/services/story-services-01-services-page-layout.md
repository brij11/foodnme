---
id: story-services-01
topic: services
sprint: 1
story_points: 4
status: ready
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-23
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
- [ ] `/services` SSG with on-demand revalidation
- [ ] Hero overline `CONSULTING SERVICES`, H1 in Fraunces 700, primary CTA scrolls to `#inquiry`
- [ ] Services grid: exactly 6 cards (FSSAI Compliance, HACCP Development, Food Safety Documentation, Product Development Guidance, QMS Setup, Audit Preparation & Support)
- [ ] Service-card icon color: dark olive (`--color-text`), not green — per `UI-DESIGN-HANDOFF.md` §4.1
- [ ] Service-card overlines: dark olive
- [ ] Credibility section: 2-column layout with founder photo + name + title (left), bio + certifications + years + clients helped (right)
- [ ] "How it works" stepper: 4 steps (Submit Inquiry, Discovery Call, Proposal & Plan, Implementation) with primary-green number circles
- [ ] Page is responsive at 375 / 768 / 1280 breakpoints

## Tasks
- [new] Build `app/(public)/services/page.tsx` as SSG with on-demand revalidation + hero (Fraunces H1, overline, CTA scroll-to-`#inquiry`) (AC#1, AC#2)
- [new] Build the 6-card services grid via `ServiceCard` — dark-olive icons + overlines (§4.1), the six named services (AC#3, AC#4, AC#5)
- [new] Build the credibility/about section (2-col: founder photo + name/title | bio + certifications + years + clients) (AC#6)
- [new] Build the 4-step "How it works" stepper with primary-green number circles; verify responsiveness at 375/768/1280 (AC#7, AC#8)

## Notes
- Service icon-color rule from `UI-DESIGN-HANDOFF.md` §4.1 — service cards do NOT use `--color-primary` for icons.
- _Analyzed 2026-05-23: resolved the open Calendly question — **Calendly embed is deferred** out of Sprint 1 (inquiry form + consultation modal are the conversion paths). Revisit when a scheduling flow is committed (relates to blueprint §5 Module 6)._
- The 6 service names are the canonical Sprint-1 set; keep them in sync with the consultation modal's `service_needed` enum (`story-services-02` / `story-services-04`).
