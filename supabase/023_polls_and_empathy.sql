-- ===== 공감(Empathy) on posts =====

alter table public.posts
  add column if not exists empathy_count integer not null default 0;

create table if not exists public.post_empathies (
  post_id   uuid not null references public.posts(id) on delete cascade,
  user_id   uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.post_empathies enable row level security;

drop policy if exists "Users can read own empathies" on public.post_empathies;
create policy "Users can read own empathies"
on public.post_empathies for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own empathies" on public.post_empathies;
create policy "Users can insert own empathies"
on public.post_empathies for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own empathies" on public.post_empathies;
create policy "Users can delete own empathies"
on public.post_empathies for delete to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.toggle_post_empathy(p_post_id uuid)
returns table (empathy_count integer, has_empathized boolean)
language plpgsql security definer set search_path = public
as $$
declare
  v_user_id    uuid := auth.uid();
  v_exists     boolean;
  v_new_count  integer;
  v_empathized boolean;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select exists (
    select 1 from post_empathies
    where post_id = p_post_id and user_id = v_user_id
  ) into v_exists;

  if v_exists then
    delete from post_empathies
    where post_id = p_post_id and user_id = v_user_id;
    update posts
    set empathy_count = greatest(empathy_count - 1, 0)
    where id = p_post_id;
    v_empathized := false;
  else
    insert into post_empathies (post_id, user_id) values (p_post_id, v_user_id);
    update posts
    set empathy_count = empathy_count + 1
    where id = p_post_id;
    v_empathized := true;
  end if;

  -- Use table alias to disambiguate from the function's return column
  select p.empathy_count into v_new_count
  from posts p where p.id = p_post_id;

  return query select v_new_count, v_empathized;
end;
$$;

grant execute on function public.toggle_post_empathy(uuid) to authenticated;

-- ===== Anonymous Polls =====

create table if not exists public.polls (
  id         uuid primary key default gen_random_uuid(),
  question   text not null,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.poll_options (
  id         uuid primary key default gen_random_uuid(),
  poll_id    uuid not null references public.polls(id) on delete cascade,
  label      text not null,
  vote_count integer not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.poll_votes (
  id         uuid primary key default gen_random_uuid(),
  poll_id    uuid not null references public.polls(id) on delete cascade,
  option_id  uuid not null references public.poll_options(id) on delete cascade,
  voter_key  text not null,
  created_at timestamptz not null default now(),
  unique (poll_id, voter_key)
);

alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.poll_votes enable row level security;

drop policy if exists "Anyone can read polls" on public.polls;
create policy "Anyone can read polls"
on public.polls for select to anon, authenticated using (true);

drop policy if exists "Anyone can read poll options" on public.poll_options;
create policy "Anyone can read poll options"
on public.poll_options for select to anon, authenticated using (true);

drop policy if exists "Anyone can read poll votes" on public.poll_votes;
create policy "Anyone can read poll votes"
on public.poll_votes for select to anon, authenticated using (true);

-- RPC to cast anonymous poll vote (increments option vote_count)
create or replace function public.cast_poll_vote(
  p_poll_id   uuid,
  p_option_id uuid,
  p_voter_key text
)
returns table (
  option_id  uuid,
  vote_count integer,
  already_voted boolean
)
language plpgsql security definer set search_path = public
as $$
declare
  v_already boolean;
begin
  select exists (
    select 1 from poll_votes
    where poll_id = p_poll_id and voter_key = p_voter_key
  ) into v_already;

  if v_already then
    -- return current counts without changing anything
    return query
      select po.id, po.vote_count, true
      from poll_options po where po.poll_id = p_poll_id;
    return;
  end if;

  -- insert vote record
  insert into poll_votes (poll_id, option_id, voter_key)
  values (p_poll_id, p_option_id, p_voter_key);

  -- increment selected option
  update poll_options
  set vote_count = vote_count + 1
  where id = p_option_id;

  return query
    select po.id, po.vote_count, false
    from poll_options po where po.poll_id = p_poll_id;
end;
$$;

grant execute on function public.cast_poll_vote(uuid, uuid, text) to anon, authenticated;
