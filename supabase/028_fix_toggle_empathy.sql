-- Fix ambiguous empathy_count reference by reading into a local variable
-- before the UPDATE, so the SET clause only uses unambiguous local vars.
create or replace function public.toggle_post_empathy(p_post_id uuid)
returns table (empathy_count integer, has_empathized boolean)
language plpgsql security definer set search_path = public
as $$
declare
  v_user_id      uuid := auth.uid();
  v_exists       boolean;
  v_cur_count    integer;
  v_new_count    integer;
  v_empathized   boolean;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select exists (
    select 1 from post_empathies
    where post_id = p_post_id and user_id = v_user_id
  ) into v_exists;

  -- Read current count into local var to avoid column name ambiguity in UPDATE
  select p.empathy_count into v_cur_count
  from posts p where p.id = p_post_id;

  if v_exists then
    delete from post_empathies
    where post_id = p_post_id and user_id = v_user_id;

    v_new_count  := greatest(v_cur_count - 1, 0);
    v_empathized := false;
  else
    insert into post_empathies (post_id, user_id) values (p_post_id, v_user_id);

    v_new_count  := v_cur_count + 1;
    v_empathized := true;
  end if;

  update posts set empathy_count = v_new_count where id = p_post_id;

  return query select v_new_count, v_empathized;
end;
$$;

grant execute on function public.toggle_post_empathy(uuid) to authenticated;
