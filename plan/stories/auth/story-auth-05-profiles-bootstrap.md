---
id: story-auth-05
topic: auth
sprint: 2
story_points: 3
status: draft
owner: brij
tasks_populated: false
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
- [ ] `supabase/migrations/<ts>_profiles.sql` creates the table per `TECHNICAL-REQUIREMENTS.md` §4.2
- [ ] Trigger `on_auth_user_created` after-insert on `auth.users` inserts into `profiles` with `id`, `email`, `full_name`, `role`
- [ ] RLS enabled with policies: self-read full row, self-update non-`is_admin` fields, admin-read everything, public-read of name+avatar subset (for `experts`/`jobs` joins)
- [ ] `is_admin = true` seeded for founder email via seed script (idempotent)
- [ ] Generated TypeScript types regenerated via `supabase gen types`
- [ ] Migration is reversible (down-migration drops trigger + table)
- [ ] Smoke test: signing up via `story-auth-02` results in matching `profiles` row within 1 second

## Tasks
<!-- Populated by the downstream task-breakdown step, not by this skill.
     Each task should map to one or more acceptance criteria above and be
     small enough to land in a single commit. Until populated, this section
     stays as the single TODO line below. -->
- [ ] TODO — break this story into implementation tasks

## Notes
- Schema per `TECHNICAL-REQUIREMENTS.md` §4.2.
- RLS policy intent per §4.1; "public-fields subset" specifically: `full_name`, `avatar_url` (callers must use the safe view for joins, not `select *`).
- Founder onboarding for a second admin is open question Appendix OQ#8 — out of scope here.
