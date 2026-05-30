-- foodnme — denormalized applicant count on jobs (story-jobs-10, §4.2)
-- The job card shows an applicant count; rather than an N+1 aggregate per card, store the count
-- on `jobs` and keep it in sync with a trigger on `applications` insert/delete.

alter table jobs add column applicant_count integer not null default 0;

-- Backfill from any existing applications.
update jobs j
   set applicant_count = (select count(*) from applications a where a.job_id = j.id);

-- Trigger fn: maintain jobs.applicant_count. SECURITY DEFINER so it can update jobs regardless
-- of the caller's RLS context (applications writes flow through the service-role API).
create or replace function public.sync_job_applicant_count()
  returns trigger
  language plpgsql
  security definer
  set search_path = ''
as $$
begin
  if (tg_op = 'INSERT') then
    update public.jobs set applicant_count = applicant_count + 1 where id = new.job_id;
  elsif (tg_op = 'DELETE') then
    update public.jobs set applicant_count = greatest(applicant_count - 1, 0) where id = old.job_id;
  end if;
  return null;
end;
$$;

create trigger applications_count_trg
  after insert or delete on applications
  for each row execute function public.sync_job_applicant_count();

-- ───────────────────────── Down (manual reverse) ─────────────────────────
--   drop trigger if exists applications_count_trg on applications;
--   drop function if exists public.sync_job_applicant_count();
--   alter table jobs drop column applicant_count;
