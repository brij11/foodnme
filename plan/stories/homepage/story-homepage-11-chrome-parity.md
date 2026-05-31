---
id: story-homepage-11
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
  - story-homepage-02
  - story-homepage-09
design:
  - design/ui.jsx
---

# story-homepage-11 — Chrome parity: footer + account menu + ghost button

## User story
As a visitor navigating the site chrome, I want the footer, account menu, and ghost buttons to match the design, so that navigation affordances are complete and consistent.

## Description
Three small chrome/primitive deviations from the prototype `ui.jsx`. The footer Contact column dropped the "Newsletter" link and the Explore column omits Jobs/Experts (now live). The account-menu dropped the role-routed "Settings" item. The shared ghost button uses a static underline instead of the prototype's arrow-that-grows-on-hover affordance. Covers DEVIATIONS.md **B3, B4, B5, D1**.

## Acceptance criteria
- [x] Footer Contact column includes a "Newsletter" link/anchor alongside email + LinkedIn (DEVIATIONS B3; `web/components/chrome/Footer.tsx:66-74` vs `design/ui.jsx:201-206`) — covered by `Footer.test.tsx "Contact column includes a Newsletter link"`
- [x] Footer Explore column includes Jobs + Experts now that both surfaces are live (DEVIATIONS D1; `web/components/chrome/Footer.tsx:8-13`) — covered by `Footer.test.tsx "Explore column includes Jobs and Experts links"`
- [x] AccountMenu includes a role-routed "Settings" menu item with the settings icon, between Dashboard and Sign out (DEVIATIONS B4; `web/components/chrome/AccountMenu.tsx:80-99` vs `design/ui.jsx:634-637`) — covered by `AccountMenu.test.tsx` (6 tests for AC#3)
- [x] Ghost `Button` variant uses the prototype's trailing arrow that grows on hover (no static underline) (DEVIATIONS B5; `web/components/ui/Button.tsx:25` vs `plan/design/styles.css:230-241`) — covered by `primitives.test.tsx "renders all three variants"` (asserts `after:content-` present, `underline` absent)
- [x] Green-only-on-actions rule still honored (logo, stat numbers, overlines stay dark) — covered by `Navbar.test.tsx "dark-olive logo"` + `Footer.test.tsx "brand logo uses dark text"` + `Footer.test.tsx "brand dot uses bg-accent"` (UI-DESIGN-HANDOFF §4.1)

## Tasks
- [completed] Add a "Newsletter" link to the Footer Contact column (AC 1)
- [completed] Add Jobs + Experts to the Footer Explore column (AC 2)
- [completed] Add a role-routed "Settings" item to AccountMenu (→ /dashboard/<role>) with the settings icon (AC 3)
- [completed] Restore the ghost `Button` arrow-grow-on-hover affordance and remove the static underline (AC 4)
- [completed] Verify green-only-on-actions still holds and update affected chrome/Button tests (AC 5)

## Notes
- exec_model: sonnet — chrome/primitive tweaks composing existing components; no schema/security.
- Decision (analysis): the AccountMenu "Settings" item routes to `/dashboard/<role>` — there is no dedicated settings surface yet, so this restores the prototype affordance without inventing a new screen.
- Source: `plan/DEVIATIONS.md` B3, B4, B5, D1.
- Design ref: `plan/design/ui.jsx` (Footer, AccountMenu) + `plan/design/styles.css:230-241` (`.btn-ghost`).
- Also fixed a pre-existing sprint-5-checkpoint regression in `web/app/(auth)/login/page.test.tsx` where the mock wrapper dropped the `createClient` argument (broke auth-09 AC#2/#3 assertions).
- AC 5 — Hero pill badge + H1 "safer" em use `text-primary` intentionally (matches prototype `plan/design/screens-main.jsx:325,330`); the rule targets logo text, stat numbers, and section overlines, not editorial emphasis in body copy.
