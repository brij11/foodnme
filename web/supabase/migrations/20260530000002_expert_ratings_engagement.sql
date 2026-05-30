-- foodnme — expert ratings, reviews & engagement types (OQ#10, story-experts-08)
-- Stored DIRECTLY on `experts` — there is no reviews table. `rating` is one-decimal 0.0–5.0,
-- `review_count` a stored integer, `response_time` free text ("< 24 hours"), and
-- `engagement_types` a jsonb array of {kind,title,desc,price} (kind ∈ hourly|project|retainer).
-- RLS unchanged: the new columns ride the existing `experts_public_read_active` select policy.

alter table experts
  add column rating           numeric(2, 1) check (rating is null or (rating >= 0 and rating <= 5)),
  add column review_count     integer not null default 0,
  add column response_time    text,
  add column engagement_types jsonb not null default '[]'::jsonb;

-- A CHECK cannot contain a subquery, so shape-validation lives in an IMMUTABLE function:
-- every array element must carry string `title`/`desc`/`price` and a `kind` in the allowed set.
create or replace function public.valid_engagement_types(p jsonb)
  returns boolean
  language sql
  immutable
  set search_path = ''
as $$
  select p is null or (
    jsonb_typeof(p) = 'array'
    and not exists (
      select 1
        from jsonb_array_elements(p) as e
       where not (
         e ? 'kind' and e ? 'title' and e ? 'desc' and e ? 'price'
         and e->>'kind' in ('hourly', 'project', 'retainer')
         and jsonb_typeof(e->'title') = 'string'
         and jsonb_typeof(e->'desc')  = 'string'
         and jsonb_typeof(e->'price') = 'string'
       )
    )
  );
$$;

alter table experts
  add constraint experts_engagement_types_valid check (public.valid_engagement_types(engagement_types));

-- ───────────────────────── Down (manual reverse) ─────────────────────────
--   alter table experts drop constraint experts_engagement_types_valid;
--   drop function if exists public.valid_engagement_types(jsonb);
--   alter table experts drop column rating, drop column review_count,
--     drop column response_time, drop column engagement_types;
