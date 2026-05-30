-- foodnme — article authorship via experts (OQ#9, story-blog-06)
-- Replaces the free-text `articles.author_name` with `articles.expert_id → experts(id)`.
-- Adds `linkedin_url`/`twitter_url` to `experts` so the author chip + bio card and the expert
-- profile can render social links (UI-DESIGN-HANDOFF.md §3.7, TECHNICAL-REQUIREMENTS.md §4.2).
-- No new RLS: the author display reads the already-public `experts (status='active')` row.

-- ───────────────────────── 1. expert social columns ─────────────────────────
alter table experts
  add column linkedin_url text,
  add column twitter_url  text;

-- ───────────────────────── 2. articles.expert_id (nullable for backfill) ─────────────────────────
alter table articles
  add column expert_id uuid references experts (id);

-- ───────────────────────── 3. backfill — no article left orphaned ─────────────────────────
-- (a) Match the old free-text author to an existing expert, tolerating a leading honorific
--     ("Dr. Aarti Menon" matches the article author "Aarti Menon", and vice-versa).
update articles a
   set expert_id = e.id
  from experts e
 where a.expert_id is null
   and (
        e.full_name = a.author_name
     or regexp_replace(e.full_name, '^(Dr\.?|Prof\.?|Mr\.?|Ms\.?|Mrs\.?)\s+', '') = a.author_name
     or e.full_name = regexp_replace(a.author_name, '^(Dr\.?|Prof\.?|Mr\.?|Ms\.?|Mrs\.?)\s+', '')
   );

-- (b) Any author with no matching expert becomes a new active expert, then its articles link to it.
with unmatched as (
  select distinct author_name
    from articles
   where expert_id is null
), created as (
  insert into experts (full_name, title, contact_email, status)
  select author_name,
         '',
         lower(regexp_replace(author_name, '[^a-zA-Z0-9]+', '.', 'g')) || '@authors.foodnme.test',
         'active'
    from unmatched
  returning id, full_name
)
update articles a
   set expert_id = c.id
  from created c
 where a.expert_id is null
   and a.author_name = c.full_name;

-- ───────────────────────── 4. lock it down + drop the old column ─────────────────────────
alter table articles alter column expert_id set not null;
alter table articles drop column author_name;

-- ───────────────────────── 5. index (§4.2) ─────────────────────────
create index articles_expert_id_idx on articles (expert_id);

-- ───────────────────────── Down (manual reverse) ─────────────────────────
--   alter table articles add column author_name text not null default 'foodnme';
--   update articles a set author_name = e.full_name from experts e where e.id = a.expert_id;
--   drop index if exists articles_expert_id_idx;
--   alter table articles drop column expert_id;
--   alter table experts drop column linkedin_url, drop column twitter_url;
