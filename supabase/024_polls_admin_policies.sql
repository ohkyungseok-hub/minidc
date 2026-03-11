-- Admin write policies for polls tables

drop policy if exists "Admins can insert polls" on public.polls;
create policy "Admins can insert polls"
on public.polls for insert to authenticated
with check (
  exists (select 1 from public.users where id = (select auth.uid()) and role = 'admin')
);

drop policy if exists "Admins can update polls" on public.polls;
create policy "Admins can update polls"
on public.polls for update to authenticated
using (
  exists (select 1 from public.users where id = (select auth.uid()) and role = 'admin')
);

drop policy if exists "Admins can delete polls" on public.polls;
create policy "Admins can delete polls"
on public.polls for delete to authenticated
using (
  exists (select 1 from public.users where id = (select auth.uid()) and role = 'admin')
);

drop policy if exists "Admins can insert poll options" on public.poll_options;
create policy "Admins can insert poll options"
on public.poll_options for insert to authenticated
with check (
  exists (select 1 from public.users where id = (select auth.uid()) and role = 'admin')
);

drop policy if exists "Admins can update poll options" on public.poll_options;
create policy "Admins can update poll options"
on public.poll_options for update to authenticated
using (
  exists (select 1 from public.users where id = (select auth.uid()) and role = 'admin')
);

drop policy if exists "Admins can delete poll options" on public.poll_options;
create policy "Admins can delete poll options"
on public.poll_options for delete to authenticated
using (
  exists (select 1 from public.users where id = (select auth.uid()) and role = 'admin')
);

drop policy if exists "Admins can insert poll votes" on public.poll_votes;
create policy "Admins can insert poll votes"
on public.poll_votes for insert to authenticated
with check (true);

drop policy if exists "Anon can insert poll votes" on public.poll_votes;
create policy "Anon can insert poll votes"
on public.poll_votes for insert to anon
with check (true);
