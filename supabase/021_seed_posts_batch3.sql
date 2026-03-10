-- ============================================================
-- Seed 021: 100 more sample posts (batch 3)
-- confession 35 / comfort 35 / solutions 30
-- ~30 posts include picsum.photos images
-- ============================================================
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

  -- ── 고해성사 (confession) 35개 ─────────────────────────────────

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_confession_id, v_author_id,
    '친구의 비밀을 다른 친구에게 말해버렸습니다',
    '절대 말하지 말라고 했던 친구의 비밀을 술자리에서 그만 흘리고 말았습니다. 아직 그 친구는 모르는 것 같은데, 언제 알게 될까 봐 만날 때마다 가슴이 두근거립니다. 진심으로 미안한데 직접 고백할 용기가 없습니다.',
    false, true, 45, 3, 512,
    array['https://picsum.photos/seed/secret/800/500'],
    now() - interval '29 days');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_confession_id, v_author_id,
    '회사 물건을 몰래 집에 가져간 적이 있습니다',
    '소모품이라 괜찮겠지 생각하고 회사 물건을 몇 가지 집으로 가져갔습니다. 시간이 지나서 보니 습관처럼 되어 있었고, 지금은 너무 부끄럽습니다. 반납하려 해도 어떻게 돌려줘야 할지 방법을 모르겠습니다.',
    false, true, 33, 5, 378,
    '{}',
    now() - interval '28 days');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_confession_id, v_author_id,
    '사귀는 사람이 있는데 다른 사람과 밥을 먹으면서 사귀는 것처럼 행동했습니다',
    '그냥 친구라고 생각했는데 상대방이 오해하도록 행동했습니다. 지금 만나는 사람한테 너무 미안하고, 그냥 밥 한 끼인데 왜 그랬는지 스스로도 이해가 안 됩니다. 고백해야 할까요 아니면 그냥 넘어가야 할까요.',
    false, true, 61, 7, 643,
    '{}',
    now() - interval '27 days');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_confession_id, v_author_id,
    '형제한테 빌린 돈을 일부러 늦게 갚고 있습니다',
    '여유가 조금 생겼는데도 다른 곳에 먼저 쓰고 형 돈은 나중에 갚을 생각을 하고 있습니다. 형은 재촉 한 번 없이 기다리고 있는데 그게 더 마음에 걸립니다. 미루는 자신이 싫습니다.',
    false, true, 28, 2, 319,
    '{}',
    now() - interval '26 days');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_confession_id, v_author_id,
    '대학교 시험에서 컨닝을 했고 그게 없었으면 떨어졌을 것 같습니다',
    '지금은 그 과목이 제 전공의 핵심인데, 기초를 제대로 공부하지 않고 넘어온 게 계속 발목을 잡습니다. 당시에 들켰으면 더 나은 선택을 했을지도 모르겠다는 생각이 듭니다.',
    false, true, 37, 4, 421,
    array['https://picsum.photos/seed/study/800/500'],
    now() - interval '25 days');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_confession_id, v_author_id,
    '친구가 좋아하는 사람한테 저도 고백한 적이 있습니다',
    '친구가 좋아한다고 이야기해줬는데, 저도 감정이 생겨버려서 결국 먼저 고백했습니다. 그 사람이 저를 선택했고 친구는 표현하지 않았지만 멀어졌습니다. 지금도 가끔 그때를 생각하면 미안합니다.',
    false, true, 54, 9, 587,
    '{}',
    now() - interval '24 days');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_confession_id, v_author_id,
    '직장에서 다른 사람 아이디어를 제 것처럼 발표한 적이 있습니다',
    '회의 전날 동료가 가볍게 언급한 아이디어를 다음 날 제가 먼저 발표해버렸습니다. 상사에게 칭찬받았지만 동료 얼굴이 굳는 걸 봤습니다. 그 이후로 동료가 저를 멀리하고 있고, 솔직히 당연하다고 생각합니다.',
    false, true, 69, 6, 712,
    array['https://picsum.photos/seed/meeting/800/500'],
    now() - interval '23 days');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_confession_id, v_author_id,
    '입원한 부모님이 걱정되면서도 귀찮다는 감정도 들었습니다',
    '병원에 가야 한다는 걸 알면서도 바쁘다는 핑계로 계속 미뤘습니다. 면회를 갔을 때 보셨던 부모님 표정이 머릿속에서 지워지지 않습니다. 걱정과 귀찮음이 동시에 드는 제가 나쁜 자식 같습니다.',
    false, true, 48, 1, 524,
    '{}',
    now() - interval '22 days');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_confession_id, v_author_id,
    '길에서 지갑을 주웠는데 현금만 쓰고 버렸습니다',
    '10년도 더 지난 일인데 아직도 그 지갑이 생각납니다. 당시에는 내가 더 힘들다고 합리화했는데, 잃어버린 분이 얼마나 급했을지는 그때 생각을 못 했습니다. 용서받을 수 없다는 걸 알지만 어딘가에 고백하고 싶었습니다.',
    false, true, 41, 3, 463,
    array['https://picsum.photos/seed/wallet/800/500'],
    now() - interval '21 days');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_confession_id, v_author_id,
    '남자친구한테 전 직장을 다른 회사라고 숨겼습니다',
    '만났을 때 직장이 너무 작아서 부끄러워서 거짓말을 했는데, 지금은 더 좋은 곳에 다니고 있어도 그 거짓말을 정정하지 못하고 있습니다. 들키면 신뢰 자체가 흔들릴 것 같아서 두렵습니다.',
    false, true, 39, 2, 432,
    '{}',
    now() - interval '20 days');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_confession_id, v_author_id,
    '친한 친구의 연인을 사실 좋아했던 적이 있습니다',
    '친구가 소개해줬을 때부터 감정이 생겼지만 절대 내색하지 않았습니다. 그 감정을 정리하는 데 2년이 걸렸고, 지금은 괜찮지만 그때 제 마음이 얼마나 더러웠는지를 고백하고 싶었습니다.',
    false, true, 52, 4, 571,
    '{}',
    now() - interval '19 days');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_confession_id, v_author_id,
    '힘들다는 친구에게 진심이 아닌 위로를 건넨 적이 있습니다',
    '그때 제가 여유가 없어서 친구 이야기에 집중을 못 했습니다. 마음에도 없는 말로 대충 위로하고 전화를 끊었는데, 그 친구가 지금도 가끔 그 통화를 고마웠다고 말할 때마다 가슴이 아픕니다.',
    false, true, 44, 0, 487,
    '{}',
    now() - interval '18 days');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_confession_id, v_author_id,
    '가족 사진을 SNS에 허락 없이 올렸다가 삭제했습니다',
    '예쁜 사진이라 그냥 올렸는데, 가족 중 한 명이 해당 사진이 없어지길 원한다는 걸 나중에 알았습니다. 물어보지 않고 멋대로 올린 것도 미안하고, 상처를 줬다는 것도 미안합니다.',
    false, true, 27, 1, 302,
    array['https://picsum.photos/seed/family/800/500'],
    now() - interval '17 days');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_confession_id, v_author_id,
    '취업 면접에서 없는 자격증을 있다고 했습니다',
    '서류 합격 후 면접에서 자격증이 있냐는 질문에 순간 거짓말을 해버렸고 합격이 됐습니다. 입사 후 3년이 지났는데 아직도 그 거짓말이 들킬까봐 긴장이 됩니다.',
    false, true, 56, 8, 614,
    '{}',
    now() - interval '16 days');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_confession_id, v_author_id,
    '상대 탓으로만 돌렸던 이별이 사실 제 잘못이었습니다',
    '헤어지고 나서 2년 동안 전 연인을 나쁜 사람으로 기억했는데, 최근에 생각해보니 제가 더 문제였다는 걸 인정하게 됐습니다. 지금도 어딘가에서 저를 나쁜 사람으로 기억하겠지만 사과할 방법이 없어서 괴롭습니다.',
    false, true, 63, 5, 692,
    '{}',
    now() - interval '15 days');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_confession_id, v_author_id,
    '직장 동료가 실수했을 때 속으로 기뻤습니다',
    '평소에 저보다 잘한다고 느껴서 은근히 경쟁심이 있었던 동료인데, 큰 실수를 했을 때 안타까운 척하면서 속으로 안도했습니다. 그런 감정이 드는 제가 싫습니다.',
    false, true, 35, 3, 398,
    '{}',
    now() - interval '14 days');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_confession_id, v_author_id,
    '헤어진 연인의 SNS를 매일 몰래 봅니다',
    '헤어진 지 1년이 넘었는데 계정을 차단하지 못하고 매일 확인하고 있습니다. 잘 살고 있는 모습을 보면 기쁘기도 하고 씁쓸하기도 합니다. 이 습관을 어떻게 끊어야 할지 모르겠습니다.',
    false, true, 71, 2, 745,
    array['https://picsum.photos/seed/phone/800/500'],
    now() - interval '13 days');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_confession_id, v_author_id,
    '오해를 받았을 때 해명 대신 다른 사람에게 책임을 돌렸습니다',
    '분명히 공동 작업이었는데 문제가 생기자 제 몫을 최소화하고 다른 팀원이 원인인 것처럼 이야기했습니다. 그 사람은 아직도 그 일 때문에 평가가 안 좋습니다. 용기가 없어서 지금도 말 못 하고 있습니다.',
    false, true, 47, 4, 516,
    '{}',
    now() - interval '12 days');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_confession_id, v_author_id,
    '누군가 힘들다고 했을 때 피하고 싶다는 생각이 먼저 들었습니다',
    '친구가 전화해서 힘들다고 했을 때, 걱정보다 귀찮다는 감정이 먼저 올라왔습니다. 결국 받았지만 그 순간의 제 솔직한 마음이 부끄럽습니다. 나쁜 사람인 건 아닌지 걱정됩니다.',
    false, true, 40, 2, 451,
    '{}',
    now() - interval '11 days');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_confession_id, v_author_id,
    '절친했던 친구와의 연락을 제가 먼저 끊었습니다',
    '특별한 싸움이 있었던 건 아닌데 어느 시점부터 연락을 줄이다가 그냥 멀어졌습니다. 그 친구가 연락을 계속 시도했는데 답장을 안 했고, 이제는 너무 오래돼서 다시 연락하기도 어색합니다.',
    false, true, 32, 1, 363,
    '{}',
    now() - interval '10 days');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_confession_id, v_author_id,
    '나쁜 소문이 퍼지는 걸 알고도 막지 않았습니다',
    '제 지인에 대한 사실이 아닌 소문이 퍼지는 걸 알았는데, 관계가 복잡해질까봐 바로잡지 않았습니다. 그 소문 때문에 지인이 힘들어했다는 걸 나중에 알게 됐습니다. 방관자였던 제가 싫습니다.',
    false, true, 38, 2, 419,
    '{}',
    now() - interval '9 days' - interval '12 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_confession_id, v_author_id,
    '부모님께 10년째 숨기고 있는 사고가 있습니다',
    '대학 때 작은 접촉사고를 냈는데 겁이 나서 부모님께 말씀드리지 못했습니다. 지금도 차를 타면 그 날이 생각나고, 말씀드리기에 너무 오랜 시간이 지나버렸습니다.',
    false, true, 29, 1, 334,
    array['https://picsum.photos/seed/road/800/500'],
    now() - interval '8 days' - interval '6 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_confession_id, v_author_id,
    '친구 결혼식 날 진심으로 축하하지 않았습니다',
    '저는 아직 혼자인데 친구는 결혼을 하게 됐고, 웃으며 축하했지만 솔직히 마음이 복잡했습니다. 사진도 찍고 건배도 했는데 집에 오자마자 혼자 울었습니다. 미워하는 건 아닌데 이 감정이 너무 부끄럽습니다.',
    false, true, 66, 3, 703,
    '{}',
    now() - interval '7 days' - interval '3 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_confession_id, v_author_id,
    '동료가 힘들다고 했을 때 모른 척하고 지나쳤습니다',
    '복도에서 눈이 빨간 동료를 봤는데 괜한 일에 엮일까봐 그냥 지나쳤습니다. 며칠 뒤 그 동료가 병가를 냈다는 걸 알았습니다. 한마디라도 건넸으면 어떻게 됐을지 자꾸 생각납니다.',
    false, true, 42, 1, 471,
    '{}',
    now() - interval '6 days' - interval '8 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_confession_id, v_author_id,
    '남을 도와주는 척하면서 실은 제 이익을 위해서였습니다',
    '자원봉사를 꾸준히 했는데 솔직하게 돌아보면 스펙을 위한 목적이 더 컸습니다. 진심으로 도왔던 분들에게 미안한 마음이 있고, 지금은 그 경험을 내세우기가 부끄럽습니다.',
    false, true, 34, 2, 381,
    '{}',
    now() - interval '5 days' - interval '14 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_confession_id, v_author_id,
    '아는 사람의 험담을 했다가 그 말이 당사자에게 돌아갔습니다',
    '가깝지 않은 사람과 술을 마시면서 공통 지인 이야기를 했는데, 그 자리에서 한 말이 결국 당사자 귀에 들어갔습니다. 그 이후로 그 지인과 사이가 껄끄러워졌고 저도 모르는 사람한테 조심해야 한다는 교훈을 뒤늦게 얻었습니다.',
    false, true, 49, 4, 534,
    '{}',
    now() - interval '4 days' - interval '5 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_confession_id, v_author_id,
    '영상통화 중에 딴짓을 하면서 집중하는 척했습니다',
    '부모님과 영상통화를 하면서 게임을 했습니다. 부모님은 신나게 이것저것 말씀하셨는데 제대로 들은 내용이 거의 없습니다. 나중에 부모님이 그날 했던 이야기를 다시 꺼내셨을 때 모른다고 했더니 많이 서운해하셨습니다.',
    false, true, 58, 6, 627,
    array['https://picsum.photos/seed/videocall/800/500'],
    now() - interval '3 days' - interval '11 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_confession_id, v_author_id,
    '고등학교 때 친구의 숙제를 허락 없이 베꼈습니다',
    '제출 직전에 숙제가 없다는 걸 알고 친구 가방에서 몰래 꺼내 베꼈습니다. 친구는 나중에 알게 됐고 큰 소리는 안 냈지만, 그 표정이 기억납니다. 지금도 만나지만 한 번도 미안하다고 말 못 했습니다.',
    false, true, 31, 2, 347,
    '{}',
    now() - interval '2 days' - interval '7 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_confession_id, v_author_id,
    '아르바이트 중 거스름돈을 덜 줬는데 그냥 넘어갔습니다',
    '계산 실수로 거스름돈을 덜 드렸는데 손님이 그냥 가셨습니다. 당시에 바빠서 지나쳤는데 퇴근 길에 생각났습니다. 사소한 금액이었지만 돌아가서 드릴 방법도 없고 그냥 넘어간 게 아직도 마음에 걸립니다.',
    false, true, 23, 1, 261,
    '{}',
    now() - interval '1 day' - interval '14 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_confession_id, v_author_id,
    '전 남편에게 이혼 사유를 사실대로 말하지 않았습니다',
    '진짜 이유를 말하면 더 상처받을 것 같아서 다른 이유를 댔습니다. 그 편이 서로에게 낫다고 생각했는데, 지금 생각하면 그 사람이 진실을 알 권리가 있었는지도 모릅니다.',
    false, true, 72, 5, 765,
    '{}',
    now() - interval '1 day' - interval '3 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_confession_id, v_author_id,
    '모르는 척했지만 사실 다 듣고 있었습니다',
    '친한 사람들끼리 제 험담을 나누는 걸 모르는 척하고 지나쳤습니다. 그 이후로 그 사람들을 대하는 제 태도가 달라졌을 텐데, 정작 상처받았다고 말을 못 하고 지금도 참고 있습니다.',
    false, true, 85, 2, 891,
    array['https://picsum.photos/seed/whisper/800/500'],
    now() - interval '18 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_confession_id, v_author_id,
    '가장 힘든 시기에 친구가 저를 필요로 했는데 저는 없었습니다',
    '제 상황이 너무 힘들다는 핑계로 친구 연락에 답장을 안 했습니다. 나중에 알고 보니 그 친구도 당시 정말 힘든 일이 있었더라고요. 이기적이었던 스스로가 부끄럽고, 지금은 그 친구가 괜찮은지 걱정됩니다.',
    false, true, 53, 3, 581,
    '{}',
    now() - interval '10 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_confession_id, v_author_id,
    '누군가의 약점을 알고 있는데 언젠가 쓸 수 있다고 생각한 적이 있습니다',
    '이 생각이 든 순간 스스로도 너무 놀랐습니다. 실제로 그러지는 않았지만, 그런 생각을 했다는 것 자체가 무서웠습니다. 제가 어떤 사람인지 돌아보게 되는 고백입니다.',
    false, true, 76, 7, 822,
    '{}',
    now() - interval '4 hours');

  -- ── 위로받고 싶어요 (comfort) 35개 ────────────────────────────────

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_comfort_id, v_author_id,
    '번아웃이 와서 아무것도 하고 싶지 않습니다',
    '몇 달째 열심히 달려왔는데 어느 날 갑자기 완전히 멈춰버렸습니다. 해야 할 일은 쌓여있는데 아무것도 시작이 안 되고, 이런 상태가 얼마나 더 갈지 모르겠습니다. 번아웃을 겪어보신 분들 어떻게 회복하셨나요.',
    false, true, 82, 1, 871,
    array['https://picsum.photos/seed/burnout/800/500'],
    now() - interval '29 days' - interval '5 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_comfort_id, v_author_id,
    '가장 친한 친구가 멀리 이사 가버렸어요',
    '10년을 같은 동네에서 살았는데 친구가 지방으로 이사를 갔습니다. 자주 보지 않아도 근처에 있다는 것 자체가 안정감이었는데, 이제 그게 없으니 생각보다 허전합니다. 멀리 사는 친구와 관계를 유지하는 팁이 있을까요.',
    false, false, 64, 0, 683,
    '{}',
    now() - interval '28 days' - interval '3 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_comfort_id, v_author_id,
    '오늘 갑자기 눈물이 났는데 이유를 모르겠어요',
    '아무 일도 없었는데 퇴근길에 갑자기 눈물이 흘렀습니다. 지하철에서 참으려고 했는데 잘 안 됐습니다. 특별히 나쁜 일이 있는 것도 아닌데 왜 이런 건지, 나쁜 신호인지 그냥 지나가는 건지 모르겠습니다.',
    false, true, 91, 0, 967,
    '{}',
    now() - interval '27 days' - interval '10 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_comfort_id, v_author_id,
    '나이 들수록 새 친구를 사귀는 게 너무 어렵습니다',
    '30대 중반인데 이직을 하고 나니 새 직장에서 친해질 사람이 없습니다. 학교 때는 자연스럽게 됐는데 지금은 어떻게 다가가야 할지도 모르겠고, 이제는 그냥 혼자 지내는 게 편한 건지 쓸쓸한 건지 구분이 안 됩니다.',
    false, false, 74, 2, 786,
    array['https://picsum.photos/seed/lonely/800/500'],
    now() - interval '26 days' - interval '7 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_comfort_id, v_author_id,
    '하고 싶은 일이 있는데 시작하는 게 너무 두렵습니다',
    '몇 년째 생각만 하고 있는 일이 있습니다. 시작하면 잘 안 될 것 같고, 안 하면 후회할 것 같고. 그 사이에서 계속 시간만 가는 것 같습니다. 두려움을 이기고 시작해보신 분들의 이야기가 듣고 싶습니다.',
    false, false, 78, 1, 833,
    '{}',
    now() - interval '25 days' - interval '4 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_comfort_id, v_author_id,
    '취업 준비 2년째인데 지쳐가고 있어요',
    '계속 서류도 떨어지고 면접도 실패하다 보니 이제는 의지 자체가 없어지는 것 같습니다. 주변에서는 더 열심히 하면 된다고 하는데, 이미 할 수 있는 건 다 하고 있어서 그 말이 오히려 힘듭니다.',
    false, true, 88, 2, 934,
    '{}',
    now() - interval '24 days' - interval '9 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_comfort_id, v_author_id,
    '부모님이 자꾸 다른 형제와 비교하셔서 너무 힘듭니다',
    '저도 나름 열심히 사는데 부모님 눈에는 항상 동생이 더 잘 보이는 것 같습니다. 말씀드리면 예민하다고 하시고, 참으면 계속 반복됩니다. 가족한테 상처받는 게 더 힘든 것 같습니다.',
    false, true, 69, 3, 732,
    '{}',
    now() - interval '23 days' - interval '6 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_comfort_id, v_author_id,
    '내 감정을 표현하는 게 너무 어렵습니다',
    '힘들 때 힘들다고 말을 못 하고, 좋을 때도 좋다고 표현을 잘 못 합니다. 가까운 사람들이 제가 뭘 느끼는지 모르겠다고 하는데, 저도 어떻게 해야 할지 모르겠습니다. 감정 표현이 어려운 분들 어떻게 하세요.',
    false, false, 55, 1, 589,
    '{}',
    now() - interval '22 days' - interval '8 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_comfort_id, v_author_id,
    '몸이 아픈데 혼자 병원에 가야 해서 슬퍼요',
    '수술은 아니고 외래인데, 검사 결과 듣는 게 무섭습니다. 같이 가줄 사람을 부르기가 미안해서 혼자 가려고 하는데, 대기실에서 혼자 기다리는 게 생각보다 쓸쓸합니다. 그냥 누군가 옆에 있어줬으면 싶습니다.',
    false, true, 97, 0, 1024,
    array['https://picsum.photos/seed/hospital/800/500'],
    now() - interval '21 days' - interval '2 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_comfort_id, v_author_id,
    '자취 2년째인데 외로움에 아직 익숙해지지 않습니다',
    '처음엔 혼자 사는 게 자유롭고 좋았는데, 이제는 집에 들어올 때 아무도 없는 게 매번 새롭게 쓸쓸합니다. 습관이 되면 괜찮아진다고 했는데 아직도 모르겠습니다.',
    false, true, 76, 1, 814,
    '{}',
    now() - interval '20 days' - interval '5 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_comfort_id, v_author_id,
    '직장에서 자꾸 실수를 해서 자신감이 없어졌습니다',
    '이전 직장에선 잘했는데 이직 후에 환경이 달라지니 자꾸 실수가 납니다. 주변 눈치도 보이고 위축되면 또 실수하는 악순환입니다. 이런 시기를 어떻게 버티셨는지 경험 나눠주세요.',
    false, false, 62, 2, 661,
    '{}',
    now() - interval '19 days' - interval '9 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_comfort_id, v_author_id,
    '재능이 없는 것 같아서 포기할까 고민입니다',
    '몇 년째 꾸준히 해온 일인데 늘지 않는 것 같고, 주변에 잘하는 사람들을 보면 더 작아지는 느낌입니다. 노력이 부족한 건지, 재능이 없는 건지, 그냥 방향이 맞지 않는 건지 모르겠습니다.',
    false, false, 58, 3, 621,
    array['https://picsum.photos/seed/art/800/500'],
    now() - interval '18 days' - interval '6 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_comfort_id, v_author_id,
    '장거리 연애가 너무 힘들어서 지쳐가고 있어요',
    '2년째 장거리인데 만남이 줄수록 감정의 온도가 달라지는 게 느껴집니다. 서로 열심히 하고 있는데 현실적인 한계가 있다는 게 속상합니다. 장거리를 버티신 분들의 이야기가 위로가 될 것 같습니다.',
    false, true, 81, 4, 862,
    '{}',
    now() - interval '17 days' - interval '4 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_comfort_id, v_author_id,
    '갑자기 부고 소식을 들었고 아직 실감이 나지 않습니다',
    '오래 알고 지낸 분이 갑자기 돌아가셨다는 소식을 들었습니다. 믿어지지 않아서 슬프다는 감정보다 멍함이 먼저입니다. 이런 상황에서 어떻게 마음을 다잡아야 할지 모르겠습니다.',
    false, true, 54, 0, 578,
    '{}',
    now() - interval '16 days' - interval '8 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_comfort_id, v_author_id,
    '첫 직장을 다니기 시작했는데 매일이 낯섭니다',
    '입사한 지 두 달이 됐는데 아직도 점심을 혼자 먹는 날이 많습니다. 일도 모르는 것 투성이고, 어디서 어떻게 물어봐야 할지도 모르겠습니다. 이 시기가 지나면 나아질까요.',
    false, false, 67, 2, 711,
    array['https://picsum.photos/seed/office/800/500'],
    now() - interval '15 days' - interval '3 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_comfort_id, v_author_id,
    '내 결정이 맞는 건지 항상 확신이 없습니다',
    '작은 결정부터 중요한 결정까지 항상 불안하고 자신이 없습니다. 결정을 내리고 나서도 틀린 건 아닐까 계속 되새깁니다. 결정에 확신이 있는 사람들이 신기합니다. 저만 이런 건지 궁금합니다.',
    false, false, 61, 1, 648,
    '{}',
    now() - interval '14 days' - interval '7 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_comfort_id, v_author_id,
    '사람들한테 잘 맞추다 보면 진짜 나를 잃는 것 같아요',
    '분위기 파악을 잘 한다는 말을 자주 듣는데, 솔직히 그건 제가 원하는 걸 접고 상대에게 맞추기 때문입니다. 그게 쌓이다 보니 제가 뭘 원하는지 모르게 됐습니다.',
    false, true, 83, 2, 887,
    '{}',
    now() - interval '13 days' - interval '5 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_comfort_id, v_author_id,
    '졸업 후 다들 흩어지고 나니 너무 허전합니다',
    '학교에 있을 땐 당연한 것들이었는데, 졸업하고 나니 일상에서 사람이 이렇게 적어질 줄 몰랐습니다. 사회생활을 시작했는데 오히려 더 고립된 느낌입니다.',
    false, false, 59, 1, 626,
    '{}',
    now() - interval '12 days' - interval '9 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_comfort_id, v_author_id,
    '이유 없이 무기력한 날이 계속됩니다',
    '생활이 크게 달라진 것도 없는데 의욕이 없고 하루하루가 버겁습니다. 잘 먹고 잘 자도 피곤하고, 쉬어도 쉰 것 같지 않습니다. 이런 상태가 얼마나 가는지, 어떻게 벗어나셨는지 궁금합니다.',
    false, true, 79, 0, 841,
    array['https://picsum.photos/seed/couch/800/500'],
    now() - interval '11 days' - interval '6 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_comfort_id, v_author_id,
    '사랑하는 반려동물이 무지개다리를 건넜습니다',
    '15년을 함께한 고양이가 어제 떠났습니다. 오래 살았지만 막상 없으니 집 안 어디를 봐도 그 자리가 남아있습니다. 지금 이 슬픔을 어떻게 받아들여야 할지 모르겠습니다.',
    false, true, 112, 0, 1189,
    array['https://picsum.photos/seed/cat/800/500'],
    now() - interval '10 days' - interval '3 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_comfort_id, v_author_id,
    '혼자 밥 먹는 게 이제 슬프게 느껴집니다',
    '처음엔 혼밥이 편했는데 이제는 식당에서 혼자 앉아 있으면 왠지 모르게 마음이 내려앉습니다. 음식이 맛있어도 함께 먹는 사람이 없으면 좀 허전한 것 같습니다.',
    false, true, 71, 1, 753,
    array['https://picsum.photos/seed/food/800/500'],
    now() - interval '9 days' - interval '8 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_comfort_id, v_author_id,
    '계획한 게 자꾸 무너져서 의욕이 없어졌습니다',
    '올해 초에 세운 계획들이 하나도 제대로 된 게 없습니다. 예상치 못한 일들이 생기면서 다 어그러졌는데, 또 새로 세우기가 두렵습니다. 어떻게 다시 마음을 잡으셨는지 경험이 듣고 싶습니다.',
    false, false, 66, 2, 702,
    '{}',
    now() - interval '8 days' - interval '4 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_comfort_id, v_author_id,
    '내가 잘못 살고 있는 건 아닌가 하는 생각이 자주 듭니다',
    '비슷한 나이대 사람들이 하는 것들을 저는 못 하고 있고, 제가 선택한 길이 맞는 건지 흔들릴 때가 많습니다. 기준 없이 불안한 건지, 정말 뭔가 바꿔야 하는 건지 모르겠습니다.',
    false, true, 74, 3, 789,
    '{}',
    now() - interval '7 days' - interval '11 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_comfort_id, v_author_id,
    '기대했던 일이 잘 안 됐을 때 어떻게 추스르셨나요',
    '오래 준비한 일이 안 됐습니다. 실망보다 공허함이 먼저 옵니다. 다시 시작해야 한다는 걸 알지만 지금은 그 공허함에서 빠져나오는 게 먼저인 것 같습니다. 비슷한 경험 있으신 분들 이야기가 듣고 싶습니다.',
    false, false, 84, 1, 892,
    '{}',
    now() - interval '6 days' - interval '6 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_comfort_id, v_author_id,
    '요즘 눈물이 너무 자주 납니다',
    '드라마를 봐도, 노래를 들어도, 아무 이유 없이도 눈물이 납니다. 예전에는 잘 안 울었는데 최근 몇 달 사이에 이렇게 됐습니다. 예민해진 건지 뭔가 쌓인 건지 모르겠습니다.',
    false, true, 88, 0, 934,
    '{}',
    now() - interval '5 days' - interval '9 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_comfort_id, v_author_id,
    '일도 사람도 전부 다 지쳐버린 것 같아요',
    '일이 힘든 건 참을 수 있었는데, 사람 관계까지 지치고 나니까 정말 아무것도 하기 싫습니다. 혼자 있으면 숨통이 트이는데 그러다 보면 더 고립되는 것 같고, 어떻게 해야 할지 모르겠습니다.',
    false, true, 93, 1, 987,
    array['https://picsum.photos/seed/tired/800/500'],
    now() - interval '4 days' - interval '3 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_comfort_id, v_author_id,
    '집에 돌아오면 아무도 없는 게 오늘따라 너무 쓸쓸합니다',
    '특별히 힘든 일이 있었던 건 아닌데 오늘은 현관문을 열 때 유독 무거웠습니다. 텅 빈 집 안이 왜 이렇게 크게 느껴지는지 모르겠습니다. 그냥 이 마음을 나누고 싶었습니다.',
    false, true, 79, 0, 839,
    '{}',
    now() - interval '3 days' - interval '7 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_comfort_id, v_author_id,
    '친구들 다 결혼하고 저만 혼자인 것 같습니다',
    '결혼이 싫은 건 아닌데, 주변이 다 짝이 생기고 나니 명절이나 모임이 갈수록 낯설게 느껴집니다. 축하는 진심인데 혼자 집에 돌아올 때 묘한 기분이 드는 것도 사실입니다.',
    false, true, 87, 2, 921,
    '{}',
    now() - interval '2 days' - interval '5 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_comfort_id, v_author_id,
    '요즘 밥맛이 없고 아무것도 맛있지 않아요',
    '먹어야 한다는 걸 알아서 먹는데, 맛을 느끼지 못하는 날이 계속됩니다. 좋아하던 음식도 그저 그렇고, 식사 자체가 귀찮게 느껴집니다. 이런 상태가 오래 가면 어떻게 되는 건지 걱정됩니다.',
    false, true, 65, 1, 691,
    '{}',
    now() - interval '1 day' - interval '9 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_comfort_id, v_author_id,
    '낯선 도시에 혼자 있는데 정말 막막합니다',
    '발령을 받아서 모르는 도시로 이사를 왔습니다. 아는 사람이 한 명도 없고, 퇴근 후에 할 것도 없습니다. 이런 시기를 어떻게 보내셨는지 경험을 나눠주시면 감사하겠습니다.',
    false, false, 72, 0, 764,
    array['https://picsum.photos/seed/city/800/500'],
    now() - interval '1 day' - interval '2 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_comfort_id, v_author_id,
    '누군가 오늘 수고했다고 말해줬으면 합니다',
    '별로 잘 한 것도 없고 대단한 하루도 아닌데, 그냥 수고했다는 말 한 마디가 듣고 싶습니다. 이런 말을 먼저 해줄 사람이 없다는 것도 오늘은 조금 쓸쓸합니다.',
    false, true, 104, 0, 1098,
    '{}',
    now() - interval '16 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_comfort_id, v_author_id,
    '나만 성장이 느린 것 같아서 불안합니다',
    '같은 연차 동료들은 빠르게 성장하는 것 같은데 저만 제자리 같습니다. 노력을 안 하는 것도 아닌데 결과가 안 나오니 내가 근본적으로 부족한 건 아닐까 하는 생각이 듭니다.',
    false, false, 76, 3, 805,
    '{}',
    now() - interval '8 hours');

  -- ── 해결책을 제시해주세요 (solutions) 30개 ─────────────────────────

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_solutions_id, v_author_id,
    '적금을 깨야 할지 말아야 할지 모르겠습니다',
    '당장 필요한 목돈이 생겼는데, 만기가 3달 남은 적금을 깨는 게 맞는 건지 다른 방법이 있는지 모르겠습니다. 이자 손해가 크지 않으면 깨는 게 낫겠지만, 그냥 대출을 받는 게 나을 수도 있을 것 같아서 판단이 안 섭니다.',
    false, false, 48, 2, 511,
    '{}',
    now() - interval '29 days' - interval '8 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_solutions_id, v_author_id,
    '사이가 안 좋은 동료와 같은 팀이 됐어요',
    '작년에 갈등이 있었던 동료와 팀이 합쳐졌습니다. 서로 해결된 건 아니고 그냥 시간이 지나 어색하게 지내고 있는 상황인데, 앞으로 같이 프로젝트를 해야 합니다. 어떻게 접근해야 할까요.',
    false, false, 57, 3, 608,
    '{}',
    now() - interval '28 days' - interval '4 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_solutions_id, v_author_id,
    '독립하고 싶은데 부모님이 반대하십니다',
    '28살인데 부모님이 같이 살길 원하십니다. 저는 혼자 사는 경험도 해보고 싶고 자유도 원하는데, 독립을 꺼내면 왜 나가려 하느냐며 섭섭해하십니다. 어떻게 설득하셨는지 경험 나눠주실 분 계신가요.',
    false, false, 64, 4, 682,
    '{}',
    now() - interval '27 days' - interval '6 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_solutions_id, v_author_id,
    '대학원을 갈지 취업을 할지 진짜 모르겠습니다',
    '졸업이 다가오는데 두 선택지 모두 장단점이 뚜렷합니다. 대학원은 더 공부하고 싶은 마음, 취업은 빨리 경험을 쌓고 싶은 마음입니다. 비슷한 고민을 하셨던 분들 어떤 기준으로 선택하셨나요.',
    false, false, 73, 5, 776,
    array['https://picsum.photos/seed/graduate/800/500'],
    now() - interval '26 days' - interval '3 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_solutions_id, v_author_id,
    '집주인이 보증금을 돌려주지 않습니다',
    '이사를 나왔는데 이런저런 핑계로 보증금 반환을 미루고 있습니다. 내용증명을 보내야 하는 건지, 바로 소송을 해야 하는 건지 절차를 잘 모르겠습니다. 비슷한 상황에서 어떻게 해결하셨나요.',
    false, false, 89, 2, 943,
    '{}',
    now() - interval '25 days' - interval '9 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_solutions_id, v_author_id,
    '남자친구 가족이 저를 마음에 안 들어 하는 것 같아요',
    '명절에 인사를 드리러 갔는데 분위기가 불편했습니다. 남자친구는 괜찮다고 하는데 제 눈에는 확실히 뭔가 있는 것 같습니다. 시댁과의 관계를 어떻게 시작해야 할지, 직접 묻는 게 나은 건지 묻는 게 실례인지 모르겠습니다.',
    false, true, 61, 3, 648,
    '{}',
    now() - interval '24 days' - interval '7 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_solutions_id, v_author_id,
    '번아웃 같은데 병원을 가야 할지 그냥 쉬면 될지 모르겠어요',
    '몇 달째 지속적으로 피로하고 무기력하며 아무 의욕이 없습니다. 단순 번아웃인지 우울증 초기인지 모르겠는데, 정신건강의학과를 가야 하는 건지, 어떤 과를 가야 하는 건지도 모르겠습니다.',
    false, false, 95, 1, 1012,
    '{}',
    now() - interval '23 days' - interval '5 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_solutions_id, v_author_id,
    '직장 내 소문의 피해자가 됐습니다',
    '사실이 아닌 소문이 퍼졌고 이미 여러 사람이 알고 있는 상황입니다. 당사자에게 직접 따질지, 팀장에게 보고할지, 그냥 덮고 갈지 선택을 못 하겠습니다. 유사한 상황을 겪으셨던 분 조언 부탁드립니다.',
    false, false, 78, 4, 829,
    '{}',
    now() - interval '22 days' - interval '8 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_solutions_id, v_author_id,
    '갑자기 창업을 해보고 싶어졌는데 어떻게 시작해야 하나요',
    '회사 생활 7년 차인데 뭔가 내 것을 만들고 싶다는 생각이 강해졌습니다. 아이디어는 있는데 자금도 부족하고 사업 경험도 없습니다. 소자본으로 시작할 수 있는 방법이나 창업 첫 발걸음을 어떻게 떼셨는지 듣고 싶습니다.',
    false, false, 67, 3, 712,
    array['https://picsum.photos/seed/startup/800/500'],
    now() - interval '21 days' - interval '4 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_solutions_id, v_author_id,
    '결혼 날짜를 잡았는데 시댁과 의견 충돌이 계속됩니다',
    '날짜, 장소, 예식 규모 등 거의 모든 부분에서 의견이 다릅니다. 남자친구는 양쪽 다 맞추려다가 우리 의견은 없어지는 것 같습니다. 이런 상황을 슬기롭게 해결하신 분 계신가요.',
    false, false, 84, 5, 892,
    '{}',
    now() - interval '20 days' - interval '6 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_solutions_id, v_author_id,
    '부모님 간병과 직장을 어떻게 병행해야 할까요',
    '부모님 중 한 분이 갑자기 건강이 나빠지셔서 돌봐드려야 하는 상황인데, 직장도 포기하기 어렵습니다. 간병인을 쓰는 게 맞는지, 요양 시설은 어떻게 알아보는지, 현실적인 조언이 필요합니다.',
    false, false, 72, 1, 763,
    '{}',
    now() - interval '19 days' - interval '3 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_solutions_id, v_author_id,
    '오래된 관계를 정리하고 싶은데 방법을 모르겠습니다',
    '연락이 오면 부담스럽고 만나면 피곤한 관계인데, 큰 싸움 없이 자연스럽게 거리를 두는 방법이 있을지 모르겠습니다. 갑자기 연락을 끊으면 서운해할 것 같고, 계속 유지하자니 지칩니다.',
    false, false, 59, 2, 626,
    '{}',
    now() - interval '18 days' - interval '7 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_solutions_id, v_author_id,
    '연봉 협상을 어떻게 해야 할지 막막합니다',
    '올해 평가는 좋았는데 회사에서 제시한 인상률이 기대 이하입니다. 협상을 해보고 싶은데 어떻게 근거를 만들고 어떤 방식으로 말을 꺼내야 할지 경험 있으신 분 조언 부탁드립니다.',
    false, false, 81, 3, 859,
    array['https://picsum.photos/seed/salary/800/500'],
    now() - interval '17 days' - interval '5 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_solutions_id, v_author_id,
    '아이 교육 방식을 두고 배우자와 의견이 갈립니다',
    '저는 놀이 중심 교육을 원하는데 배우자는 조기 교육을 원합니다. 서로 근거가 있다 보니 쉽게 한쪽이 양보하지 못하고 있습니다. 이런 의견 충돌을 어떻게 좁혀가셨는지 부모님들 경험이 궁금합니다.',
    false, false, 54, 2, 574,
    '{}',
    now() - interval '16 days' - interval '9 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_solutions_id, v_author_id,
    '친구에게 자꾸 돈 빌려달라는 연락이 옵니다',
    '여러 번 빌려줬는데 갚지 않고 또 요구합니다. 거절하면 관계가 끊길 것 같고, 또 빌려주면 돌아오지 않을 것 같습니다. 이런 상황을 어떻게 정리하셨는지 조언 부탁드립니다.',
    false, true, 77, 4, 821,
    '{}',
    now() - interval '15 days' - interval '6 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_solutions_id, v_author_id,
    '개인 사업자 등록, 뭐부터 시작해야 할지 알려주세요',
    '프리랜서로 일하다가 사업자 등록을 하려고 합니다. 어디에 신청하는지, 세금은 어떻게 처리하는지, 처음 등록할 때 알아두면 좋을 것들을 정리해서 알려주실 수 있을까요.',
    false, false, 63, 1, 668,
    '{}',
    now() - interval '14 days' - interval '4 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_solutions_id, v_author_id,
    '온라인 쇼핑몰 사기 피해, 환불 받을 수 있을까요',
    '입금했는데 물건이 안 왔고 판매자 연락도 안 됩니다. 계좌 이체라 카드사 분쟁도 안 되고 경찰 신고를 해야 하는지 소비자원에 신고해야 하는지 모르겠습니다. 실제로 환불 받으신 분 계신가요.',
    false, false, 71, 2, 754,
    '{}',
    now() - interval '13 days' - interval '7 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_solutions_id, v_author_id,
    '이직 후 새 회사 분위기에 적응이 안 됩니다',
    '이직한 지 두 달이 됐는데 팀 분위기 자체가 이전 회사와 너무 달라서 적응이 힘듭니다. 업무 방식도, 소통 방식도 다 낯설고 제가 잘 하고 있는 건지도 모르겠습니다. 이 시기를 어떻게 버티셨는지 조언 주세요.',
    false, false, 68, 3, 722,
    '{}',
    now() - interval '12 days' - interval '5 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_solutions_id, v_author_id,
    '중고 거래 사기 피해, 어떻게 대응하셨나요',
    '직거래로 거래했는데 물건을 받고 보니 설명과 완전히 달랐습니다. 판매자는 문제없다고 하고 있는데 환불 요청을 거부하고 있습니다. 소비자보호원, 경찰 신고 외에 현실적인 방법이 있을까요.',
    false, false, 54, 2, 573,
    '{}',
    now() - interval '11 days' - interval '8 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_solutions_id, v_author_id,
    '자기계발을 시작하고 싶은데 뭐부터 해야 할지 막막합니다',
    '운동, 독서, 외국어, 자격증 등 하고 싶은 건 많은데 막상 무엇부터 시작해야 할지 모르겠습니다. 시작했다 포기하는 패턴이 반복되고 있어서 이번엔 제대로 해보고 싶습니다. 동기부여와 루틴 만들기 팁이 있으신가요.',
    false, false, 79, 2, 838,
    array['https://picsum.photos/seed/book/800/500'],
    now() - interval '10 days' - interval '4 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_solutions_id, v_author_id,
    '면접 공포증이 심한데 극복 방법이 있을까요',
    '준비는 충분히 했는데 면접 당일이 되면 손이 떨리고 말이 꼬입니다. 모의 면접도 해봤는데 실전에서는 완전히 다른 사람이 됩니다. 면접 불안을 어떻게 극복하셨는지 경험 있으신 분 도움 부탁드립니다.',
    false, false, 86, 1, 912,
    '{}',
    now() - interval '9 days' - interval '6 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_solutions_id, v_author_id,
    '저축과 투자를 어떤 비율로 해야 할까요',
    '월급의 얼마를 저축하고 얼마를 투자에 써야 하는지 기준이 없습니다. 나이와 상황마다 다를 것 같은데, 30대 초반 직장인 기준으로 어떻게 배분하는 게 일반적인지 현실적인 조언이 듣고 싶습니다.',
    false, false, 92, 3, 976,
    '{}',
    now() - interval '8 days' - interval '3 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_solutions_id, v_author_id,
    '이웃 소음 문제를 어떻게 해결해야 할지 모르겠어요',
    '윗집에서 매일 밤 쿵쿵거리는 소리가 납니다. 관리사무소에 얘기해도 잠시뿐이고 직접 찾아가기는 무서웠습니다. 층간 소음 문제를 효과적으로 해결하신 분 계신가요.',
    false, false, 74, 3, 785,
    '{}',
    now() - interval '7 days' - interval '8 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_solutions_id, v_author_id,
    '사내 괴롭힘을 목격했는데 신고해야 할까요',
    '팀 내에서 특정 직원이 지속적으로 무시당하는 걸 목격하고 있습니다. 당사자는 참고 있는 것 같고, 제가 나서면 관계가 복잡해질 것 같습니다. 방관자로 있는 것도 맞지 않은 것 같고 어떻게 해야 할지 모르겠습니다.',
    false, false, 83, 2, 881,
    '{}',
    now() - interval '6 days' - interval '5 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_solutions_id, v_author_id,
    '이직 없이 지금 회사에서 인정받으려면 어떻게 해야 하나요',
    '이직을 하기보다 현 직장에서 성장하고 싶습니다. 열심히 하고 있는데 가시적인 성과나 인정받는 방법을 모르겠습니다. 현 직장에서 커리어를 쌓으신 분들 어떤 방법이 효과적이었나요.',
    false, false, 61, 2, 647,
    '{}',
    now() - interval '5 days' - interval '6 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_solutions_id, v_author_id,
    '자취방 계약 만료, 이사 vs 재계약 어떻게 결정하셨나요',
    '2년 살던 자취방이 곧 만료됩니다. 집주인은 연장을 원하는데 월세가 올라서 다른 곳을 알아볼까 싶습니다. 이사하면 비용도 들고 귀찮은데 그냥 버티는 게 나은 건지, 이런 상황에서 어떻게 결정하셨는지 궁금합니다.',
    false, false, 58, 1, 614,
    '{}',
    now() - interval '4 days' - interval '4 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_solutions_id, v_author_id,
    '부모님 노후 준비를 도와드리고 싶은데 어떻게 해야 할까요',
    '60대 초반 부모님이 노후 자금이 거의 없으신 것 같습니다. 제 형편도 넉넉하지 않은데 부모님을 어떻게 도와드려야 할지 모르겠습니다. 부모님 노후를 함께 준비해본 경험이 있으신 분 현실적인 조언 부탁드립니다.',
    false, false, 69, 2, 733,
    array['https://picsum.photos/seed/elderly/800/500'],
    now() - interval '3 days' - interval '7 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_solutions_id, v_author_id,
    '직장 상사와 극심한 갈등, 어떻게 풀어가셨나요',
    '업무 스타일 자체가 맞지 않는 상사입니다. 보고 방식부터 우선순위까지 매번 충돌하고, 이야기를 해봤지만 달라지는 게 없습니다. 이직 전에 관계를 개선해볼 방법이 있을까요, 아니면 이런 상황은 그냥 이직이 답일까요.',
    false, false, 88, 4, 934,
    '{}',
    now() - interval '2 days' - interval '3 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_solutions_id, v_author_id,
    '건강 검진 이상 소견이 나왔는데 어디 병원을 가야 할지 모르겠어요',
    '건강 검진 결과에서 처음 보는 수치가 나왔습니다. 재검 권고라고 나와 있는데 어느 과에 가야 하는지, 대학병원을 가야 하는지 동네 병원을 가야 하는지부터 모르겠습니다. 비슷한 경험 있으신 분 조언 주세요.',
    false, false, 76, 1, 807,
    '{}',
    now() - interval '1 day' - interval '6 hours');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, images, created_at)
  values (v_solutions_id, v_author_id,
    '30대에 처음으로 투자를 시작해보려고 하는데 어디서 시작해야 하나요',
    '예적금만 해왔는데 이제는 투자도 공부해보고 싶습니다. 주식인지, ETF인지, 부동산인지 뭐부터 공부하면 좋을지도 모르고, 사기 안 당하고 안전하게 시작하는 방법이 궁금합니다.',
    false, false, 94, 3, 997,
    array['https://picsum.photos/seed/invest/800/500'],
    now() - interval '12 hours');

  raise notice 'Done: 100 posts inserted (batch 3, confession 35 / comfort 35 / solutions 30).';
end $$;
