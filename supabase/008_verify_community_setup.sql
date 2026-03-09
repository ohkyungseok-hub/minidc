select
  to_regclass('public.users') as users_table,
  to_regclass('public.boards') as boards_table,
  to_regclass('public.posts') as posts_table,
  to_regclass('public.comments') as comments_table,
  to_regclass('public.post_votes') as post_votes_table;

select
  trigger_name,
  event_object_table
from information_schema.triggers
where trigger_schema = 'public'
order by event_object_table, trigger_name;

select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('users', 'boards', 'posts', 'comments', 'post_votes')
order by tablename, policyname;

select
  slug,
  name,
  description,
  sort_order,
  is_active,
  created_at
from public.boards
order by sort_order asc, created_at asc;

select
  count(*) as user_count
from public.users;

select
  count(*) as post_count
from public.posts;

select
  count(*) as comment_count
from public.comments;
