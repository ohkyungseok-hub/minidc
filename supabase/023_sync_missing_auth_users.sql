-- ============================================================
-- Migration 023: Sync auth.users → public.users
-- Backfill any auth users that are missing from public.users
-- (caused when trigger didn't exist at signup time)
-- ============================================================

insert into public.users (id, nickname)
select
  au.id,
  coalesce(
    nullif(trim(au.raw_user_meta_data ->> 'nickname'), ''),
    'user_' || substr(replace(au.id::text, '-', ''), 1, 10)
  ) as nickname
from auth.users au
where not exists (
  select 1 from public.users pu where pu.id = au.id
)
on conflict (id) do nothing;

-- Also ensure the trigger exists for future signups
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
