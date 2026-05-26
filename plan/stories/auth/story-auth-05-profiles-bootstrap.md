---
id: story-auth-05
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
  - story-auth-02
design: none-needed
---

# story-auth-05 — profiles table migration + post-signup profile bootstrap trigger

## User story
As the application, I want every new `auth.users` row to spawn a corresponding `profiles` row populated with the user's role and full name, so that role lookups don't have to crack open `user_metadata` on every request.

## Description
Author the `profiles` table migration per `TECHNICAL-REQUIREMENTS.md` §4.2. Add a Postgres trigger on `auth.users` insert that inserts a matching `profiles` row using `NEW.id`, `NEW.email`, and `NEW.raw_user_meta_data->>'role'` / `'full_name'`. RLS policies per §4.1. `is_admin` defaults `false`; founder's row is set to `true` via a one-off seed.

## Acceptance criteria
- [x] `supabase/migrations/<ts>_profiles.sql` creates the table per `TECHNICAL-REQUIREMENTS.md` §4.2 — `20260526000002_profiles.sql`; table verified present
- [x] Trigger `on_auth_user_created` after-insert on `auth.users` inserts into `profiles` with `id`, `email`, `full_name`, `role` — `profiles-bootstrap.spec.ts` "signup spawns a matching profiles row"
- [x] RLS enabled with policies: self-read full row, self-update non-`is_admin` fields, admin-read everything — policies + `protect_profile_privileges` guard; verified by `profiles-bootstrap.spec.ts` (anon locked out; self-update edits name but cannot escalate is_admin/role). Admin-read uses a SECURITY DEFINER `is_admin()` to avoid RLS self-recursion
- [x] `public_profiles` view created (id, full_name, avatar_url) with `select` granted to `anon` + `authenticated` per `TECHNICAL-REQUIREMENTS.md` §4.2 — the safe-join surface for `experts`/`jobs` public name+avatar lookups — `profiles-bootstrap.spec.ts` "public_profiles exposes id+full_name to anon"
- [x] `is_admin = true` seeded for founder email via seed script (idempotent) — `seed.sql` idempotent `update … where email='founder@foodnme.test'` (runs clean on db:reset; no-op until the founder registers). Test-time admins are provisioned via `e2e/utils/supabase.ts setAdmin()`
- [x] Generated TypeScript types regenerated via `supabase gen types` — `pnpm db:types`; `types/database.ts` now carries `profiles` + `public_profiles`
- [x] Migration is reversible (down-migration drops trigger + table) — documented reverse block at the foot of the migration (Supabase migrations are forward-only)
- [x] Smoke test: signing up via `story-auth-02` results in matching `profiles` row within 1 second — `profiles-bootstrap.spec.ts` polls within a 1s budget

## Tasks
- [completed] Write `supabase/migrations/<ts>_profiles.sql` creating the `profiles` table per §4.2 (id PK → auth.users, email, full_name, role CHECK, is_admin default false, avatar_url, created_at)
- [completed] Add `handle_new_user()` SECURITY DEFINER function + `on_auth_user_created` after-insert trigger on `auth.users` inserting id, email, `raw_user_meta_data->>'full_name'`, `->>'role'`
- [completed] Enable RLS + policies: self-read full row, self-update (excluding `is_admin`), admin-read-all
- [completed] Create the `public_profiles` view (id, full_name, avatar_url) + `select` grant to anon/authenticated per §4.2
- [completed] Idempotent seed setting `is_admin = true` for the founder email
- [completed] Reversible down-migration dropping trigger, function, view, and table; regenerate `types/database.ts` via `supabase gen types`
- [completed] Smoke test: a `story-auth-02` signup produces a matching `profiles` row within 1s

## Notes
- Schema per `TECHNICAL-REQUIREMENTS.md` §4.2.
- RLS policy intent per §4.1; "public-fields subset" specifically: `full_name`, `avatar_url` (callers must use the safe view for joins, not `select *`).
- Founder onboarding for a second admin is open question Appendix OQ#8 — out of scope here.
- _Executed 2026-05-26: migration `20260526000002_profiles.sql`. Two important robustness choices beyond the spec: (1) the admin-read RLS policy calls a SECURITY DEFINER `is_admin(uuid)` rather than self-querying `profiles` (a direct self-query would recurse infinitely under RLS); (2) a `protect_profile_privileges` BEFORE-UPDATE trigger pins `is_admin`/`role`/`email` for non-admins so the broad self-update policy can't be used to escalate. `handle_new_user` defaults an unknown/missing role to `seeker` so a bad metadata value can never abort the auth.users insert via the CHECK. `public_profiles` is a (default-definer) view exposing only id/full_name/avatar_url. Types regenerated via `pnpm db:types`. Verified by 3 live smoke tests (`profiles-bootstrap.spec.ts`). Added `anonClient()`/`setAdmin()` to the E2E helper for downstream role/admin flows._
