-- foodnme — persisted expert inquiries (story-experts-11, TECHNICAL-REQUIREMENTS.md §4.2/§6.2)
-- Until now `/api/expert-inquiry` was email-only; this table records each inquiry so the expert
-- dashboard can show an inbox. Writes go through the turnstile-gated service-role route (same
-- convention as `service_inquiries` — §4.1 "anon writes impossible by policy"); RLS exposes
-- reads to the owning expert + admin, and lets the owning expert flip `is_read`.

create table expert_inquiries (
  id              uuid primary key default gen_random_uuid(),
  expert_id       uuid not null references experts (id) on delete cascade,
  sender_name     text not null,
  sender_email    text not null,
  company_name    text,
  engagement_type text check (engagement_type is null or engagement_type in ('hourly', 'project', 'retainer')),
  message         text not null,
  is_read         boolean not null default false,
  created_at      timestamptz not null default now()
);

create index expert_inquiries_expert_created_idx
  on expert_inquiries (expert_id, created_at desc);

-- ───────────────────────── RLS (§4.1) ─────────────────────────
alter table expert_inquiries enable row level security;

-- Owning expert reads their own inquiries (dashboard inbox). An expert never sees another's.
create policy "expert_inquiries_owner_read"
  on expert_inquiries for select
  to authenticated
  using (expert_id in (select id from experts where user_id = auth.uid()));

-- Admin reads every inquiry.
create policy "expert_inquiries_admin_read"
  on expert_inquiries for select
  to authenticated
  using (public.is_admin(auth.uid()));

-- Owning expert may flip `is_read` on their own rows (mark-read interaction).
create policy "expert_inquiries_owner_update"
  on expert_inquiries for update
  to authenticated
  using (expert_id in (select id from experts where user_id = auth.uid()))
  with check (expert_id in (select id from experts where user_id = auth.uid()));

-- No insert policy: inserts flow through the service-role `/api/expert-inquiry` route only.

-- ───────────────────────── Down (manual reverse) ─────────────────────────
--   drop table if exists expert_inquiries;
