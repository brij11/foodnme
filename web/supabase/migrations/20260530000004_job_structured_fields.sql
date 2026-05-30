-- foodnme — structured job fields + featured flag (OQ#11, story-jobs-09, §4.2)
-- The single `description` text can't back the designed "What you'll do" / "Who we're looking for"
-- sections or a featured badge. Add array columns + is_featured; `description` is kept for
-- back-compat (existing post-job flow still works). RLS unchanged.

alter table jobs
  add column responsibilities text[] not null default '{}',
  add column requirements     text[] not null default '{}',
  add column is_featured       boolean not null default false;

-- ───────────────────────── Down (manual reverse) ─────────────────────────
--   alter table jobs drop column responsibilities, drop column requirements, drop column is_featured;
