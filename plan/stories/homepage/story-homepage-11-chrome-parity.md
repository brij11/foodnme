---
id: story-homepage-11
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
- [ ] Footer Contact column includes a "Newsletter" link/anchor alongside email + LinkedIn (DEVIATIONS B3; `web/components/chrome/Footer.tsx:66-74` vs `design/ui.jsx:201-206`)
- [ ] Footer Explore column includes Jobs + Experts now that both surfaces are live (DEVIATIONS D1; `web/components/chrome/Footer.tsx:8-13`)
- [ ] AccountMenu includes a role-routed "Settings" menu item with the settings icon, between Dashboard and Sign out (DEVIATIONS B4; `web/components/chrome/AccountMenu.tsx:80-99` vs `design/ui.jsx:634-637`)
- [ ] Ghost `Button` variant uses the prototype's trailing arrow that grows on hover (no static underline) (DEVIATIONS B5; `web/components/ui/Button.tsx:25` vs `design/styles.css:230-241`)
- [ ] Green-only-on-actions rule still honored (logo, stat numbers, overlines stay dark)

## Tasks
- [completed] Add a "Newsletter" link to the Footer Contact column (AC 1)
- [completed] Add Jobs + Experts to the Footer Explore column (AC 2)
- [completed] Add a role-routed "Settings" item to AccountMenu (→ /dashboard/<role>) with the settings icon (AC 3)
- [completed] Restore the ghost `Button` arrow-grow-on-hover affordance and remove the static underline (AC 4)
- [started] Verify green-only-on-actions still holds and update affected chrome/Button tests (AC 5)

## Notes
- exec_model: sonnet — chrome/primitive tweaks composing existing components; no schema/security.
- Decision (analysis): the AccountMenu "Settings" item routes to `/dashboard/<role>` — there is no dedicated settings surface yet, so this restores the prototype affordance without inventing a new screen.
- Source: `plan/DEVIATIONS.md` B3, B4, B5, D1.
- Design ref: `plan/design/ui.jsx` (Footer, AccountMenu) + `plan/design/styles.css:230-241` (`.btn-ghost`).
- If "Settings" was intentionally cut (no settings surface exists yet), the AC can be resolved by routing it to `/dashboard/<role>` or documenting the cut in the handoff instead.
