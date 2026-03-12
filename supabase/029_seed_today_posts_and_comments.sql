-- ============================================================
-- 029: Seed 10 posts + 10 comments for 2026-03-12
-- Re-runnable: skips rows that already exist by title or post/body
-- ============================================================

do $$
declare
  v_post_author_id uuid;
  v_comment_author_id uuid;
begin
  select id
  into v_post_author_id
  from public.users
  order by created_at asc
  limit 1;

  if v_post_author_id is null then
    raise exception 'No users found in public.users. Create at least one user first.';
  end if;

  select id
  into v_comment_author_id
  from public.users
  order by created_at asc
  offset 1
  limit 1;

  if v_comment_author_id is null then
    v_comment_author_id := v_post_author_id;
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
          "title":"아무렇지 않은 척했지만 사실은 축하해주기 힘들었습니다",
          "content":"친구 합격 소식 듣고 앞에서는 축하한다고 했는데 집 오니까 제 인생만 더 초라해 보였음. 진심으로 축하해줘야 하는데 속으로는 왜 나는 이 모양이지 생각만 들어서 현타 오네요.",
          "topic":"work",
          "up_count":16,
          "down_count":1,
          "view_count":127,
          "created_at":"2026-03-12T00:20:00+09:00"
        },
        {
          "board_slug":"confession",
          "title":"가족 단톡방 알림을 일부러 무시하고 있습니다",
          "content":"가족 단톡방 알림만 떠도 숨 막힘. 읽고도 며칠씩 답장 못 하고, 그러면 죄책감 쌓이고, 또 답장하려면 더 막막해짐. 그냥 이 루프가 안 끝나요.",
          "topic":"family",
          "up_count":21,
          "down_count":0,
          "view_count":166,
          "created_at":"2026-03-12T01:40:00+09:00"
        },
        {
          "board_slug":"confession",
          "title":"퇴사한 동료가 부러운 마음을 숨기고 있습니다",
          "content":"다들 말렸는데도 퇴사 박은 동료가 솔직히 너무 부러움. 저는 겁나서 못 하는 선택이라 더 찌질해지는 느낌이고, 그 부러움을 티도 못 내니까 더 답답함.",
          "topic":"work",
          "up_count":14,
          "down_count":0,
          "view_count":118,
          "created_at":"2026-03-12T02:10:00+09:00"
        },
        {
          "board_slug":"comfort",
          "title":"요즘은 아침에 눈뜨는 순간부터 피곤합니다",
          "content":"분명 잤는데 아침부터 이미 방전된 사람 같음. 해야 할 건 그대로인데 시작할 힘이 없어서 또 제 자신만 갈아버리게 됨.",
          "topic":"anxiety",
          "up_count":28,
          "down_count":0,
          "view_count":209,
          "created_at":"2026-03-12T03:25:00+09:00"
        },
        {
          "board_slug":"comfort",
          "title":"사람들 사이에 있어도 계속 혼자인 느낌이 듭니다",
          "content":"회사에서도 말하고 모임 가서도 웃는데 집 오면 하루 종일 누구랑도 연결 안 된 느낌만 남음. 괜히 이런 얘기 꺼내면 유난 떠는 사람 같을까 봐 말도 못 함.",
          "topic":"loneliness",
          "up_count":24,
          "down_count":1,
          "view_count":191,
          "created_at":"2026-03-12T04:50:00+09:00"
        },
        {
          "board_slug":"comfort",
          "title":"별일 아닌 말에도 자꾸 마음이 무너집니다",
          "content":"예전엔 그냥 넘겼을 말도 요즘은 하루 종일 머리에서 안 나감. 별말 아닌데도 멘탈이 계속 깎이고, 그렇다고 누굴 탓할 수도 없어서 더 빡셈.",
          "topic":"anxiety",
          "up_count":31,
          "down_count":2,
          "view_count":237,
          "created_at":"2026-03-12T06:05:00+09:00"
        },
        {
          "board_slug":"solutions",
          "title":"월급이 들어오자마자 사라지는데 가계부부터 다시 써야 할까요",
          "content":"막 쓰는 것도 아닌 것 같은데 카드값 자동이체 빠지고 나면 남는 돈이 거의 없음. 이 상태를 제대로 보려면 뭘 먼저 까봐야 하는지 감이 안 옴.",
          "topic":"money",
          "up_count":18,
          "down_count":0,
          "view_count":154,
          "created_at":"2026-03-12T07:30:00+09:00"
        },
        {
          "board_slug":"solutions",
          "title":"부모님과 다시 대화하려면 첫 연락을 어떻게 시작해야 할까요",
          "content":"크게 싸우고 몇 달째 연락 안 하는 중임. 먼저 연락하고 싶긴 한데 또 싸울까 봐 겁나고, 너무 무겁지 않게 말 꺼내는 방법이 있으면 알고 싶음.",
          "topic":"family",
          "up_count":20,
          "down_count":0,
          "view_count":169,
          "created_at":"2026-03-12T08:45:00+09:00"
        },
        {
          "board_slug":"solutions",
          "title":"이직 준비를 들킨 뒤 회사에서 어떤 태도를 취해야 할지 고민입니다",
          "content":"면접 보고 다닌 거 팀장이 알아버린 뒤로 회사 공기 개어색함. 당장 퇴사도 못 하는데 남아 있는 동안 뭘 어떻게 해야 덜 꼬일지 모르겠네요.",
          "topic":"work",
          "up_count":26,
          "down_count":1,
          "view_count":214,
          "created_at":"2026-03-12T10:15:00+09:00"
        },
        {
          "board_slug":"solutions",
          "title":"친구에게 빌려준 돈을 감정 상하지 않게 돌려받는 방법이 있을까요",
          "content":"몇 번을 기다려줬는데 계속 다음 달에 준다만 반복함. 손절까진 하기 싫은데 더 끌리면 제가 손해라 어디까지 세게 말해야 할지 모르겠음.",
          "topic":"money",
          "up_count":17,
          "down_count":0,
          "view_count":145,
          "created_at":"2026-03-12T11:55:00+09:00"
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

  with seed_comments as (
    select
      item ->> 'title' as title,
      item ->> 'body' as body,
      (item ->> 'upvotes')::int as upvotes,
      (item ->> 'created_at')::timestamptz as created_at
    from jsonb_array_elements(
      $comments$
      [
        {
          "title":"아무렇지 않은 척했지만 사실은 축하해주기 힘들었습니다",
          "body":"축하랑 질투 같이 오는 거 생각보다 흔함. 그걸 본인이 알고 있으면 그래도 선은 안 넘고 있는 거임.",
          "upvotes":4,
          "created_at":"2026-03-12T00:50:00+09:00"
        },
        {
          "title":"가족 단톡방 알림을 일부러 무시하고 있습니다",
          "body":"답장 못 하는 게 무관심이라기보다 그냥 여유가 없는 상태 같음. 길게 말 말고 살아있다 정도만 툭 던져도 괜찮을 듯.",
          "upvotes":3,
          "created_at":"2026-03-12T02:00:00+09:00"
        },
        {
          "title":"퇴사한 동료가 부러운 마음을 숨기고 있습니다",
          "body":"부럽다고 다 못된 건 아님. 그냥 지금 내 삶이 너무 빡세서 남 선택이 더 커 보이는 걸 수도 있음.",
          "upvotes":2,
          "created_at":"2026-03-12T02:40:00+09:00"
        },
        {
          "title":"요즘은 아침에 눈뜨는 순간부터 피곤합니다",
          "body":"아침부터 방전이면 의지 문제가 아니라 그냥 많이 닳은 상태일 가능성 큼. 하루 스케줄 좀 줄여서라도 숨 돌릴 시간 만드는 게 맞아 보임.",
          "upvotes":5,
          "created_at":"2026-03-12T03:50:00+09:00"
        },
        {
          "title":"사람들 사이에 있어도 계속 혼자인 느낌이 듭니다",
          "body":"사람 많은 데 있다고 안 외로운 거 아니더라. 한 명이랑만이라도 좀 진짜 얘기하면 느낌 달라질 수도 있음.",
          "upvotes":4,
          "created_at":"2026-03-12T05:20:00+09:00"
        },
        {
          "title":"별일 아닌 말에도 자꾸 마음이 무너집니다",
          "body":"작은 말에도 데미지 크게 들어오는 시기가 있음. 예민해서라기보다 지금 마음이 많이 닳은 거일 수도 있음.",
          "upvotes":6,
          "created_at":"2026-03-12T06:40:00+09:00"
        },
        {
          "title":"월급이 들어오자마자 사라지는데 가계부부터 다시 써야 할까요",
          "body":"가계부 완벽하게 쓰려 하지 말고 고정비랑 카드 결제 예정금부터 모아보셈. 그게 현재 상태 파악 제일 빠름.",
          "upvotes":3,
          "created_at":"2026-03-12T08:00:00+09:00"
        },
        {
          "title":"부모님과 다시 대화하려면 첫 연락을 어떻게 시작해야 할까요",
          "body":"길게 쓰지 말고 짧게 안부부터 보내는 게 덜 부담일 듯. 결론은 나중 문제고 일단 대화 다시 여는 게 먼저임.",
          "upvotes":4,
          "created_at":"2026-03-12T09:15:00+09:00"
        },
        {
          "title":"이직 준비를 들킨 뒤 회사에서 어떤 태도를 취해야 할지 고민입니다",
          "body":"남아 있을 거면 일 정리부터 깔끔하게 하는 게 맞아 보임. 감정 해명보다 일정이랑 태도로 보여주는 게 더 먹힘.",
          "upvotes":5,
          "created_at":"2026-03-12T10:50:00+09:00"
        },
        {
          "title":"친구에게 빌려준 돈을 감정 상하지 않게 돌려받는 방법이 있을까요",
          "body":"관계 챙기고 싶어도 상환 일정은 박아놔야 함. 날짜랑 금액 문자로 남겨두면 감정소모 좀 줄어듦.",
          "upvotes":3,
          "created_at":"2026-03-12T12:20:00+09:00"
        }
      ]
      $comments$::jsonb
    ) as seed(item)
  )
  insert into public.comments (
    post_id,
    author_id,
    body,
    is_deleted,
    is_hidden,
    hidden_reason,
    is_anonymous,
    upvotes,
    downvotes,
    created_at,
    updated_at
  )
  select
    p.id,
    v_comment_author_id,
    sc.body,
    false,
    false,
    null,
    false,
    sc.upvotes,
    0,
    sc.created_at,
    sc.created_at
  from seed_comments sc
  join public.posts p
    on p.title = sc.title
  where not exists (
    select 1
    from public.comments c
    where c.post_id = p.id
      and c.body = sc.body
  );

  raise notice 'Done: seeded 10 posts and 10 comments for 2026-03-12.';
end
$$;
