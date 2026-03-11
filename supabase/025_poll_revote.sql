-- Replace cast_poll_vote to support re-voting
create or replace function public.cast_poll_vote(
  p_poll_id    uuid,
  p_option_id  uuid,
  p_voter_key  text,
  p_is_change  boolean default false
)
returns table (
  option_id     uuid,
  vote_count    integer,
  already_voted boolean
)
language plpgsql security definer set search_path = public
as $$
declare
  v_existing_option uuid;
begin
  -- Find existing vote for this voter
  select option_id into v_existing_option
  from poll_votes
  where poll_id = p_poll_id and voter_key = p_voter_key;

  if v_existing_option is not null then
    if not p_is_change then
      -- Not a re-vote request: return already_voted
      return query
        select po.id, po.vote_count, true
        from poll_options po where po.poll_id = p_poll_id;
      return;
    end if;

    if v_existing_option = p_option_id then
      -- Same option chosen again: no-op
      return query
        select po.id, po.vote_count, true
        from poll_options po where po.poll_id = p_poll_id;
      return;
    end if;

    -- Different option: decrement old, increment new
    update poll_options
    set vote_count = greatest(vote_count - 1, 0)
    where id = v_existing_option;

    update poll_options
    set vote_count = vote_count + 1
    where id = p_option_id;

    update poll_votes
    set option_id = p_option_id
    where poll_id = p_poll_id and voter_key = p_voter_key;

  else
    -- First vote
    insert into poll_votes (poll_id, option_id, voter_key)
    values (p_poll_id, p_option_id, p_voter_key);

    update poll_options
    set vote_count = vote_count + 1
    where id = p_option_id;
  end if;

  return query
    select po.id, po.vote_count, false
    from poll_options po where po.poll_id = p_poll_id;
end;
$$;

grant execute on function public.cast_poll_vote(uuid, uuid, text, boolean) to anon, authenticated;
