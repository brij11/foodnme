-- foodnme — atomic template download counter (templates-03, TECHNICAL-REQUIREMENTS.md §6.2).
-- The /api/download route increments the counter inside a single UPDATE ... RETURNING so
-- concurrent downloads can't lose increments. Returns the object key so the route can sign it;
-- an empty result means the template id does not exist (→ 404).

create or replace function increment_template_download(p_template_id uuid)
returns table (file_url text)
language sql
as $$
  update resources
     set download_count = download_count + 1
   where id = p_template_id
  returning file_url;
$$;

-- Only the service role (the API route) may run this — anon/authenticated must never write
-- counters directly (§9: all writes go through service-role API routes).
revoke all on function increment_template_download(uuid) from public;
grant execute on function increment_template_download(uuid) to service_role;
