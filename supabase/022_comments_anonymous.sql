-- ============================================================
-- 022: Add is_anonymous column to comments
-- ============================================================
alter table public.comments
  add column if not exists is_anonymous boolean not null default false;
