-- ============================================================
-- Migration 015: Add is_hidden / hidden_reason to posts and comments
--
-- lib/posts.ts and lib/comments.ts query these columns via
-- PostgREST. Without them every Supabase select returns an
-- error, causing all post/comment lists to fall back to an
-- empty array and become invisible in the UI.
-- ============================================================

-- posts
alter table public.posts
  add column if not exists is_hidden     boolean not null default false;

alter table public.posts
  add column if not exists hidden_reason text;

-- comments
alter table public.comments
  add column if not exists is_hidden     boolean not null default false;

alter table public.comments
  add column if not exists hidden_reason text;

-- Index for admin queries that filter by is_hidden
create index if not exists idx_posts_is_hidden    on public.posts(is_hidden);
create index if not exists idx_comments_is_hidden on public.comments(is_hidden);

-- ============================================================
-- increment_post_view_count(p_post_id)
-- Atomically increments view_count and returns the new value.
-- Called by lib/posts.ts incrementViewCount via supabase.rpc().
-- ============================================================
create or replace function public.increment_post_view_count(p_post_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_count integer;
begin
  update public.posts
  set view_count = view_count + 1
  where id = p_post_id
  returning view_count into v_new_count;

  if not found then
    raise exception 'Post not found: %', p_post_id;
  end if;

  return v_new_count;
end;
$$;

grant execute on function public.increment_post_view_count(uuid) to authenticated;
grant execute on function public.increment_post_view_count(uuid) to anon;
