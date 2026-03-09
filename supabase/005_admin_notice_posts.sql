alter table public.users
  add column if not exists role text not null default 'user';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'users_role_chk'
      and conrelid = 'public.users'::regclass
  ) then
    alter table public.users
      add constraint users_role_chk check (role in ('user', 'admin'));
  end if;
end $$;

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
