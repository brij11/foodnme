---
id: story-homepage-02
topic: homepage
sprint: 1
story_points: 3
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

# story-homepage-02 — (public) layout + Navbar + Footer

## User story
As a visitor, I want consistent navigation and footer on every public page, so that I can orient myself and reach the brand's secondary content from anywhere on the site.

## Description
Implement `app/(public)/layout.tsx` containing the global `Navbar` and `Footer`. The navbar renders the full six-item IA from `UI-DESIGN-HANDOFF.md` §2.1 (About Us · Knowledge Hub · Templates · Jobs · Experts · Services) from day one — but **Jobs** and **Experts** ship as visible-but-disabled "coming soon" links until their Sprint-2 surfaces exist, so the nav's shape never changes for returning visitors. A "Get a Consultation" CTA opens the consultation modal (`story-services-04`). Footer renders the four-column layout (Brand · Explore · Topics · Contact) per §2.2, plus a mini newsletter input on pages that don't render the full banner. The navbar also carries the reading-progress edge (§4.6), inert until an article page drives it.

## Acceptance criteria
- [ ] Navbar logo reads "foodnme" in Inter 800 dark olive (`--color-text`), not green
- [ ] Nav items render in §2.1 order: About Us, Knowledge Hub (→ `/blog`), Templates, Jobs, Experts, Services — Inter 500
- [ ] **Jobs** and **Experts** render disabled: muted text, `cursor: not-allowed`, `aria-disabled="true"`, no underline-grow hover, not focusable as links (per §2.1 Sprint-1 rollout note)
- [ ] Active (enabled) link styled with the green active underline per §1.1
- [ ] "Get a Consultation" CTA primary green button, radius 10px, opens the consultation modal (`story-services-04`)
- [ ] Footer renders four columns per `UI-DESIGN-HANDOFF.md` §2.2 (Brand · Explore · Topics · Contact)
- [ ] Mini newsletter input appears in footer only on pages without a full `NewsletterBanner` section
- [ ] Navbar bottom edge hosts the reading-progress strip (`::after` bound to `--reading-progress`, default 0) per §4.6
- [ ] Layout renders correctly at mobile (375px), tablet (768px), desktop (1280px+) breakpoints; mobile nav uses a drawer
- [ ] Skip-to-content link present and visible on focus

## Tasks
- [new] Scaffold `app/(public)/layout.tsx` with skip-to-content link and the `Navbar`/`Footer` slots (AC#10, responsive shell)
- [new] Build `Navbar`: logo (dark olive), six §2.1 items with Knowledge Hub → `/blog`, green active-underline, mobile drawer (AC#1, AC#2, AC#4, AC#9)
- [new] Add disabled "coming soon" treatment for Jobs/Experts (muted, `not-allowed`, `aria-disabled`, no hover-grow, non-focusable) (AC#3)
- [new] Wire the "Get a Consultation" CTA to `openConsultationModal()` (provider from `story-services-04`) (AC#5)
- [new] Add the navbar reading-progress `::after` edge bound to `--reading-progress` (AC#8)
- [new] Build `Footer`: four §2.2 columns + conditional mini-newsletter input (rendered only when no full banner on the page) (AC#6, AC#7)

## Notes
- Navigation order + labels from `UI-DESIGN-HANDOFF.md` §2.1; "Knowledge Hub" is the nav label, the route is `/blog`.
- _Analyzed 2026-05-23: resolved the nav/footer divergence — chose "full nav now, Jobs/Experts disabled" + the §2.2 four-column footer (was: 3 links + 3-col footer). A §2.1 rollout note was added to the design doc._
- Logo color decision rationale in `UI-DESIGN-HANDOFF.md` §4.1 — do not "fix" it to green.
- The "Get a Consultation" CTA wires to the consultation modal (`story-services-04`), not the `/services` inquiry form.
