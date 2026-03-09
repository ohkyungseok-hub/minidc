create extension if not exists pgcrypto;

create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  slug varchar(50) not null unique,
  name varchar(50) not null,
  description text,
  sort_order integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint boards_slug_length_chk check (char_length(slug) between 2 and 50),
  constraint boards_name_length_chk check (char_length(name) between 1 and 50)
);

alter table public.boards enable row level security;

drop policy if exists "Public can read active boards" on public.boards;
create policy "Public can read active boards"
on public.boards
for select
using (is_active = true);

create index if not exists boards_sort_order_idx
on public.boards (sort_order asc, created_at asc);

insert into public.boards (
  slug,
  name,
  description,
  sort_order,
  is_active
)
values
  ('general', '자유', '가벼운 잡담과 링크 공유를 위한 기본 게시판', 10, true),
  ('dev', '개발', 'Next.js, Supabase, 배포 이슈를 다루는 공간', 20, true),
  ('design', '디자인', 'UI 레이아웃, 인터랙션, 브랜딩 시안을 논의하는 공간', 30, true)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;
