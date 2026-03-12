-- ============================================================
-- 032: Seed 20 more community-style posts for 2026-03-12
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
          "title":"사소한 부탁도 요즘은 속으로 계산부터 하게 됩니다",
          "content":"예전엔 그냥 해줬을 일도 요즘은 이걸 내가 왜 하지, 나만 손해 아닌가 계산부터 들어감. 사람을 너무 손익으로 보는 것 같아서 스스로 좀 별로임.",
          "topic":"relationship",
          "up_count":14,
          "down_count":0,
          "view_count":121,
          "created_at":"2026-03-12T19:05:00+09:00"
        },
        {
          "board_slug":"confession",
          "title":"가족 모임만 다녀오면 괜히 제가 못난 사람처럼 느껴집니다",
          "content":"누가 대놓고 뭐라 한 것도 아닌데 모임 다녀오면 제 처지 하나하나 뜯어보게 됨. 가족인데 편한 게 아니라 비교당하는 기분부터 드는 게 진짜 싫음.",
          "topic":"family",
          "up_count":18,
          "down_count":1,
          "view_count":168,
          "created_at":"2026-03-12T19:30:00+09:00"
        },
        {
          "board_slug":"confession",
          "title":"좋아하는 마음보다 외로운 마음 때문에 사람을 붙잡은 적이 있어요",
          "content":"진짜 좋아해서라기보다 혼자 있기 싫어서 붙잡고 있었던 적 있음. 그땐 그게 사랑인 줄 알았는데 지금 생각하면 그냥 제 외로움 채우려고 한 거라 미안함.",
          "topic":"relationship",
          "up_count":20,
          "down_count":0,
          "view_count":173,
          "created_at":"2026-03-12T19:55:00+09:00"
        },
        {
          "board_slug":"confession",
          "title":"후배를 챙겨주는 척하면서 속으로는 경쟁자로만 봤습니다",
          "content":"겉으론 챙겨주는 척했는데 속으론 쟤가 나보다 더 치고 올라올까 봐 계속 신경 쓰였음. 착한 선배 코스프레하면서도 속은 더러워서 찝찝함.",
          "topic":"work",
          "up_count":16,
          "down_count":0,
          "view_count":136,
          "created_at":"2026-03-12T20:20:00+09:00"
        },
        {
          "board_slug":"confession",
          "title":"연락하기 싫어서 일부러 바쁜 사람처럼 굴고 있습니다",
          "content":"진짜 바쁜 날도 있지만 아닌 날에도 답장 미루고 늦게 본 척함. 사람 싫어서가 아니라 말 이어갈 힘이 없어서 그러는 건데 상대는 서운할 것 같아 마음이 좀 무거움.",
          "topic":"anxiety",
          "up_count":13,
          "down_count":0,
          "view_count":117,
          "created_at":"2026-03-12T20:45:00+09:00"
        },
        {
          "board_slug":"comfort",
          "title":"오늘은 웃는 표정 만드는 것도 일처럼 느껴졌어요",
          "content":"회사에서 무표정도 눈치 보여서 계속 괜찮은 척 웃었는데 퇴근하니까 얼굴 근육까지 아픈 느낌임. 별일 없었다 하기엔 하루가 너무 길었음.",
          "topic":"anxiety",
          "up_count":27,
          "down_count":0,
          "view_count":226,
          "created_at":"2026-03-12T21:10:00+09:00"
        },
        {
          "board_slug":"comfort",
          "title":"해야 할 일은 많은데 몸이 먼저 포기한 것처럼 움직이질 않네요",
          "content":"머리로는 해야 되는 거 아는데 몸은 이미 끝났다는 듯이 누워만 있고 싶음. 이게 의지 박살난 건지 그냥 완전 방전된 건지 구분이 안 가서 더 무기력함.",
          "topic":"anxiety",
          "up_count":31,
          "down_count":1,
          "view_count":248,
          "created_at":"2026-03-12T21:35:00+09:00"
        },
        {
          "board_slug":"comfort",
          "title":"친구들 사이에 있어도 자꾸만 제가 붕 뜬 사람처럼 느껴져요",
          "content":"대화도 하고 웃기도 했는데 이상하게 저는 그 자리에 끝까지 못 섞인 느낌임. 집 오면 오늘도 또 혼자 겉돌았다는 생각만 오래 남음.",
          "topic":"loneliness",
          "up_count":22,
          "down_count":0,
          "view_count":182,
          "created_at":"2026-03-12T22:00:00+09:00"
        },
        {
          "board_slug":"comfort",
          "title":"작은 실수 하나에도 하루 종일 머릿속에서 반복 재생됩니다",
          "content":"남들은 금방 잊을 일 같은데 저만 그 장면 계속 복기함. 그냥 다음에 조심하면 되는데 왜 맨날 저라는 사람 전체가 문제인 느낌으로 가는지 모르겠음.",
          "topic":"anxiety",
          "up_count":25,
          "down_count":0,
          "view_count":214,
          "created_at":"2026-03-12T22:25:00+09:00"
        },
        {
          "board_slug":"comfort",
          "title":"누가 다정하게 대해줘도 바로 믿기보다 경계부터 하게 됩니다",
          "content":"좋게 말해주는 거 알아도 속으로 한 번 더 의심하게 됨. 사람을 너무 못 믿는 것 같아 미안한데 또 상처받을까 봐 겁도 남.",
          "topic":"relationship",
          "up_count":21,
          "down_count":0,
          "view_count":175,
          "created_at":"2026-03-12T22:50:00+09:00"
        },
        {
          "board_slug":"comfort",
          "title":"하루 종일 아무것도 못 했는데 이상하게 더 피곤하기만 합니다",
          "content":"몸 쓴 것도 아닌데 하루 끝나면 녹초 느낌임. 쉰 것도 아니고 일한 것도 아닌 애매한 날만 쌓이니까 더 무력해지는 것 같음.",
          "topic":"anxiety",
          "up_count":24,
          "down_count":0,
          "view_count":199,
          "created_at":"2026-03-12T23:15:00+09:00"
        },
        {
          "board_slug":"comfort",
          "title":"누구한테 먼저 연락하고 싶은데 괜히 민폐일까 봐 참게 돼요",
          "content":"그냥 오늘 어땠냐고 묻고 제 얘기도 좀 하고 싶은데 괜히 부담 줄까 봐 쓰다 지움. 그러다 보면 또 혼자 남는 기분만 더 심해짐.",
          "topic":"loneliness",
          "up_count":23,
          "down_count":0,
          "view_count":188,
          "created_at":"2026-03-12T23:40:00+09:00"
        },
        {
          "board_slug":"solutions",
          "title":"퇴사까지는 못 하겠고 일단 버틸 힘부터 만들고 싶은데 뭘 해야 할까요",
          "content":"회사가 막 헬은 아닌데 제가 너무 쉽게 흔들리고 소모되는 상태임. 당장 못 나가면 하루 덜 망치면서 버틸 현실적인 루틴 같은 게 있을까요.",
          "topic":"work",
          "up_count":28,
          "down_count":0,
          "view_count":235,
          "created_at":"2026-03-13T00:05:00+09:00"
        },
        {
          "board_slug":"solutions",
          "title":"돈 문제를 연인에게 언제, 어떻게 말해야 덜 늦을까요",
          "content":"숨기려던 건 아닌데 타이밍 놓치다 보니 점점 더 말 못 하게 됨. 더 늦기 전에 말해야 하는 건 아는데 첫 마디가 진짜 안 나옴.",
          "topic":"money",
          "up_count":19,
          "down_count":0,
          "view_count":167,
          "created_at":"2026-03-13T00:30:00+09:00"
        },
        {
          "board_slug":"solutions",
          "title":"감정이 격해질 때마다 말실수하는 버릇을 고치고 싶습니다",
          "content":"평소엔 참다가도 욱하는 순간 꼭 선 넘는 말이 튀어나옴. 지나고 나면 미안한데 이미 상처는 남아 있고 관계는 싸해져서 이 패턴 끊고 싶음.",
          "topic":"relationship",
          "up_count":22,
          "down_count":0,
          "view_count":180,
          "created_at":"2026-03-13T00:55:00+09:00"
        },
        {
          "board_slug":"solutions",
          "title":"부모님 잔소리에 무너지지 않고 선 긋는 방법이 있을까요",
          "content":"한 번 들으면 멘탈 흔들리고 끊고 나서도 한참 다운됨. 무작정 참는 것도 아니고 바로 싸우는 것도 아닌 식으로 선 긋는 법이 궁금함.",
          "topic":"family",
          "up_count":24,
          "down_count":0,
          "view_count":198,
          "created_at":"2026-03-13T01:20:00+09:00"
        },
        {
          "board_slug":"solutions",
          "title":"생활 패턴이 완전히 무너졌는데 어디서부터 다시 맞춰야 할까요",
          "content":"자는 시간 먹는 시간 집중하는 시간 다 박살남. 한 번에 다 고치려니 더 못 하겠고, 그렇다고 냅두면 계속 무너질 것 같아서 제일 먼저 손댈 한 가지가 뭔지 궁금함.",
          "topic":"anxiety",
          "up_count":20,
          "down_count":0,
          "view_count":171,
          "created_at":"2026-03-13T01:45:00+09:00"
        },
        {
          "board_slug":"solutions",
          "title":"친구가 자꾸 선 넘는 농담을 하는데 어떻게 말해야 할까요",
          "content":"그때그때 웃고 넘겼더니 상대가 선을 아예 모르게 된 느낌임. 손절까진 아니고 그냥 불편하다고 말하고 싶은데 분위기 안 터뜨리고 말하는 법 있을까요.",
          "topic":"relationship",
          "up_count":18,
          "down_count":0,
          "view_count":163,
          "created_at":"2026-03-13T02:10:00+09:00"
        },
        {
          "board_slug":"solutions",
          "title":"이직 준비가 너무 막막해서 작은 단계라도 정하고 싶어요",
          "content":"퇴사 욕구는 큰데 막상 뭘 먼저 해야 할지 정리가 안 돼서 계속 제자리걸음임. 이력서든 포폴이든 순서를 어떻게 끊어야 덜 막막할지 궁금함.",
          "topic":"work",
          "up_count":26,
          "down_count":0,
          "view_count":219,
          "created_at":"2026-03-13T02:35:00+09:00"
        },
        {
          "board_slug":"solutions",
          "title":"혼자 있는 시간이 길어질수록 더 사람 만나는 게 어려워집니다",
          "content":"외로워서 사람 만나야 할 것 같은데 막상 약속 잡으려면 너무 어색하고 피곤함. 무리 안 하고 관계 다시 늘리는 방법 있을까요.",
          "topic":"loneliness",
          "up_count":23,
          "down_count":0,
          "view_count":186,
          "created_at":"2026-03-13T03:00:00+09:00"
        },
        {
          "board_slug":"solutions",
          "title":"충동적으로 쓰는 돈을 줄이려면 감정 관리부터 해야 할까요",
          "content":"필요해서 쓰는 돈보다 기분 다운될 때 긁는 경우가 더 많음. 예산표가 문제인지, 감정 타서 쓰는 패턴부터 잡아야 하는 건지 헷갈림.",
          "topic":"money",
          "up_count":25,
          "down_count":0,
          "view_count":207,
          "created_at":"2026-03-13T03:25:00+09:00"
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

  raise notice 'Done: seeded 20 more community-style posts.';
end
$$;
