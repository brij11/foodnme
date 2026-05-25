-- foodnme — Sprint 1 schema (TECHNICAL-REQUIREMENTS.md §4.1–§4.2)
-- Tables: resources, articles, newsletter_subscribers, service_inquiries.
-- RLS is ON for every table (§1 hard invariant). Anon/authenticated may only READ public
-- content; ALL writes go through service-role API routes (anon writes impossible by policy).

create extension if not exists pgcrypto;

-- ───────────────────────── resources (templates) ─────────────────────────
-- Created before `articles` because articles.related_resource_slug FKs resources(slug).
create table resources (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  slug            text not null unique,
  description     text not null default '',
  category        text not null,
  file_url        text,
  file_type       text not null default 'pdf',         -- 'pdf' | 'docx'
  is_free         boolean not null default true,
  download_count  integer not null default 0,
  created_at      timestamptz not null default now(),
  search_vector   tsvector generated always as (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
  ) stored
);

-- ───────────────────────── articles ─────────────────────────
create table articles (
  id                    uuid primary key default gen_random_uuid(),
  title                 text not null,
  slug                  text not null unique,
  excerpt               text not null default '',
  content_mdx           text not null default '',
  category              text not null,
  tags                  text[] not null default '{}',
  cover_image_url       text,
  author_name           text not null default 'foodnme',
  read_time_mins        integer not null default 5,
  is_published          boolean not null default false,
  published_at          timestamptz,
  related_resource_slug text references resources(slug) on delete set null,
  created_at            timestamptz not null default now(),
  search_vector         tsvector generated always as (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(excerpt, ''))
  ) stored
);

-- ───────────────────────── newsletter_subscribers ─────────────────────────
create table newsletter_subscribers (
  id             uuid primary key default gen_random_uuid(),
  email          text not null unique,
  source         text not null default 'unknown',
  subscribed_at  timestamptz not null default now(),
  is_active      boolean not null default true
);

-- ───────────────────────── service_inquiries ─────────────────────────
create table service_inquiries (
  id            uuid primary key default gen_random_uuid(),
  full_name     text not null,
  email         text not null,
  company_name  text not null,
  service_needed text not null,
  message       text not null,
  source        text not null default 'services_page',
  submitted_at  timestamptz not null default now(),
  is_read       boolean not null default false
);

-- ───────────────────────── Indexes (§4.2) ─────────────────────────
create index articles_category_published_idx
  on articles (category, is_published, published_at desc);
create index articles_slug_idx on articles (slug);
create index articles_search_idx on articles using gin (search_vector);
create index resources_search_idx on resources using gin (search_vector);
create index resources_category_idx on resources (category);

-- ───────────────────────── Row Level Security (§4.1) ─────────────────────────
alter table resources enable row level security;
alter table articles enable row level security;
alter table newsletter_subscribers enable row level security;
alter table service_inquiries enable row level security;

-- Public READ of published articles (anon + authenticated). No write policies → writes only
-- via the service role (admin/API routes), which bypasses RLS.
create policy "articles_public_read_published"
  on articles for select
  to anon, authenticated
  using (is_published = true);

-- Templates are publicly browsable.
create policy "resources_public_read"
  on resources for select
  to anon, authenticated
  using (true);

-- newsletter_subscribers & service_inquiries: no anon/authenticated policies at all.
-- RLS-on + zero policies = deny by default; only the service-role client can read/write them.

-- ───────────────────────── Storage: templates bucket (§7.5, download signed URLs) ─────
insert into storage.buckets (id, name, public)
values ('templates', 'templates', false)
on conflict (id) do nothing;
