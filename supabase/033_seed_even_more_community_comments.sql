-- ============================================================
-- 033: Seed 20 comments for community-style posts from 032
-- Re-runnable: skips rows that already exist by post/body
-- ============================================================

do $$
declare
  v_comment_author_id uuid;
begin
  select id
  into v_comment_author_id
  from public.users
  order by created_at asc
  offset 1
  limit 1;

  if v_comment_author_id is null then
    select id
    into v_comment_author_id
    from public.users
    order by created_at asc
    limit 1;
  end if;

  if v_comment_author_id is null then
    raise exception 'No users found in public.users. Create at least one user first.';
  end if;

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
          "title":"사소한 부탁도 요즘은 속으로 계산부터 하게 됩니다",
          "body":"지치면 마음보다 계산부터 들어가는 때 있음. 그게 싫어도 지금 에너지가 바닥인 상태일 수 있음.",
          "upvotes":3,
          "created_at":"2026-03-12T19:25:00+09:00"
        },
        {
          "title":"가족 모임만 다녀오면 괜히 제가 못난 사람처럼 느껴집니다",
          "body":"가족 자리인데 편한 게 아니라 작아지는 기분 드는 거 진짜 피곤하지. 다녀오고 나서 더 지치는 거 너무 이해됨.",
          "upvotes":4,
          "created_at":"2026-03-12T19:50:00+09:00"
        },
        {
          "title":"좋아하는 마음보다 외로운 마음 때문에 사람을 붙잡은 적이 있어요",
          "body":"외로우면 잃는 게 더 무섭게 느껴질 수밖에 없음. 지금이라도 그걸 똑바로 보고 있다는 게 더 중요함.",
          "upvotes":5,
          "created_at":"2026-03-12T20:15:00+09:00"
        },
        {
          "title":"후배를 챙겨주는 척하면서 속으로는 경쟁자로만 봤습니다",
          "body":"같이 일하면 응원과 경쟁심 섞이는 거 솔직히 흔함. 그걸 알고 있으면 다음 선택은 달라질 수도 있음.",
          "upvotes":3,
          "created_at":"2026-03-12T20:40:00+09:00"
        },
        {
          "title":"연락하기 싫어서 일부러 바쁜 사람처럼 굴고 있습니다",
          "body":"사람이 싫은 게 아니라 대화할 기운이 없는 날도 있음. 죄책감만 갖지 말고 지금 상태부터 보는 게 나을 듯.",
          "upvotes":4,
          "created_at":"2026-03-12T21:05:00+09:00"
        },
        {
          "title":"오늘은 웃는 표정 만드는 것도 일처럼 느껴졌어요",
          "body":"멀쩡한 척 웃는 것도 진짜 에너지 많이 먹음. 오늘은 그냥 잘 버텼다 이 말 먼저 해주고 싶음.",
          "upvotes":6,
          "created_at":"2026-03-12T21:30:00+09:00"
        },
        {
          "title":"해야 할 일은 많은데 몸이 먼저 포기한 것처럼 움직이질 않네요",
          "body":"의지 문제보다 이미 너무 많이 쓴 상태 같음. 할 일 다 보지 말고 오늘 꼭 하나만 하는 식으로 줄여보셈.",
          "upvotes":5,
          "created_at":"2026-03-12T21:55:00+09:00"
        },
        {
          "title":"친구들 사이에 있어도 자꾸만 제가 붕 뜬 사람처럼 느껴져요",
          "body":"같이 있어도 혼자 같은 느낌 드는 사람 생각보다 많음. 너무 본인 이상하다고 몰아가지 마셈.",
          "upvotes":4,
          "created_at":"2026-03-12T22:20:00+09:00"
        },
        {
          "title":"작은 실수 하나에도 하루 종일 머릿속에서 반복 재생됩니다",
          "body":"실수보다 그 장면 계속 돌려보는 게 더 사람 지치게 함. 그럴수록 자책으로 안 넘어가게 끊는 게 중요함.",
          "upvotes":4,
          "created_at":"2026-03-12T22:45:00+09:00"
        },
        {
          "title":"누가 다정하게 대해줘도 바로 믿기보다 경계부터 하게 됩니다",
          "body":"다정함 앞에서 경계부터 드는 거 오히려 자연스러운 반응일 수 있음. 너무 본인 차갑다고만 보지 마셈.",
          "upvotes":3,
          "created_at":"2026-03-12T23:10:00+09:00"
        },
        {
          "title":"하루 종일 아무것도 못 했는데 이상하게 더 피곤하기만 합니다",
          "body":"아무것도 안 한 게 아니라 계속 마음으로 버틴 걸 수도 있음. 그런 피로가 제일 설명 안 돼서 더 답답하지.",
          "upvotes":4,
          "created_at":"2026-03-12T23:35:00+09:00"
        },
        {
          "title":"누구한테 먼저 연락하고 싶은데 괜히 민폐일까 봐 참게 돼요",
          "body":"상대가 싫어할까 봐 먼저 접는 마음 외로울수록 더 심해지더라. 가벼운 안부 정도는 생각보다 안 부담일 수도 있음.",
          "upvotes":5,
          "created_at":"2026-03-13T00:00:00+09:00"
        },
        {
          "title":"퇴사까지는 못 하겠고 일단 버틸 힘부터 만들고 싶은데 뭘 해야 할까요",
          "body":"당장 못 나가면 하루 회복 루틴부터 만드는 게 생각보다 중요함. 퇴근 후 업무 생각 끊는 기준 하나라도 먼저 잡아보셈.",
          "upvotes":6,
          "created_at":"2026-03-13T00:25:00+09:00"
        },
        {
          "title":"돈 문제를 연인에게 언제, 어떻게 말해야 덜 늦을까요",
          "body":"금액이랑 상황 먼저 정리하고 말하는 게 덜 흔들림. 미안하단 말만 하지 말고 앞으로 어떻게 할지도 같이 말하는 게 중요함.",
          "upvotes":4,
          "created_at":"2026-03-13T00:50:00+09:00"
        },
        {
          "title":"감정이 격해질 때마다 말실수하는 버릇을 고치고 싶습니다",
          "body":"욱할 때 바로 안 뱉게 물리적으로 끊는 장치가 필요할 수도 있음. 잠깐 자리 뜨기나 적어놓고 안 보내기 이런 게 은근 도움 됨.",
          "upvotes":4,
          "created_at":"2026-03-13T01:15:00+09:00"
        },
        {
          "title":"부모님 잔소리에 무너지지 않고 선 긋는 방법이 있을까요",
          "body":"설득하려 들기보다 같은 문장으로 선 계속 알려주는 게 덜 소모되더라. 감정 설명보다 기준 전달이 더 먹힐 때 많음.",
          "upvotes":5,
          "created_at":"2026-03-13T01:40:00+09:00"
        },
        {
          "title":"생활 패턴이 완전히 무너졌는데 어디서부터 다시 맞춰야 할까요",
          "body":"한 번에 다 고치려 하지 말고 기상 시간 하나만 먼저 고정해보셈. 시작점 크면 오히려 더 못 하게 됨.",
          "upvotes":3,
          "created_at":"2026-03-13T02:05:00+09:00"
        },
        {
          "title":"친구가 자꾸 선 넘는 농담을 하는데 어떻게 말해야 할까요",
          "body":"그때 웃어넘겼어도 나중에 따로 말해도 안 늦음. 장난이어도 난 불편했다 이런 식으로 짧게 말하는 게 오히려 덜 싸움.",
          "upvotes":4,
          "created_at":"2026-03-13T02:30:00+09:00"
        },
        {
          "title":"이직 준비가 너무 막막해서 작은 단계라도 정하고 싶어요",
          "body":"한 번에 다 하려면 시작도 못 함. 이번 주는 이력서 한 항목만 본다 이런 식으로 쪼개는 게 현실적임.",
          "upvotes":5,
          "created_at":"2026-03-13T02:55:00+09:00"
        },
        {
          "title":"혼자 있는 시간이 길어질수록 더 사람 만나는 게 어려워집니다",
          "body":"갑자기 약속 여러 개 잡지 말고 짧게 볼 한 사람부터 떠올려보셈. 관계 감각도 체력처럼 조금씩 돌아오는 느낌 있음.",
          "upvotes":4,
          "created_at":"2026-03-13T03:20:00+09:00"
        },
        {
          "title":"충동적으로 쓰는 돈을 줄이려면 감정 관리부터 해야 할까요",
          "body":"예산표보다 어떤 감정일 때 긁는지 먼저 보는 게 도움 됐음. 결제 전에 10분만 미루는 규칙도 생각보다 효과 있더라.",
          "upvotes":5,
          "created_at":"2026-03-13T03:45:00+09:00"
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

  raise notice 'Done: seeded 20 comments for community-style posts.';
end
$$;
