-- foodnme — profiles + post-signup bootstrap (TECHNICAL-REQUIREMENTS.md §4.1–§4.2, story-auth-05)
-- One profiles row per auth.users, spawned by an after-insert trigger. profiles.role is the
-- source of truth for roles (§5.2); is_admin is a DB-only flag seeded for the founder.

-- ───────────────────────── profiles ─────────────────────────
create table profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text not null default '',
  role        text not null check (role in ('seeker', 'employer', 'expert')),
  is_admin    boolean not null default false,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- ───────────────────────── role lookup (recursion-safe) ─────────────────────────
-- A SECURITY DEFINER admin check. RLS policies on `profiles` must NOT self-query `profiles`
-- directly (infinite recursion); this definer function reads it with RLS bypassed.
create or replace function public.is_admin(uid uuid)
  returns boolean
  language sql
  security definer
  set search_path = ''
  stable
as $$
  select coalesce((select is_admin from public.profiles where id = uid), false);
$$;

-- ───────────────────────── post-signup bootstrap trigger ─────────────────────────
create or replace function public.handle_new_user()
  returns trigger
  language plpgsql
  security definer
  set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    -- Guard the CHECK: an unknown/missing role would abort the auth.users insert, so default it.
    case
      when new.raw_user_meta_data ->> 'role' in ('seeker', 'employer', 'expert')
        then new.raw_user_meta_data ->> 'role'
      else 'seeker'
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────────────────────── privilege guard ─────────────────────────
-- Self-update is allowed (RLS below) but non-admins must not escalate is_admin or rewrite
-- their role/email. This BEFORE trigger silently pins those columns for non-admins.
create or replace function public.protect_profile_privileges()
  returns trigger
  language plpgsql
  security definer
  set search_path = ''
as $$
begin
  if not public.is_admin(auth.uid()) then
    new.is_admin := old.is_admin;
    new.role := old.role;
    new.email := old.email;
  end if;
  return new;
end;
$$;

create trigger protect_profile_privileges
  before update on profiles
  for each row execute function public.protect_profile_privileges();

-- ───────────────────────── RLS (§4.1) ─────────────────────────
alter table profiles enable row level security;

-- Self can read their own full row.
create policy "profiles_self_read"
  on profiles for select
  to authenticated
  using (auth.uid() = id);

-- Admins can read every row.
create policy "profiles_admin_read"
  on profiles for select
  to authenticated
  using (public.is_admin(auth.uid()));

-- Self can update their own row (privilege columns pinned by the trigger above).
create policy "profiles_self_update"
  on profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No insert/delete policies: rows are created by the (service-role/definer) trigger and removed
-- by the auth.users cascade only.

-- ───────────────────────── public_profiles view (§4.2) ─────────────────────────
-- The safe join surface: id + full_name + avatar_url only. A definer view (default), so any
-- experts/jobs public lookup can resolve a display name + avatar without exposing email or
-- is_admin and without granting broad read on the underlying RLS-protected table.
create view public_profiles as
  select id, full_name, avatar_url from profiles;

grant select on public_profiles to anon, authenticated;

-- ───────────────────────── Down (manual reverse) ─────────────────────────
-- Supabase migrations are forward-only; to reverse this migration run:
--   drop view if exists public_profiles;
--   drop trigger if exists on_auth_user_created on auth.users;
--   drop trigger if exists protect_profile_privileges on profiles;
--   drop function if exists public.handle_new_user();
--   drop function if exists public.protect_profile_privileges();
--   drop function if exists public.is_admin(uuid);
--   drop table if exists profiles;
