-- foodnme — generalized saved items (OQ#12, story-jobs-15, §4.1/§4.2)
-- One table backs saved jobs (this story) and saved experts (story-experts-10): item_type
-- distinguishes them. Self-scoped RLS — a user only ever reads/writes their own saved rows.

create table saved_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles (id) on delete cascade,
  item_type  text not null check (item_type in ('job', 'expert')),
  item_id    uuid not null,
  saved_at   timestamptz not null default now(),
  unique (user_id, item_type, item_id)
);

create index saved_items_user_idx on saved_items (user_id, item_type, item_id);

-- ───────────────────────── RLS (§4.1) ─────────────────────────
alter table saved_items enable row level security;

create policy "saved_items_self_read"
  on saved_items for select to authenticated using (user_id = auth.uid());
create policy "saved_items_self_insert"
  on saved_items for insert to authenticated with check (user_id = auth.uid());
create policy "saved_items_self_delete"
  on saved_items for delete to authenticated using (user_id = auth.uid());

-- ───────────────────────── Down (manual reverse) ─────────────────────────
--   drop table if exists saved_items;
