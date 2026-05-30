-- foodnme — editorial-feature flag on articles (story-homepage-06, §4.2)
-- The homepage "From the Knowledge Hub" section (§3.6 #4) highlights ONE flagged article as
-- the editorial feature, distinct from the auto latest-4 rail (story-homepage-04). Add an
-- admin-curated `is_featured` flag; selection is `is_featured AND is_published ORDER BY
-- published_at desc LIMIT 1`, falling back to most-recent published when nothing is flagged.
-- RLS unchanged — the existing public-read-published policy already exposes the column.

alter table articles
  add column is_featured boolean not null default false;

-- Supports the feature query: flagged + published, newest first.
create index articles_featured_idx
  on articles (is_featured, is_published, published_at desc);

-- ───────────────────────── Down (manual reverse) ─────────────────────────
--   drop index articles_featured_idx;
--   alter table articles drop column is_featured;
