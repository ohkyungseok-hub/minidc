-- ============================================================
-- Migration 023: Sync auth.users → public.users
-- Backfill any auth users that are missing from public.users
-- (caused when trigger didn't exist at signup time)
-- ============================================================

do $$
declare
  r record;
  base_nick text;
  final_nick text;
  suffix int;
begin
  for r in
    select au.id, au.raw_user_meta_data
    from auth.users au
    where not exists (select 1 from public.users pu where pu.id = au.id)
  loop
    base_nick := coalesce(
      nullif(trim(r.raw_user_meta_data ->> 'nickname'), ''),
      'user_' || substr(replace(r.id::text, '-', ''), 1, 10)
    );

    -- Ensure nickname is within 24 char limit
    base_nick := substr(base_nick, 1, 20);

    final_nick := base_nick;
    suffix := 1;

    -- Resolve collisions by appending a number
    while exists (select 1 from public.users where nickname = final_nick) loop
      final_nick := base_nick || '_' || suffix;
      suffix := suffix + 1;
    end loop;

    insert into public.users (id, nickname)
    values (r.id, final_nick)
    on conflict (id) do nothing;
  end loop;
end $$;

-- Also ensure the trigger exists for future signups
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
