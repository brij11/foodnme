---
id: story-homepage-09
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
  - story-auth-07
design:
  - design/ui.jsx
---

# story-homepage-09 — Navbar auth state: Sign-in link + Account menu

## User story
As a returning user, I want the top navigation to show me a Sign-in link when I'm logged out and an account menu when I'm logged in, so that I can reach my dashboard and sign out from anywhere on the site.

## Description
The production `Navbar` (`components/chrome/Navbar.tsx`) currently renders only the "Get a Consultation" CTA — there is no Sign-in link and no account menu, so there is no way to reach `/login` or `/dashboard` from the chrome. Add the auth-aware right-hand region from the prototype `Navbar` (`design/ui.jsx:108`) + `AccountMenu` (`design/ui.jsx:606`): a "Sign in" link when signed out, and a dropdown (avatar initials, name, email, role badge, Dashboard, Sign out) when signed in. Auth state comes from the Supabase session.

## Acceptance criteria
- [ ] When signed out, the navbar shows a "Sign in" link to `/login` alongside the "Get a Consultation" CTA (desktop + mobile menu)
- [ ] When signed in, the "Sign in" link is replaced by an account button showing the user's initials avatar
- [ ] Opening the account button reveals a dropdown with: name, email, role badge, "Dashboard" link (to `/dashboard`), and "Sign out" (danger styling)
- [ ] "Sign out" calls Supabase sign-out and returns the user to the homepage
- [ ] Dropdown dismisses on click-outside and on Escape; is keyboard-navigable with correct ARIA (`aria-expanded`, menu roles)
- [ ] Auth state reflects the current Supabase session without a full page reload after sign-in/sign-out
- [ ] Green used only on actionable elements; no emoji (§1.1)

## Tasks
- [new] Add an auth-aware right region to `Navbar.tsx` (client island reading the Supabase session): "Sign in" link → `/login` when signed out, on desktop and in the mobile menu, alongside the consultation CTA
- [new] When signed in, swap "Sign in" for an account button showing the user's initials avatar
- [new] Build the `AccountMenu` dropdown (port from `design/ui.jsx:606`): name, email, role badge, "Dashboard" → `/dashboard`, "Sign out" (danger styling)
- [new] Wire "Sign out" to Supabase sign-out, returning the user to `/`
- [new] Dropdown dismisses on click-outside and Escape; keyboard-navigable with `aria-expanded` + menu roles
- [new] Reflect session changes after sign-in/sign-out without a full page reload; keep the sticky nav a server shell with the auth region as a client island
- [new] Verify §1.1 (green only on actionable; no emoji); add tests for signed-out vs signed-in render, dropdown a11y, and sign-out

## Notes
- Audit gap G1 (Major): navbar has no auth UI today.
- Design-linkage corrected 2026-05-30: `Navbar`/`AccountMenu` live in `design/ui.jsx` (not `screens-main.jsx`); `design:` updated accordingly.
- Depends on `story-auth-07` (role-based dashboard shell + `/dashboard` redirect) for the Dashboard target.
- Role/identity from `profiles` per §5.2; read the session in a client island so the sticky nav stays a server-rendered shell where possible.
