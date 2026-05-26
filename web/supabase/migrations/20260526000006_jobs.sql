-- foodnme — jobs board (TECHNICAL-REQUIREMENTS.md §4.1–§4.2, story-jobs-01)
-- Created here (first consumer is the listing); story-jobs-03's create API reuses it. No
-- search_vector — free-text search is ILIKE on title/company_name (+ exact skill contains).
-- Writes go through service-role API routes (POST /api/jobs, PATCH, admin approve); RLS = reads.
create table jobs (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  company_name     text not null,
  location         text not null default '',
  job_type         text not null,
  salary_min       integer,
  salary_max       integer,
  experience_level text not null,
  description      text not null default '',
  skills           text[] not null default '{}',
  status           text not null default 'pending' check (status in ('pending', 'active', 'closed')),
  employer_id      uuid references profiles (id) on delete set null,  -- null for seed jobs
  created_at       timestamptz not null default now(),
  expires_at       timestamptz
);

create index jobs_employer_idx on jobs (employer_id);
create index jobs_status_created_idx on jobs (status, created_at desc);

alter table jobs enable row level security;

create policy "jobs_public_read_active"
  on jobs for select to anon, authenticated using (status = 'active');
create policy "jobs_self_read"
  on jobs for select to authenticated using (employer_id = auth.uid());
create policy "jobs_admin_read"
  on jobs for select to authenticated using (public.is_admin(auth.uid()));

-- Down: drop table if exists jobs;
