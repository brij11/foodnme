---
id: story-auth-07
topic: auth
sprint: 2
story_points: 3
status: done
owner: brij
tasks_populated: true
analyzed: true
analyzed_date: 2026-05-26
executed_date: 2026-05-26
dependencies:
  - story-auth-06
design:
  - design/screens-dashboard.jsx
---

# story-auth-07 — Role-based dashboard shell with redirect at /dashboard

## User story
As a signed-in user landing on `/dashboard`, I want to be automatically routed to the dashboard for my role, so that I see the right tools immediately without picking from a menu.

## Description
Build `app/dashboard/page.tsx` (role-based redirect entry point) and the three role-specific shells at `app/dashboard/seeker/page.tsx`, `app/dashboard/employer/page.tsx`, `app/dashboard/expert/page.tsx`. The entry-point page reads `profiles.role` and redirects to the matching shell. Each shell renders the layout from `design/screens-dashboard.jsx` with empty/placeholder content — populated by later stories (`story-jobs-04`, `story-jobs-07`, `story-experts-04`).

## Acceptance criteria
- [x] `/dashboard` reads `profiles.role` and 302s to `/dashboard/seeker` | `/employer` | `/expert` — `dashboard-shell.spec.ts` routes all three roles
- [x] Each shell has a role-specific header, sidebar/tab structure, and an empty-content slot — `DashboardShell` + `DashboardSidebar` + per-role tab configs; verified in `dashboard-shell.spec.ts`
- [x] Empty state on first visit: title + message + relevant CTA (e.g., for employer: "Post your first job") — reuses the three-part `EmptyState`; `dashboard-shell.spec.ts` asserts each role's empty state + the employer "Post a job" CTA
- [x] Sign-out button in the header calls `supabase.auth.signOut()` and redirects to `/` — `dashboard-shell.spec.ts` "sign out … returns to the homepage" (and a gated route then bounces to login)
- [x] Pages are `no-cache` — every dashboard route is `force-dynamic`; build marks them ƒ (Dynamic)
- [x] Middleware (`story-auth-06`) prevents cross-role access — confirmed by integration test — `route-gating.spec.ts` (cross-role seeker→/dashboard/employer → /dashboard/seeker)
- [x] Layout matches `design/screens-dashboard.jsx` — sidebar (user block, role nav tabs, Back to site, Sign out) ported to Tailwind; sub-nav is in-page tab state per the analysis decision

## Tasks
- [completed] `app/dashboard/page.tsx` entry — server-read `profiles.role`, `redirect()` to `/dashboard/seeker` | `/employer` | `/expert`
- [completed] Port the `DashboardSidebar` from `design/screens-dashboard.jsx` to a shared component — user block, role-specific nav items as in-page tabs (client state, not sub-routes), "Back to site", "Sign out"
- [completed] Build `app/dashboard/{seeker,employer,expert}/page.tsx` shells — role header + tab structure + empty-content slot (content filled by story-jobs-04 / story-jobs-07 / story-experts-04); all `no-cache`
- [completed] Per-role first-visit empty state: title + message + relevant CTA (e.g. employer "Post your first job")
- [completed] Sign-out button → `supabase.auth.signOut()` → redirect `/`
- [completed] Integration test: `/dashboard` redirects by role; cross-role access blocked via middleware (story-auth-06)

## Notes
- Role-based UI conventions per `UI-DESIGN-HANDOFF.md` §3.3 and §3.8.
- Dashboard content lives in topic-specific stories — this story only puts up empty shells.
- The prototype's sidebar switches content via client view-state (Overview/Applications/…). Production keeps one route per role (`/dashboard/<role>`, §3) with the sub-nav as **in-page tabs**, not gated sub-routes — mirroring the prototype's own model. Decided during analysis.
- _Executed 2026-05-26: `app/dashboard/page.tsx` is a server role-router; `app/dashboard/{seeker,employer,expert}/page.tsx` read the profile server-side and render role client components. Shared `DashboardShell` owns the in-page tab state and the sign-out; `DashboardSidebar` is the ported rail. Each tab's `render(ctx)` receives `goToTab` so an empty-state CTA can switch tabs (employer "Post a job" → Post tab) — the seam later stories (jobs-04/07, experts-04) fill with real content. Empty states reuse the three-part `EmptyState`. Verified by 4 E2E (`dashboard-shell.spec.ts`) incl. axe on the dashboard + sign-out; cross-role gating covered by `route-gating.spec.ts`._
