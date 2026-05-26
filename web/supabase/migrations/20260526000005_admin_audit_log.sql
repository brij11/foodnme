-- foodnme — admin audit log (TECHNICAL-REQUIREMENTS.md §4.1–§4.2)
-- Shared by every admin mutation (expert approve story-experts-07; job approve story-jobs-08).
-- Created here as the first consumer (experts-07 runs before jobs-08 in dependency order);
-- jobs-08 reuses this table. Append-only: rows are inserted by the service role inside admin API
-- routes; there are no update/delete paths.
create table admin_audit_log (
  id           uuid primary key default gen_random_uuid(),
  actor_id     uuid references profiles (id) on delete set null,
  action       text not null,
  target_table text not null,
  target_id    uuid,
  before       jsonb,
  after        jsonb,
  created_at   timestamptz not null default now()
);

create index admin_audit_log_actor_idx on admin_audit_log (actor_id, created_at desc);

alter table admin_audit_log enable row level security;

-- Admins may read the log; inserts happen via the service role (RLS bypassed). No update/delete.
create policy "admin_audit_log_admin_read"
  on admin_audit_log for select
  to authenticated
  using (public.is_admin(auth.uid()));

-- Down: drop table if exists admin_audit_log;
