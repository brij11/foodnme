-- foodnme — cross-entity search RPC (story-search-01, §6.2)
-- Ranked Postgres FTS across articles / resources (templates) / experts via the existing
-- search_vector GIN indexes. SECURITY DEFINER so it can rank across tables, but it only ever
-- returns published articles / any template / active experts — never drafts or pending profiles.

create or replace function public.search_all(p_query text, p_type text default 'all')
  returns table (type text, id uuid, title text, excerpt text, url text, rank real)
  language sql
  stable
  security definer
  set search_path = ''
as $$
  with q as (select websearch_to_tsquery('english', p_query) as ts)
  select * from (
    select 'article'::text as type, a.id, a.title, a.excerpt,
           '/blog/' || a.slug as url, ts_rank(a.search_vector, q.ts) as rank
      from public.articles a, q
     where a.is_published = true
       and a.search_vector @@ q.ts
       and (p_type = 'all' or p_type = 'articles')
    union all
    select 'template'::text, r.id, r.title, r.description,
           '/templates/' || r.slug, ts_rank(r.search_vector, q.ts)
      from public.resources r, q
     where r.search_vector @@ q.ts
       and (p_type = 'all' or p_type = 'templates')
    union all
    select 'expert'::text, e.id, e.full_name, e.title,
           '/experts/' || e.id::text, ts_rank(e.search_vector, q.ts)
      from public.experts e, q
     where e.status = 'active'
       and e.search_vector @@ q.ts
       and (p_type = 'all' or p_type = 'experts')
  ) s
  order by s.rank desc, s.title asc
  limit 50;
$$;

grant execute on function public.search_all(text, text) to anon, authenticated;

-- ───────────────────────── Down (manual reverse) ─────────────────────────
--   drop function if exists public.search_all(text, text);
