-- ============================================================
-- 018: All-in-one setup (run this if 015, 016 were not applied)
-- Adds missing columns + seeds 10 posts
-- ============================================================

-- 1) is_hidden / hidden_reason columns (from 015)
alter table public.posts
  add column if not exists is_hidden boolean not null default false,
  add column if not exists hidden_reason text;

alter table public.comments
  add column if not exists is_hidden boolean not null default false,
  add column if not exists hidden_reason text;

-- 2) images column (from 016)
alter table public.posts
  add column if not exists images text[] not null default '{}';

-- 3) Seed 10 posts
do $$
declare
  v_author_id     uuid;
  v_confession_id uuid;
  v_comfort_id    uuid;
  v_solutions_id  uuid;
begin
  select id into v_author_id from public.users order by created_at asc limit 1;
  if v_author_id is null then raise exception 'No users found.'; end if;

  select id into v_confession_id from public.boards where slug = 'confession' limit 1;
  select id into v_comfort_id    from public.boards where slug = 'comfort'    limit 1;
  select id into v_solutions_id  from public.boards where slug = 'solutions'  limit 1;

  if v_confession_id is null or v_comfort_id is null or v_solutions_id is null then
    raise exception 'Required boards missing.';
  end if;

  -- 고해성사
  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, created_at)
  values (v_confession_id, v_author_id, '10년 전 친구에게 거짓말을 한 게 아직도 걸려요',
    '고등학교 때 친한 친구의 일기장을 몰래 읽은 적이 있습니다. 그때 읽은 내용이 친구를 힘들게 했던 거였는데, 저는 아무것도 모른 척하고 그냥 넘겼어요. 그 친구는 지금 연락이 끊겼고, 종종 그 일이 생각납니다. 고백하고 나면 조금은 가벼워질까요.',
    false, true, 31, 1, 240, now() - interval '6 days');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, created_at)
  values (v_confession_id, v_author_id, '부모님한테 용돈을 받으면서 취직했다고 거짓말했습니다',
    '백수인 걸 들키기 싫어서 취직했다고 했습니다. 벌써 8개월째 이 거짓말을 유지하고 있는데, 이제는 너무 지쳤습니다. 어떻게 털어놓아야 할지 모르겠어요.',
    false, true, 18, 2, 185, now() - interval '5 days');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, created_at)
  values (v_confession_id, v_author_id, '친구의 남자친구가 다른 여자와 카페에 있는 걸 봤어요',
    '분명히 아는 사이 같았고, 꽤 친밀해 보였습니다. 친구한테 말해야 할지 말아야 할지 2주째 고민 중입니다. 말했다가 괜한 사이가 될까봐 무서워요.',
    false, true, 44, 3, 412, now() - interval '4 days');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, created_at)
  values (v_confession_id, v_author_id, '사실 저는 주변 사람들이 다 부럽습니다',
    '겉으로는 괜찮은 척하지만 사실 SNS에서 친구들 일상을 볼 때마다 배가 아픕니다. 여행도 가고, 연애도 하고, 승진도 하는 것 같은데 저만 제자리인 느낌이에요. 이런 감정이 드는 제가 나쁜 사람인 건지 모르겠습니다.',
    false, true, 27, 0, 296, now() - interval '3 days');

  -- 위로받고 싶어요
  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, created_at)
  values (v_comfort_id, v_author_id, '퇴사하고 나서 아무것도 하기가 싫어요',
    '3년 다닌 회사를 지난달에 그만뒀는데 막상 쉬니까 더 힘드네요. 뭘 해야 할지 모르겠고, 하루 종일 누워만 있는 날이 많아졌습니다. 이게 정상인지, 아니면 뭔가 잘못된 건지 모르겠어요.',
    false, false, 55, 2, 489, now() - interval '7 days');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, created_at)
  values (v_comfort_id, v_author_id, '30대가 됐는데 아직도 뭘 좋아하는지 모르겠어요',
    '어릴 때부터 남들이 원하는 모습으로만 살아온 것 같습니다. 취업도 부모님이 좋아하는 직종으로, 결혼도 주변에서 괜찮다고 하는 사람으로. 정작 제가 뭘 원하는지는 물어본 적이 없었던 것 같아요.',
    false, false, 63, 1, 571, now() - interval '5 days');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, created_at)
  values (v_comfort_id, v_author_id, '가장 친한 친구가 저를 무시하는 것 같아요',
    '예전부터 내 말을 끊고 자기 얘기만 하는 편이었는데, 요즘은 단체 채팅방에서 제 말만 씹히는 게 눈에 보입니다. 기분 탓인지 진짜인지 모르겠어서 더 힘들어요.',
    false, false, 38, 4, 335, now() - interval '2 days');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, created_at)
  values (v_comfort_id, v_author_id, '매일 아침 일어나는 게 무서워요',
    '특별히 나쁜 일이 있는 건 아닌데 아침이 되면 오늘 하루를 어떻게 버티나 싶습니다. 직장도 있고 가족도 있는데 왜 이러는지 저도 이해가 안 돼요. 그냥 누군가가 괜찮다고 말해줬으면 합니다.',
    false, true, 72, 0, 643, now() - interval '1 day');

  -- 해결책
  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, created_at)
  values (v_solutions_id, v_author_id, '부모님 노후 자금 문제, 어떻게 대화를 꺼내야 할까요',
    '부모님이 60대 초반인데 노후 준비가 전혀 안 되어 있다는 걸 최근에 알게 됐습니다. 제가 먼저 꺼내면 상처받을까봐 걱정되고, 안 꺼내면 나중에 더 힘들어질 것 같고. 이런 주제를 부모님과 어떻게 자연스럽게 이야기하셨는지 경험 있으신 분 계시면 조언 부탁드립니다.',
    false, false, 29, 1, 274, now() - interval '4 days');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, created_at)
  values (v_solutions_id, v_author_id, '직장 내 괴롭힘인지 아닌지 판단이 안 돼요',
    '팀장이 회의 중에 제 의견만 무시하고, 메신저 답장도 저한테만 느리게 합니다. 다른 팀원들한테는 친절한데 저한테만 유독 차갑습니다. 이 정도면 노동청에 신고할 수 있는 수준인지, 아니면 제가 예민한 건지 판단이 안 서서요. 비슷한 경험 있으신 분 계신가요.',
    false, false, 41, 2, 388, now() - interval '2 days');

  raise notice 'Done: columns added + 10 posts inserted.';
end $$;
