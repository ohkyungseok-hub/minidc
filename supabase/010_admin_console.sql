create extension if not exists pgcrypto;

alter table public.users
  add column if not exists level integer not null default 1;

alter table public.users
  add column if not exists warning_count integer not null default 0;

alter table public.users
  add column if not exists is_suspended boolean not null default false;

alter table public.users
  add column if not exists suspended_until timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'users_level_nonnegative_chk'
      and conrelid = 'public.users'::regclass
  ) then
    alter table public.users
      add constraint users_level_nonnegative_chk check (level >= 1);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'users_warning_count_nonnegative_chk'
      and conrelid = 'public.users'::regclass
  ) then
    alter table public.users
      add constraint users_warning_count_nonnegative_chk check (warning_count >= 0);
  end if;
end $$;

create index if not exists users_level_idx
on public.users (level);

create index if not exists users_suspended_idx
on public.users (is_suspended, suspended_until);

alter table public.posts
  add column if not exists is_hidden boolean not null default false;

alter table public.posts
  add column if not exists hidden_reason text;

create index if not exists posts_hidden_idx
on public.posts (is_hidden, created_at desc);

alter table public.comments
  add column if not exists is_hidden boolean not null default false;

alter table public.comments
  add column if not exists hidden_reason text;

create index if not exists comments_hidden_idx
on public.comments (is_hidden, created_at desc);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.users(id) on delete cascade,
  target_type text not null check (target_type in ('post', 'comment')),
  post_id uuid references public.posts(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  reason text not null,
  detail text,
  status text not null default 'pending' check (status in ('pending', 'resolved', 'dismissed')),
  reviewed_by uuid references public.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint reports_target_reference_chk check (
    (target_type = 'post' and post_id is not null and comment_id is null)
    or
    (target_type = 'comment' and post_id is null and comment_id is not null)
  )
);

create index if not exists reports_status_created_at_idx
on public.reports (status, created_at desc);

create index if not exists reports_post_id_idx
on public.reports (post_id)
where post_id is not null;

create index if not exists reports_comment_id_idx
on public.reports (comment_id)
where comment_id is not null;

create index if not exists reports_reporter_id_idx
on public.reports (reporter_id, created_at desc);

alter table public.reports enable row level security;

drop policy if exists "Authenticated users can insert own reports" on public.reports;
create policy "Authenticated users can insert own reports"
on public.reports
for insert
to authenticated
with check ((select auth.uid()) = reporter_id);

drop policy if exists "Admins can read reports" on public.reports;
create policy "Admins can read reports"
on public.reports
for select
to authenticated
using (public.is_admin((select auth.uid())));

drop policy if exists "Admins can update reports" on public.reports;
create policy "Admins can update reports"
on public.reports
for update
to authenticated
using (public.is_admin((select auth.uid())))
with check (public.is_admin((select auth.uid())));

drop policy if exists "Admins can delete reports" on public.reports;
create policy "Admins can delete reports"
on public.reports
for delete
to authenticated
using (public.is_admin((select auth.uid())));

drop policy if exists "Admins can manage users" on public.users;
create policy "Admins can manage users"
on public.users
for update
to authenticated
using (public.is_admin((select auth.uid())))
with check (public.is_admin((select auth.uid())));

drop policy if exists "Admins can update posts" on public.posts;
create policy "Admins can update posts"
on public.posts
for update
to authenticated
using (public.is_admin((select auth.uid())))
with check (public.is_admin((select auth.uid())));

drop policy if exists "Admins can delete posts" on public.posts;
create policy "Admins can delete posts"
on public.posts
for delete
to authenticated
using (public.is_admin((select auth.uid())));

drop policy if exists "Admins can update comments" on public.comments;
create policy "Admins can update comments"
on public.comments
for update
to authenticated
using (public.is_admin((select auth.uid())))
with check (public.is_admin((select auth.uid())));

drop policy if exists "Admins can delete comments" on public.comments;
create policy "Admins can delete comments"
on public.comments
for delete
to authenticated
using (public.is_admin((select auth.uid())));

create or replace function public.admin_list_users(p_query text default null)
returns table (
  id uuid,
  nickname varchar,
  email text,
  role text,
  level integer,
  warning_count integer,
  is_suspended boolean,
  suspended_until timestamptz,
  created_at timestamptz
)
language sql
security definer
set search_path = public, auth
as $$
  select
    u.id,
    u.nickname,
    a.email,
    u.role,
    u.level,
    u.warning_count,
    u.is_suspended,
    u.suspended_until,
    u.created_at
  from public.users u
  left join auth.users a on a.id = u.id
  where public.is_admin((select auth.uid()))
    and (
      p_query is null
      or trim(p_query) = ''
      or u.nickname ilike '%' || trim(p_query) || '%'
      or coalesce(a.email, '') ilike '%' || trim(p_query) || '%'
    )
  order by u.created_at desc;
$$;

grant execute on function public.admin_list_users(text) to authenticated;
