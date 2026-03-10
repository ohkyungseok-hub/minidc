do $$
declare
  v_author_id uuid;
  v_alt_author_id uuid;
  v_notice_post_id uuid;
  v_confession_post_id uuid;
  v_confession_post_2_id uuid;
  v_comfort_post_id uuid;
  v_comfort_post_2_id uuid;
  v_solution_post_id uuid;
begin
  select id
  into v_author_id
  from public.users
  order by created_at asc
  limit 1;

  select id
  into v_alt_author_id
  from public.users
  order by created_at asc
  offset 1
  limit 1;

  if v_author_id is null then
    raise exception 'No users found in public.users. Create at least one user first.';
  end if;

  if v_alt_author_id is null then
    v_alt_author_id := v_author_id;
  end if;

  select id into v_notice_post_id
  from public.posts
  where title = '운영 안내 | 이곳은 익명 고백과 위로를 위한 공간입니다'
  limit 1;

  select id into v_confession_post_id
  from public.posts
  where title = '결혼을 앞두고도 예전 사람을 아직 못 잊고 있습니다'
  limit 1;

  select id into v_confession_post_2_id
  from public.posts
  where title = '부모님 지갑에서 돈을 가져간 적이 있다는 걸 아직 말 못했습니다'
  limit 1;

  select id into v_comfort_post_id
  from public.posts
  where title = '오늘도 아무 일 없는 척 출근하고 왔어요'
  limit 1;

  select id into v_comfort_post_2_id
  from public.posts
  where title = '육아가 버거운데 저만 약한 부모 같아요'
  limit 1;

  select id into v_solution_post_id
  from public.posts
  where title = '빚을 들키기 전에 정리하려면 무엇부터 해야 할까요'
  limit 1;

  if v_notice_post_id is null
     or v_confession_post_id is null
     or v_confession_post_2_id is null
     or v_comfort_post_id is null
     or v_comfort_post_2_id is null
     or v_solution_post_id is null then
    raise exception 'Required sample posts are missing. Run 011_seed_sample_posts.sql first.';
  end if;

  insert into public.comments (
    post_id,
    author_id,
    body,
    is_deleted,
    upvotes,
    downvotes,
    created_at,
    updated_at
  )
  select *
  from (
    values
      (
        v_notice_post_id,
        v_author_id,
        '이런 공간이 있다는 것만으로도 조금 숨이 쉬어집니다. 운영 방향이 분명해서 좋네요.',
        false,
        4,
        0,
        now() - interval '46 hours',
        now() - interval '46 hours'
      ),
      (
        v_notice_post_id,
        v_alt_author_id,
        '고백을 함부로 소비하지 말자는 문장이 좋았습니다. 분위기만 잘 유지되면 오래 머물고 싶은 공간이 될 것 같아요.',
        false,
        3,
        0,
        now() - interval '44 hours',
        now() - interval '44 hours'
      ),
      (
        v_confession_post_id,
        v_author_id,
        '그 마음이 남아 있다고 해서 지금 사람을 사랑하지 않는 건 아닐 수도 있어요. 죄책감 때문에 스스로를 너무 몰아붙이지 않았으면 합니다.',
        false,
        5,
        0,
        now() - interval '10 hours',
        now() - interval '10 hours'
      ),
      (
        v_confession_post_id,
        v_alt_author_id,
        '결혼 전이라 더 불안한 것 같아요. 마음을 완전히 정리해야만 앞으로 갈 수 있다고 생각하지는 않으셔도 될 것 같습니다.',
        false,
        4,
        0,
        now() - interval '9 hours',
        now() - interval '9 hours'
      ),
      (
        v_confession_post_2_id,
        v_author_id,
        '시간이 많이 지났다면 돈의 액수보다도 아직도 미안해하고 있다는 마음을 어떻게 전할지가 더 중요할 것 같아요.',
        false,
        3,
        0,
        now() - interval '27 hours',
        now() - interval '27 hours'
      ),
      (
        v_confession_post_2_id,
        v_alt_author_id,
        '삭제된 댓글 표시를 테스트하려고 남긴 예시 댓글입니다.',
        true,
        0,
        0,
        now() - interval '26 hours',
        now() - interval '26 hours'
      ),
      (
        v_comfort_post_id,
        v_author_id,
        '아무 일 없는 척 하루를 버텨낸 것만으로도 이미 충분히 고생한 하루였다고 생각합니다.',
        false,
        6,
        0,
        now() - interval '8 hours',
        now() - interval '8 hours'
      ),
      (
        v_comfort_post_id,
        v_alt_author_id,
        '원인을 정확히 설명할 수 없어도 힘든 건 힘든 겁니다. 오늘만큼은 쉬어도 괜찮다고 말해드리고 싶어요.',
        false,
        5,
        0,
        now() - interval '7 hours',
        now() - interval '7 hours'
      ),
      (
        v_comfort_post_2_id,
        v_author_id,
        '육아가 버겁다고 느끼는 게 사랑이 부족해서는 아니라고 생각해요. 너무 지쳤다는 뜻일 수 있으니, 잠깐이라도 혼자 쉬는 시간을 꼭 만들어보셨으면 합니다.',
        false,
        7,
        0,
        now() - interval '3 hours',
        now() - interval '3 hours'
      ),
      (
        v_comfort_post_2_id,
        v_alt_author_id,
        '주변에서 다 잘해 보이는 건 보이는 부분만 보기 때문일 가능성이 큽니다. 혼자 버티지 않았으면 좋겠어요.',
        false,
        5,
        0,
        now() - interval '2 hours',
        now() - interval '2 hours'
      ),
      (
        v_solution_post_id,
        v_author_id,
        '제일 먼저 해야 할 건 총액, 이자, 상환일을 한 장에 정리하는 일이라고 생각합니다. 숫자를 정확히 보는 순간부터 선택지가 조금 보이기 시작하더라고요.',
        false,
        8,
        0,
        now() - interval '17 hours',
        now() - interval '17 hours'
      ),
      (
        v_solution_post_id,
        v_alt_author_id,
        '새 대출로 막는 방식은 당장 숨통은 트여도 더 깊어질 가능성이 커서 피하는 게 좋습니다. 혼자 감당하기 어려우면 상담 창구를 먼저 알아보는 것도 추천합니다.',
        false,
        6,
        0,
        now() - interval '16 hours',
        now() - interval '16 hours'
      )
  ) as seed_comments (
    post_id,
    author_id,
    body,
    is_deleted,
    upvotes,
    downvotes,
    created_at,
    updated_at
  )
  where not exists (
    select 1
    from public.comments c
    where c.post_id = seed_comments.post_id
      and c.author_id = seed_comments.author_id
      and c.body = seed_comments.body
  );
end
$$;
