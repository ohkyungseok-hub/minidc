-- ============================================================
-- 031: Seed 10 comments for community-style posts from 030
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
          "title":"친한 사람 힘든 얘기를 들으면서 속으로는 빨리 끝나길 바랐어요",
          "body":"본인도 방전이면 남 얘기 듣는 거 자체가 노동일 수 있음. 계속 걸린다는 거 보면 아주 무심한 사람은 아닌 거지.",
          "upvotes":4,
          "created_at":"2026-03-12T13:35:00+09:00"
        },
        {
          "title":"부모님 걱정할까 봐 괜찮다고만 했는데 사실은 하나도 안 괜찮습니다",
          "body":"괜찮다고 하는 게 습관 되면 진짜 힘들 때도 그 말부터 튀어나옴. 너무 오래 혼자 끌고 가지 마셈.",
          "upvotes":5,
          "created_at":"2026-03-12T14:05:00+09:00"
        },
        {
          "title":"잘되는 친구 옆에서 자꾸만 제 인생 점수부터 매기게 됩니다",
          "body":"비교하고 싶어서가 아니라 지칠수록 자동으로 그렇게 됨. 그걸로 본인 너무 까지 마셈.",
          "upvotes":3,
          "created_at":"2026-03-12T14:30:00+09:00"
        },
        {
          "title":"사소한 연락 하나 답장하는 것도 오늘은 너무 버겁네요",
          "body":"답장 몇 줄도 버거운 날 진짜 있음. 그런 사람 생각보다 많고 오늘은 예의보다 본인 상태부터 챙기는 게 맞을 수도 있음.",
          "upvotes":6,
          "created_at":"2026-03-12T15:00:00+09:00"
        },
        {
          "title":"퇴근하고 나면 누구랑도 말하고 싶지 않은데 또 너무 외롭습니다",
          "body":"사람이 싫다기보다 에너지가 바닥난 상태 같음. 혼자 있고 싶은데 또 누가 알아줬으면 하는 거 하나도 안 이상함.",
          "upvotes":5,
          "created_at":"2026-03-12T15:40:00+09:00"
        },
        {
          "title":"다들 잘 버티는 것 같은데 저만 자꾸 일상에서 미끄러지는 기분이에요",
          "body":"남들 다 하는 기본이 왜 나만 안 되냐 싶을 때 제일 현타 오지. 근데 그럴수록 게으름보다 방전 먼저 의심하는 게 맞는 듯.",
          "upvotes":4,
          "created_at":"2026-03-12T16:20:00+09:00"
        },
        {
          "title":"잘 쉬고 와도 하나도 회복된 느낌이 없는 날이 계속됩니다",
          "body":"쉰 시간보다 이미 쌓인 피로가 더 큰 상태일 수 있음. 회복 안 된다고 바로 본인 망가졌다고 단정하진 마셈.",
          "upvotes":4,
          "created_at":"2026-03-12T17:00:00+09:00"
        },
        {
          "title":"생활비 줄여보려는데 어디부터 손대야 덜 무너질까요",
          "body":"체감상 큰 고정비부터 보는 게 제일 빨랐음. 식비부터 죄지 말고 자동결제랑 새는 돈부터 잡는 게 덜 빡셈.",
          "upvotes":3,
          "created_at":"2026-03-12T17:35:00+09:00"
        },
        {
          "title":"멀어진 친구에게 먼저 연락하고 싶은데 무슨 말부터 해야 할지 모르겠습니다",
          "body":"길게 쓰지 말고 그냥 생각나서 연락했다고 시작하는 게 나을 수도 있음. 첫 톡에서 다 정리하려 하면 더 무거워짐.",
          "upvotes":5,
          "created_at":"2026-03-12T18:10:00+09:00"
        },
        {
          "title":"회사에서 자꾸 위축되는데 이직 말고 버티는 방법도 있을까요",
          "body":"당장 못 나가면 하루에 하나만 덜 무너지는 기준부터 잡아보셈. 피드백이랑 내 가치 분리하는 연습이 은근 도움 됐음.",
          "upvotes":6,
          "created_at":"2026-03-12T18:45:00+09:00"
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

  raise notice 'Done: seeded 10 comments for community-style posts.';
end
$$;
