-- foodnme — add 'interview' to applications.status CHECK constraint (story-jobs-16 C6)
-- DEVIATIONS C6: the design contract (handoff §3.8) includes four seeker status pills:
-- submitted / reviewed / interview / rejected.  The original migration only captured three.
-- This restores the documented 'interview' status value.
--
-- Postgres does not allow ALTER CONSTRAINT on a CHECK, so we drop and recreate.

alter table applications
  drop constraint if exists applications_status_check;

alter table applications
  add constraint applications_status_check
    check (status in ('submitted', 'reviewed', 'interview', 'rejected'));

-- ───────────────────────── Down (manual reverse) ─────────────────────────
--   alter table applications drop constraint if exists applications_status_check;
--   alter table applications add constraint applications_status_check
--     check (status in ('submitted', 'reviewed', 'rejected'));
