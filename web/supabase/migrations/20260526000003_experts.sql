-- foodnme — experts directory (TECHNICAL-REQUIREMENTS.md §4.1–§4.2, story-experts-01)
-- `title` + `hourly_rate` added to the §4.2 schema during analysis (rendered on card + detail).
-- Writes go through service-role API routes with in-route owner/admin checks (Sprint-1 convention,
-- §4.1 "anon writes impossible"); RLS exposes reads only.

-- Generated columns require an IMMUTABLE expression, but `array_to_string`/`array_out` are
-- declared STABLE. This wrapper is genuinely immutable for text[] (its output never depends on
-- a GUC) and lets the FTS document include specializations.
create or replace function public.experts_search_doc(
  p_full_name text, p_title text, p_specializations text[]
)
  returns tsvector
  language sql
  immutable
  set search_path = ''
as $$
  select to_tsvector(
    'english',
    coalesce(p_full_name, '') || ' ' || coalesce(p_title, '') || ' ' ||
    coalesce(array_to_string(p_specializations, ' '), '')
  );
$$;

create table experts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references profiles (id) on delete set null,  -- null for seed experts
  full_name       text not null,
  title           text not null default '',
  avatar_url      text,
  specializations text[] not null default '{}',
  bio             text not null default '',
  experience_years integer not null default 0,
  hourly_rate     integer,                                            -- ₹/hour, rendered client-side
  certifications  text[] not null default '{}',
  location        text not null default '',
  contact_email   text not null,                                      -- server-only; never sent to client
  is_available    boolean not null default true,
  status          text not null default 'pending' check (status in ('pending', 'active', 'rejected')),
  is_featured     boolean not null default false,
  created_at      timestamptz not null default now(),
  search_vector   tsvector generated always as (
    public.experts_search_doc(full_name, title, specializations)
  ) stored
);

create index experts_status_featured_idx on experts (status, is_featured, created_at desc);
create index experts_user_id_idx on experts (user_id);
create index experts_search_idx on experts using gin (search_vector);

-- ───────────────────────── RLS (§4.1) ─────────────────────────
alter table experts enable row level security;

-- Public: only active experts are browsable (listing + detail).
create policy "experts_public_read_active"
  on experts for select
  to anon, authenticated
  using (status = 'active');

-- Self: an expert can read their own row in any status (dashboard).
create policy "experts_self_read"
  on experts for select
  to authenticated
  using (user_id = auth.uid());

-- Admin: read every row.
create policy "experts_admin_read"
  on experts for select
  to authenticated
  using (public.is_admin(auth.uid()));

-- No write policies: inserts/updates flow through service-role API routes
-- (POST /api/experts, PATCH /api/experts/:id[/availability], admin approve) which enforce
-- ownership/admin in-route. Anon/authenticated writes are impossible by policy.

-- ───────────────────────── Down (manual reverse) ─────────────────────────
--   drop table if exists experts;
