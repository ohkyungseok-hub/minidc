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

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  author_id uuid not null references public.users(id) on delete cascade,
  title varchar(200) not null,
  content text not null,
  is_notice boolean not null default false,
  is_anonymous boolean not null default false,
  up_count integer not null default 0,
  down_count integer not null default 0,
  view_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts
  add column if not exists is_notice boolean not null default false;

alter table public.posts
  add column if not exists is_anonymous boolean not null default false;

alter table public.posts
  add column if not exists up_count integer not null default 0;

alter table public.posts
  add column if not exists down_count integer not null default 0;

alter table public.posts
  add column if not exists view_count integer not null default 0;

alter table public.posts
  add column if not exists updated_at timestamptz not null default now();

alter table public.posts enable row level security;

drop policy if exists "Public can read posts" on public.posts;
create policy "Public can read posts"
on public.posts
for select
using (true);

drop policy if exists "Authenticated users can insert own posts" on public.posts;
create policy "Authenticated users can insert own posts"
on public.posts
for insert
to authenticated
with check (
  (select auth.uid()) = author_id
  and (
    is_notice = false
    or public.is_admin((select auth.uid()))
  )
);

drop policy if exists "Users can update own posts" on public.posts;
create policy "Users can update own posts"
on public.posts
for update
to authenticated
using ((select auth.uid()) = author_id)
with check (
  (select auth.uid()) = author_id
  and (
    is_notice = false
    or public.is_admin((select auth.uid()))
  )
);

drop policy if exists "Users can delete own posts" on public.posts;
create policy "Users can delete own posts"
on public.posts
for delete
to authenticated
using ((select auth.uid()) = author_id);

create index if not exists posts_board_id_created_at_idx
on public.posts (board_id, created_at desc);

create index if not exists posts_author_id_idx
on public.posts (author_id);

drop trigger if exists trg_posts_updated_at on public.posts;
create trigger trg_posts_updated_at
before update on public.posts
for each row execute function public.set_updated_at();
