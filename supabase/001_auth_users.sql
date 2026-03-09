create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname varchar(24) not null unique,
  role text not null default 'user',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_nickname_length_chk check (char_length(nickname) between 2 and 24),
  constraint users_role_chk check (role in ('user', 'admin'))
);

alter table public.users
  add column if not exists role text not null default 'user';

alter table public.users enable row level security;

drop policy if exists "Public can read users" on public.users;
create policy "Public can read users"
on public.users
for select
using (true);

drop policy if exists "Users can update own row" on public.users;
create policy "Users can update own row"
on public.users
for update
using ((select auth.uid()) = id)
with check (
  (select auth.uid()) = id
  and role = (
    select users.role
    from public.users as users
    where users.id = (select auth.uid())
  )
);

create or replace function public.is_admin(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where id = p_user_id
      and role = 'admin'
  );
$$;

grant execute on function public.is_admin(uuid) to authenticated;
grant execute on function public.is_admin(uuid) to anon;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  fallback_nickname text;
begin
  fallback_nickname := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'nickname'), ''),
    'user_' || substr(replace(new.id::text, '-', ''), 1, 10)
  );

  insert into public.users (id, nickname)
  values (new.id, fallback_nickname)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();
