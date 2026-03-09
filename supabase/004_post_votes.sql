do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'posts'
      and column_name = 'upvotes'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'posts'
      and column_name = 'up_count'
  ) then
    alter table public.posts rename column upvotes to up_count;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'posts'
      and column_name = 'downvotes'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'posts'
      and column_name = 'down_count'
  ) then
    alter table public.posts rename column downvotes to down_count;
  end if;
end $$;

alter table public.posts
  add column if not exists up_count integer not null default 0;

alter table public.posts
  add column if not exists down_count integer not null default 0;

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
