---
id: story-auth-06
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
  - story-auth-05
design: none-needed
---

# story-auth-06 — Middleware route gating (/admin/*, /dashboard/*, role redirects)

## User story
As a logged-in user, I want the URL to enforce my role and admin status, so that I can never accidentally see a screen I don't have access to.

## Description
Implement `middleware.ts` per `TECHNICAL-REQUIREMENTS.md` §5.4. Uses the middleware Supabase client to read the session, then enforces:
- `/admin/*` → require `profiles.is_admin = true`, else 302 to `/dashboard`
- `/dashboard/*` → require authenticated user, else 302 to `/login?redirect=<original>`
- `/dashboard/seeker/*` → require `role = 'seeker'`, else 302 to user's own dashboard
- `/dashboard/employer/*` → require `role = 'employer'`
- `/dashboard/expert/*` → require `role = 'expert'`
- All other paths: no auth check.

## Acceptance criteria
- [x] Middleware reads session via `@supabase/ssr` middleware client — `updateSession` (lib/supabase/middleware.ts)
- [x] Unauthed `/dashboard/*` request → 302 `/login?redirect=<encoded path>` — `route-gating.spec.ts` "unauthed /dashboard"
- [x] Non-admin `/admin/*` request → 302 `/dashboard` — `route-gating.spec.ts` "non-admin seeker on /admin"
- [x] Cross-role `/dashboard/employer/*` access by a seeker → 302 `/dashboard/seeker` — `route-gating.spec.ts` "seeker on /dashboard/employer"
- [x] Session cookie refreshed if the access token is near expiry (refresh-token rotation per §5.3) — `updateSession` calls `getUser()` which rotates/syncs cookies on each gated-route visit
- [x] Role read from JWT `user_metadata.role` (cheap projection) — falls back to `profiles.role` query if missing — implemented; admin check additionally queries `profiles.is_admin` (not in the JWT)
- [x] Public paths (e.g. `/`, `/blog`, `/templates`) pass through with no Supabase round-trip — achieved by scoping the middleware `matcher` to `/dashboard/:path*` and `/admin/:path*` only (token refresh therefore happens on gated-route visits, satisfying the refresh requirement above) — `matcher` narrowed; listing CDN cache headers already live in `next.config.mjs` (no regression)
- [x] Integration test asserts each redirect path — `route-gating.spec.ts` (6 cases: unauthed×2, cross-role, own-role pass-through, non-admin /admin, admin pass-through)

## Tasks
- [completed] Add `lib/supabase/middleware.ts` client factory (cookie sync only, no business logic per §5.3)
- [completed] Write `middleware.ts` with `matcher` scoped to `/dashboard/:path*` + `/admin/:path*`; read + refresh session via the `@supabase/ssr` middleware client
- [completed] Enforce auth gate: unauthed `/dashboard/*` → 302 `/login?redirect=<encoded internal path>` reusing the story-auth-01 internal-path allowlist
- [completed] Enforce role/admin gates: non-admin `/admin/*` → `/dashboard`; cross-role `/dashboard/<role>/*` → user's own dashboard; role read from JWT `user_metadata.role` with `profiles.role` query fallback
- [completed] Integration test asserting each redirect: unauthed, non-admin, cross-role, and a valid pass-through

## Notes
- Gating matrix per `TECHNICAL-REQUIREMENTS.md` §5.4.
- Open-redirect prevention applies here too: `redirect=` param sanitized to internal paths only — same allowlist as `story-auth-01`.
- Cookie sync only — no business logic in middleware per `TECHNICAL-REQUIREMENTS.md` §5.3.
- _Executed 2026-05-26: rewrote `middleware.ts` with the matcher scoped to `/dashboard/:path*` + `/admin/:path*` (listing CDN cache already lives in `next.config.mjs`, so narrowing caused no regression). `updateSession` now also returns the cookie-synced client so the gating-only role/admin lookups reuse it (factory stays logic-free). Redirect-back target is sanitized via `safeRedirect`. **Corrected an auth-05 migration defect found here:** the `protect_profile_privileges` trigger pinned `is_admin` for the service-role/seed context too (auth.uid() NULL), which blocked `setAdmin`/the founder seed — now gated on `auth.uid() is not null`. auth-05's smoke tests re-run green. Verified by 6 E2E (`route-gating.spec.ts`) + a robust poll-based `signInViaUI` helper (the post-login hop is a soft client navigation)._
