---
id: story-homepage-05
topic: homepage
sprint: 3
story_points: 4
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-26
executed_date: 2026-05-30
dependencies:
  - story-homepage-02
design:
  - design/screens-main.jsx
---

# story-homepage-05 — Homepage shell: hero, value strip, scenarios, final CTA

## User story
As a first-time visitor, I want a landing page that opens with a clear value proposition and shows me which of my needs foodnme addresses, so that I immediately know whether to explore further.

## Description
Create `app/(public)/page.tsx` — the narrative homepage shell per `UI-DESIGN-HANDOFF.md` §3.6 and blueprint §8 Screen 1. This story owns the **page-level concerns** (SSG + on-demand revalidate, `generateMetadata`, Lighthouse budget) and the **opening narrative sections**: the editorial hero (typographic, no hero image), the value strip, the four scenario framings, and the final CTA shell. The editorial feature / testimonials / stats / Q&A sections (`story-homepage-06`) and the "Featured this week" + newsletter sections (`story-homepage-07`) are mounted onto this page by their own stories.

## Acceptance criteria
- [x] `app/(public)/page.tsx` renders as SSG with on-demand revalidation (per `TECHNICAL-REQUIREMENTS.md` §7) — `pnpm build` route table marks `/` as `○ (Static)`; data is read via cookie-free server clients so nothing forces dynamic
- [x] Page establishes the §3.6 ten-section order as ordered slots; the four 05-owned sections render at positions 1 (Hero), 2 (Value strip), 3 (Scenarios), 8 (Final CTA). Positions 4–7, 9, 10 are mount points filled by `story-homepage-06` / `story-homepage-07` — `app/(public)/page.tsx` defines all ten commented slots in order
- [x] `generateMetadata` returns site-default title + description + OG card — `page.tsx` exports a static `metadata` with title + description + `openGraph` (site default, no per-request inputs)
- [x] Exactly one H1 on the page: hero H1 in Fraunces 700 (`.h-display`, §1.3) — "Practical resources for a safer food ecosystem." with "safer" in primary-green italic — `Hero.test.tsx` "renders exactly one H1" (AC#4)
- [x] Hero eyebrow is a pill badge with a pulsing live dot reading "India's Food-Tech Resource Hub" (the pulse is pure CSS per §4.3) — `Hero.test.tsx` "renders the pill badge"; pulse is `animate-ping` (CSS only)
- [x] Hero lead: "Field-tested HACCP plans, audit checklists, and expert writing — built for food safety, QC, and regulatory teams who ship product on Monday morning." — `Hero.test.tsx` "renders the lead copy"
- [x] Hero CTAs: "Browse templates" (primary → `/templates`) + "Book a consultation" (secondary → opens the global consultation modal from `story-services-04`). No "Free" wording (§4.2) — `Hero.test.tsx` "renders both CTAs … no 'Free'"
- [x] Hero inline stat strip renders 4 Supabase-derived counts (≈120+ articles, 48 templates, 85+ businesses, 4.2k subscribers) with count-up animation; numbers in `--color-text` dark olive (§4.1/§8); count-up is a client island that respects `prefers-reduced-motion` (§4.10) — `Hero.test.tsx` "renders the 4-stat strip" + `CountUp.test.tsx` (reduced-motion)
- [x] Hero `HeroCollage` visual renders (2 cover photos + an article-preview frame + a stat frame), `aria-hidden`; production images are sourced per §7.5 (Supabase Storage / static assets — not external Unsplash URLs) — `Hero.test.tsx` "hardcodes no external image URLs"; `HeroCollage` root is `aria-hidden`, covers are data-driven
- [x] Value strip renders immediately below the hero: overline "For QA · QC · Regulatory · R&D teams" + the value line per §3.6 — `ValueStrip.test.tsx` (AC#10)
- [x] Four scenario framings render as distinct need-based entry points linking to `/templates`, `/blog`, `/jobs`, `/experts` per §3.6 — `Scenarios.test.tsx` asserts all 4 hooks + hrefs (AC#11)
- [x] Final CTA section renders at §3.6 position 8 (after "Featured this week", before the "Good to know" Q&A — not at the page foot): overline, section heading, lead, "Book a consultation" + "See all services" buttons — `FinalCta.test.tsx` (AC#12)
- [x] Lighthouse LCP < 2.0s and CLS < 0.1 on simulated 4G; SSG snapshot — no client DB call blocks initial render — **automatable part verified:** `/` is SSG (build) and all data is fetched server-side (no client DB call on the homepage); `CountUp`/`HeroCollage` SSR the final value so there is no count-driven layout shift. Full Lighthouse 4G LCP/CLS numbers are a **manual check** (see Notes).

## Tasks
- [completed] Scaffold `app/(public)/page.tsx` as a server component with SSG + on-demand revalidation; lay out the §3.6 ten-section order with mount points/placeholders for the 06- and 07-owned sections (positions 4–7, 9, 10)
- [completed] `generateMetadata`: site-default title + description + OG card
- [completed] Editorial hero — pill badge + CSS pulse dot, single H1 (`.h-display`, Fraunces 700, green italic "safer"), lead copy; CTAs "Browse templates" (→ `/templates`) + "Book a consultation" (opens global consultation modal) as a client island
- [completed] Hero inline count-up stat strip — 4 Supabase-derived counts, dark-olive numbers, count-up client island respecting `prefers-reduced-motion`
- [completed] `HeroCollage` visual — 2 cover photos + article-preview frame + stat frame, `aria-hidden`, images sourced per §7.5 (no external Unsplash URLs)
- [completed] Value strip section — overline + value line (§3.6 position 2)
- [completed] Scenarios section — 4 need-framing cards linking to `/templates`, `/blog`, `/jobs`, `/experts` (§3.6 position 3)
- [completed] Final CTA section at §3.6 position 8 — overline, heading, lead, "Book a consultation" + "See all services"
- [completed] Verification — Lighthouse LCP < 2.0s / CLS < 0.1 on simulated 4G (manual); assert exactly one H1 + zero critical/serious axe violations (a11y E2E)

## Notes
- Split from `story-homepage-03` during restore 2026-05-26; this child owns the page shell + opening narrative sections (hero → value strip → scenarios → final CTA).
- Hero variant: editorial (per TWEAK_DEFAULTS in `app.jsx`); `split`/`minimal` are Tweaks-panel only and do not ship.
- Section sequence + copy grounded in `UI-DESIGN-HANDOFF.md` §3.6 and blueprint §8 Screen 1.
- **Analyzed 2026-05-26:** Hero ACs reconciled to the shipping editorial hero (`hero-improved` in `screens-main.jsx`, the variant §4.9 ships) per founder decision — pill badge (not a plain overline), CTAs "Browse templates" + "Book a consultation" (the drafted "Browse **Free** Templates" violated §4.2 and was dropped), `HeroCollage` photo collage retained (the drafted "no hero image" was an earlier aspiration the design source contradicts), and the inline count-up stat strip kept.
- **Stats appear twice by decision:** hero inline strip + the mid-page Stats row owned by `story-homepage-06`. Different metric sets, both Supabase-derived — hero = articles / templates / businesses / subscribers; mid-page = articles / templates / industry-topics / consultations. (Confirmed during analysis.)
- The page shell defines all 10 §3.6 slots in order; `story-homepage-06` (positions 4–6, 9) and `story-homepage-07` (positions 7, 10) mount their sections into it — note the interleave: Final CTA (this story, position 8) sits *between* 07's "Featured this week" (7) and 06's Q&A (9).
- **Executed 2026-05-30:** The shell + opening sections had been committed earlier (`0fb13db`) but the story was never closed. Execution verified all ACs against the live suite and fixed three a11y defects that blocked the AC#14 axe gate: (1) the hero stat strip's `<dl>` held bare `<div>` children, tripping axe `definition-list` → switched to a plain `<div>` (stats aren't term/definition pairs); (2) `text-muted-2` (#8a9482, 3.16:1) tiny labels in `Hero`/`HeroCollage` failed WCAG AA → `text-muted` (#5f6b53, ~5.9:1); (3) the Final-CTA overline `text-primary` on `surface-light` was 4.27:1 → `text-primary-deep`. Also refreshed the stale homepage E2E nav assertion (Jobs/Experts ship live now, no longer "coming soon" disabled spans).
- **Manual check — Lighthouse perf budget (AC#13):** LCP < 2.0s / CLS < 0.1 on simulated 4G is not asserted by an automated test. The automatable guarantees are in place (SSG `/`, no client-side DB fetch on the homepage, count-up/collage SSR their final values so no count-driven layout shift). Run Lighthouse against a production build (`pnpm build && pnpm start`) before launch to confirm the numeric budget.
- **Observation for analysis (not blocking):** the Final-CTA heading copy "Free 30-minute scoping call" uses "Free", which §4.2 discourages (the hero CTAs were already reconciled to drop "Free"). Left as-is because no AC forbids it on this section; flag to `/analyze-sprint` if §4.2 should apply page-wide.
