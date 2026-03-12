-- ============================================================
-- 030: Seed 10 more community-style posts for 2026-03-12
-- Re-runnable: skips rows that already exist by title
-- ============================================================

do $$
declare
  v_post_author_id uuid;
begin
  select id
  into v_post_author_id
  from public.users
  order by created_at asc
  limit 1;

  if v_post_author_id is null then
    raise exception 'No users found in public.users. Create at least one user first.';
  end if;

  if (
    select count(*)
    from public.boards
    where slug in ('confession', 'comfort', 'solutions')
  ) < 3 then
    raise exception 'Required boards are missing. Run board bootstrap SQL first.';
  end if;

  with seed_posts as (
    select
      item ->> 'board_slug' as board_slug,
      item ->> 'title' as title,
      item ->> 'content' as content,
      item ->> 'topic' as topic,
      (item ->> 'up_count')::int as up_count,
      (item ->> 'down_count')::int as down_count,
      (item ->> 'view_count')::int as view_count,
      (item ->> 'created_at')::timestamptz as created_at
    from jsonb_array_elements(
      $posts$
      [
        {
          "board_slug":"confession",
          "title":"친한 사람 힘든 얘기를 들으면서 속으로는 빨리 끝나길 바랐어요",
          "content":"앞에서는 다 들어주는 척했는데 속으론 제발 이제 그만했으면 싶었음. 상대는 진짜 힘들어서 털어놓은 건데 저는 듣는 것조차 귀찮고 버거워서 그런 생각 든 게 계속 찝찝함.",
          "topic":"relationship",
          "up_count":15,
          "down_count":0,
          "view_count":132,
          "created_at":"2026-03-12T13:05:00+09:00"
        },
        {
          "board_slug":"confession",
          "title":"부모님 걱정할까 봐 괜찮다고만 했는데 사실은 하나도 안 괜찮습니다",
          "content":"전화만 오면 반사적으로 괜찮다고 말하게 됨. 끊고 나면 또 왜 구라쳤지 싶고, 걱정 덜어주려던 게 이제는 제 상태 자체를 계속 감추게 만드네요.",
          "topic":"family",
          "up_count":19,
          "down_count":1,
          "view_count":164,
          "created_at":"2026-03-12T13:40:00+09:00"
        },
        {
          "board_slug":"confession",
          "title":"잘되는 친구 옆에서 자꾸만 제 인생 점수부터 매기게 됩니다",
          "content":"친구 잘됐다는 얘기 들으면 축하한다고 하면서도 바로 제 상황이랑 비교 들어감. 왜 이렇게 꼬였나 싶고 현타 오는데, 또 이런 생각이 바로 멈추는 것도 아님.",
          "topic":"work",
          "up_count":17,
          "down_count":0,
          "view_count":149,
          "created_at":"2026-03-12T14:10:00+09:00"
        },
        {
          "board_slug":"comfort",
          "title":"사소한 연락 하나 답장하는 것도 오늘은 너무 버겁네요",
          "content":"답장 몇 줄이 뭐 어렵냐 할 수 있는데 오늘은 그것도 진짜 일처럼 느껴짐. 읽고도 폰 덮고 한참 멍때리게 되고, 이러다 인간관계 다 끊길까 봐 좀 무섭네요.",
          "topic":"anxiety",
          "up_count":26,
          "down_count":0,
          "view_count":218,
          "created_at":"2026-03-12T14:45:00+09:00"
        },
        {
          "board_slug":"comfort",
          "title":"퇴근하고 나면 누구랑도 말하고 싶지 않은데 또 너무 외롭습니다",
          "content":"사람 만날 기운은 없는데 혼자 있는 것도 편하지가 않음. 혼자 있고 싶다가도 또 누가 알아줬으면 싶고, 저도 이 모순이 설명이 안 됨.",
          "topic":"loneliness",
          "up_count":29,
          "down_count":1,
          "view_count":242,
          "created_at":"2026-03-12T15:20:00+09:00"
        },
        {
          "board_slug":"comfort",
          "title":"다들 잘 버티는 것 같은데 저만 자꾸 일상에서 미끄러지는 기분이에요",
          "content":"출근 밥 샤워 잠 이런 기본 루틴도 요즘은 자꾸 무너짐. 남들은 당연하게 하는 거 같은데 저만 기본도 못 챙기는 느낌이라 더 현타 옴.",
          "topic":"anxiety",
          "up_count":24,
          "down_count":0,
          "view_count":203,
          "created_at":"2026-03-12T16:00:00+09:00"
        },
        {
          "board_slug":"comfort",
          "title":"잘 쉬고 와도 하나도 회복된 느낌이 없는 날이 계속됩니다",
          "content":"주말 내내 누워 있었는데 월요일 되면 오히려 더 퍼진 사람처럼 일어남. 이게 그냥 피곤한 수준 아닌 것 같은데 인정하면 진짜 박살날 것 같아서 또 아닌 척함.",
          "topic":"anxiety",
          "up_count":23,
          "down_count":0,
          "view_count":187,
          "created_at":"2026-03-12T16:40:00+09:00"
        },
        {
          "board_slug":"solutions",
          "title":"생활비 줄여보려는데 어디부터 손대야 덜 무너질까요",
          "content":"적자까진 아닌데 월말만 되면 돈 생각에 쫄림. 그러다 또 스트레스 받아서 더 쓰는 것 같고요. 식비 구독 교통비 다 필요한 돈 같아서 뭘 먼저 쳐내야 할지 감이 안 잡힘.",
          "topic":"money",
          "up_count":18,
          "down_count":0,
          "view_count":158,
          "created_at":"2026-03-12T17:15:00+09:00"
        },
        {
          "board_slug":"solutions",
          "title":"멀어진 친구에게 먼저 연락하고 싶은데 무슨 말부터 해야 할지 모르겠습니다",
          "content":"대판 싸운 건 아닌데 서운한 거 쌓여서 몇 달째 연락 끊김. 갑자기 안부 묻자니 뜬금없고 사과부터 하자니 너무 무거워서 시작 자체를 못 하겠음.",
          "topic":"relationship",
          "up_count":21,
          "down_count":0,
          "view_count":176,
          "created_at":"2026-03-12T17:50:00+09:00"
        },
        {
          "board_slug":"solutions",
          "title":"회사에서 자꾸 위축되는데 이직 말고 버티는 방법도 있을까요",
          "content":"일 많아서보다 사람들 앞에서 자꾸 쫄고 작은 피드백에도 멘탈이 확 흔들림. 무조건 퇴사가 답인지, 아니면 당장 안 나가고도 덜 박살나면서 버티는 법이 있는지 궁금함.",
          "topic":"work",
          "up_count":27,
          "down_count":1,
          "view_count":221,
          "created_at":"2026-03-12T18:25:00+09:00"
        }
      ]
      $posts$::jsonb
    ) as seed(item)
  )
  insert into public.posts (
    board_id,
    author_id,
    title,
    content,
    is_notice,
    is_anonymous,
    is_hidden,
    hidden_reason,
    up_count,
    down_count,
    empathy_count,
    view_count,
    images,
    topic,
    created_at,
    updated_at
  )
  select
    b.id,
    v_post_author_id,
    sp.title,
    sp.content,
    false,
    true,
    false,
    null,
    sp.up_count,
    sp.down_count,
    0,
    sp.view_count,
    '{}'::text[],
    sp.topic,
    sp.created_at,
    sp.created_at
  from seed_posts sp
  join public.boards b
    on b.slug = sp.board_slug
  where not exists (
    select 1
    from public.posts p
    where p.title = sp.title
  );

  raise notice 'Done: seeded 10 more community-style posts for 2026-03-12.';
end
$$;
