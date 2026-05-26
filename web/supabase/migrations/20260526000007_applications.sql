-- foodnme — job applications (TECHNICAL-REQUIREMENTS.md §4.1–§4.2)
-- Created here (employer dashboard needs the applicant count, story-jobs-04); the applications
-- API (story-jobs-06) reuses it. One application per (job_id, applicant_id). Writes go through
-- the service-role API route; RLS exposes reads to the applicant, the job's employer, and admins.
create table applications (
  id            uuid primary key default gen_random_uuid(),
  job_id        uuid not null references jobs (id) on delete cascade,
  applicant_id  uuid not null references profiles (id) on delete cascade,
  resume_url    text,
  cover_note    text not null default '',
  status        text not null default 'submitted' check (status in ('submitted', 'reviewed', 'rejected')),
  applied_at    timestamptz not null default now(),
  unique (job_id, applicant_id)
);

create index applications_applicant_idx on applications (applicant_id, applied_at desc);
create index applications_job_idx on applications (job_id);

alter table applications enable row level security;

-- Applicant reads their own; the job's employer reads applications to their jobs; admins read all.
create policy "applications_self_read"
  on applications for select to authenticated using (applicant_id = auth.uid());
create policy "applications_employer_read"
  on applications for select to authenticated
  using (exists (select 1 from jobs where jobs.id = applications.job_id and jobs.employer_id = auth.uid()));
create policy "applications_admin_read"
  on applications for select to authenticated using (public.is_admin(auth.uid()));

-- Down: drop table if exists applications;
