-- foodnme — avatars storage bucket (TECHNICAL-REQUIREMENTS.md §7.5, §9.2; story-experts-05)
-- Public-read (so <img> loads the headshot). Writes happen only through POST /api/upload on the
-- service role after an in-route auth + magic-byte check — anon/authenticated writes are
-- impossible (no storage.objects write policy for this bucket), and the route pins the object
-- path to the requester's `{user_id}/` namespace.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Down: delete from storage.buckets where id = 'avatars';
