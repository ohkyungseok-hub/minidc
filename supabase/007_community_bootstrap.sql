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
  v_base_nickname text;
  v_candidate_nickname text;
begin
  v_base_nickname := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'nickname'), ''),
    'user_' || substr(replace(new.id::text, '-', ''), 1, 10)
  );

  v_candidate_nickname := left(v_base_nickname, 24);

  if v_candidate_nickname = '' then
    v_candidate_nickname := 'user_' || substr(replace(new.id::text, '-', ''), 1, 10);
  end if;

  while exists (
    select 1
    from public.users
    where nickname = v_candidate_nickname
  ) loop
    v_candidate_nickname :=
      left(v_base_nickname, 18) || '_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 5);
  end loop;

  insert into public.users (id, nickname)
  values (new.id, v_candidate_nickname)
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

create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  slug varchar(50) not null unique,
  name varchar(50) not null,
  description text,
  sort_order integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint boards_slug_length_chk check (char_length(slug) between 2 and 50),
  constraint boards_name_length_chk check (char_length(name) between 1 and 50)
);

alter table public.boards enable row level security;

drop policy if exists "Public can read active boards" on public.boards;
create policy "Public can read active boards"
on public.boards
for select
using (is_active = true);

create index if not exists boards_sort_order_idx
on public.boards (sort_order asc, created_at asc);

insert into public.boards (
  slug,
  name,
  description,
  sort_order,
  is_active
)
values
  ('confession', '고해성사', '누구에게도 말 못할 일을 고백해보세요. 조금이나마 마음이 편안해질거예요', 10, true),
  ('comfort', '위로받고 싶어요', '삶이 힘든신가요? 위로받고 싶은 일이 있다면 알려주세요. 저희가 함께 응원해드릴게요.', 20, true),
  ('solutions', '해결책을 제시해주세요', '지피티가 해결하지 못한 삶의 지혜가 필요하신가요? 집단지성으로 당신을 도와드릴게요', 30, true)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

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

create index if not exists posts_notice_created_at_idx
on public.posts (board_id, is_notice, created_at desc);

create index if not exists posts_popular_idx
on public.posts (created_at desc, up_count desc, view_count desc);

drop trigger if exists trg_posts_updated_at on public.posts;
create trigger trg_posts_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.users(id) on delete cascade,
  body text not null,
  is_deleted boolean not null default false,
  upvotes integer not null default 0,
  downvotes integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.comments
  add column if not exists is_deleted boolean not null default false;

alter table public.comments
  add column if not exists upvotes integer not null default 0;

alter table public.comments
  add column if not exists downvotes integer not null default 0;

alter table public.comments
  add column if not exists updated_at timestamptz not null default now();

alter table public.comments enable row level security;

drop policy if exists "Public can read comments" on public.comments;
create policy "Public can read comments"
on public.comments
for select
using (true);

drop policy if exists "Authenticated users can insert own comments" on public.comments;
create policy "Authenticated users can insert own comments"
on public.comments
for insert
to authenticated
with check ((select auth.uid()) = author_id);

drop policy if exists "Users can update own comments" on public.comments;
create policy "Users can update own comments"
on public.comments
for update
to authenticated
using ((select auth.uid()) = author_id)
with check ((select auth.uid()) = author_id);

create index if not exists comments_post_id_created_at_idx
on public.comments (post_id, created_at asc);

create index if not exists comments_author_id_idx
on public.comments (author_id);

drop trigger if exists trg_comments_updated_at on public.comments;
create trigger trg_comments_updated_at
before update on public.comments
for each row execute function public.set_updated_at();

create table if not exists public.post_votes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  vote_value smallint not null check (vote_value in (1, -1)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index if not exists post_votes_user_id_idx
on public.post_votes (user_id);

alter table public.post_votes enable row level security;

drop policy if exists "Users can read own post votes" on public.post_votes;
create policy "Users can read own post votes"
on public.post_votes
for select
to authenticated
using ((select auth.uid()) = user_id);

drop trigger if exists trg_post_votes_updated_at on public.post_votes;
create trigger trg_post_votes_updated_at
before update on public.post_votes
for each row execute function public.set_updated_at();

create or replace function public.handle_post_vote(
  p_post_id uuid,
  p_next_vote smallint
)
returns table (
  up_count integer,
  down_count integer,
  current_vote smallint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_current_vote smallint;
  v_result_vote smallint;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_next_vote not in (1, -1) then
    raise exception 'Invalid vote value';
  end if;

  perform 1
  from public.posts
  where id = p_post_id
  for update;

  if not found then
    raise exception 'Post not found';
  end if;

  select vote_value
  into v_current_vote
  from public.post_votes
  where post_id = p_post_id
    and user_id = v_user_id
  for update;

  if v_current_vote is null then
    insert into public.post_votes (post_id, user_id, vote_value)
    values (p_post_id, v_user_id, p_next_vote);

    if p_next_vote = 1 then
      update public.posts
      set up_count = up_count + 1
      where id = p_post_id;
    else
      update public.posts
      set down_count = down_count + 1
      where id = p_post_id;
    end if;

    v_result_vote := p_next_vote;
  elsif v_current_vote = p_next_vote then
    delete from public.post_votes
    where post_id = p_post_id
      and user_id = v_user_id;

    if p_next_vote = 1 then
      update public.posts
      set up_count = greatest(up_count - 1, 0)
      where id = p_post_id;
    else
      update public.posts
      set down_count = greatest(down_count - 1, 0)
      where id = p_post_id;
    end if;

    v_result_vote := 0;
  else
    update public.post_votes
    set vote_value = p_next_vote,
        updated_at = now()
    where post_id = p_post_id
      and user_id = v_user_id;

    if p_next_vote = 1 then
      update public.posts
      set up_count = up_count + 1,
          down_count = greatest(down_count - 1, 0)
      where id = p_post_id;
    else
      update public.posts
      set up_count = greatest(up_count - 1, 0),
          down_count = down_count + 1
      where id = p_post_id;
    end if;

    v_result_vote := p_next_vote;
  end if;

  return query
  select posts.up_count, posts.down_count, v_result_vote
  from public.posts
  where posts.id = p_post_id;
end;
$$;

grant execute on function public.handle_post_vote(uuid, smallint) to authenticated;
