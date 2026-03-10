-- ============================================================
-- 019: Remove duplicate posts (keep earliest created_at per title)
-- ============================================================
delete from public.posts
where id in (
  select id
  from (
    select id,
           row_number() over (partition by title order by created_at asc, id asc) as rn
    from public.posts
  ) ranked
  where rn > 1
);
