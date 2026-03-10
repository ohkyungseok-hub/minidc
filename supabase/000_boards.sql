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
  ('confession', '고해성사', '누구에게도 말 못할 일을 고백해보세요. 조금이나마 마음이 편안해질거예요', 10, true),
  ('comfort', '위로받고 싶어요', '삶이 힘든신가요? 위로받고 싶은 일이 있다면 알려주세요. 저희가 함께 응원해드릴게요.', 20, true),
  ('solutions', '해결책을 제시해주세요', '지피티가 해결하지 못한 삶의 지혜가 필요하신가요? 집단지성으로 당신을 도와드릴게요', 30, true)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;
