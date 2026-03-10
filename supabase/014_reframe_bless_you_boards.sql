do $$
begin
  update public.boards
  set
    slug = 'confession',
    name = '고해성사',
    description = '누구에게도 말 못할 일을 고백해보세요. 조금이나마 마음이 편안해질거예요',
    sort_order = 10,
    is_active = true
  where slug = 'general';

  update public.boards
  set
    slug = 'comfort',
    name = '위로받고 싶어요',
    description = '삶이 힘든신가요? 위로받고 싶은 일이 있다면 알려주세요. 저희가 함께 응원해드릴게요.',
    sort_order = 20,
    is_active = true
  where slug = 'dev';

  update public.boards
  set
    slug = 'solutions',
    name = '해결책을 제시해주세요',
    description = '지피티가 해결하지 못한 삶의 지혜가 필요하신가요? 집단지성으로 당신을 도와드릴게요',
    sort_order = 30,
    is_active = true
  where slug = 'design';

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
end
$$;
