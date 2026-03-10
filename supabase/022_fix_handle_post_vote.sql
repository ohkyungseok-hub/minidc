-- ============================================================
-- Migration 022: Fix handle_post_vote function
-- - Accept integer instead of smallint (JS sends integer via JSON)
-- - Add INSERT / UPDATE / DELETE RLS policies on post_votes
-- ============================================================

-- ── RLS policies for post_votes ───────────────────────────────
-- The function is SECURITY DEFINER so it bypasses RLS, but
-- add explicit policies just in case the function owner changes.

drop policy if exists "post_votes: owner insert" on public.post_votes;
create policy "post_votes: owner insert"
on public.post_votes for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "post_votes: owner update" on public.post_votes;
create policy "post_votes: owner update"
on public.post_votes for update
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "post_votes: owner delete" on public.post_votes;
create policy "post_votes: owner delete"
on public.post_votes for delete
to authenticated
using ((select auth.uid()) = user_id);

-- ── Recreate handle_post_vote with integer parameter ──────────
-- PostgREST sends JSON numbers as integer; smallint caused a
-- type-mismatch error that surfaces as "Failed to record vote".

drop function if exists public.handle_post_vote(uuid, smallint);

create or replace function public.handle_post_vote(
  p_post_id uuid,
  p_next_vote integer          -- was smallint; JS/JSON sends integer
)
returns table (
  up_count   integer,
  down_count  integer,
  current_vote integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id    uuid := auth.uid();
  v_prev_vote  smallint;
  v_result_vote integer;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_next_vote not in (1, -1) then
    raise exception 'Invalid vote value: %', p_next_vote;
  end if;

  -- Lock the post row
  perform 1 from public.posts where id = p_post_id for update;
  if not found then
    raise exception 'Post not found: %', p_post_id;
  end if;

  -- Current vote for this user
  select vote_value
  into v_prev_vote
  from public.post_votes
  where post_id = p_post_id and user_id = v_user_id
  for update;

  if v_prev_vote is null then
    -- No previous vote → insert
    insert into public.post_votes (post_id, user_id, vote_value)
    values (p_post_id, v_user_id, p_next_vote::smallint);

    if p_next_vote = 1 then
      update public.posts set up_count   = up_count   + 1 where id = p_post_id;
    else
      update public.posts set down_count = down_count + 1 where id = p_post_id;
    end if;

    v_result_vote := p_next_vote;

  elsif v_prev_vote = p_next_vote then
    -- Same vote again → toggle off
    delete from public.post_votes
    where post_id = p_post_id and user_id = v_user_id;

    if p_next_vote = 1 then
      update public.posts set up_count   = greatest(up_count   - 1, 0) where id = p_post_id;
    else
      update public.posts set down_count = greatest(down_count - 1, 0) where id = p_post_id;
    end if;

    v_result_vote := 0;

  else
    -- Switched vote direction
    update public.post_votes
    set vote_value = p_next_vote::smallint, updated_at = now()
    where post_id = p_post_id and user_id = v_user_id;

    if p_next_vote = 1 then
      update public.posts
      set up_count   = up_count   + 1,
          down_count = greatest(down_count - 1, 0)
      where id = p_post_id;
    else
      update public.posts
      set up_count   = greatest(up_count   - 1, 0),
          down_count = down_count + 1
      where id = p_post_id;
    end if;

    v_result_vote := p_next_vote;
  end if;

  return query
  select p.up_count, p.down_count, v_result_vote
  from public.posts p
  where p.id = p_post_id;
end;
$$;

grant execute on function public.handle_post_vote(uuid, integer) to authenticated;
