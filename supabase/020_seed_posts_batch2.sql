-- ============================================================
-- Seed 020: 10 more sample posts (batch 2)
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

  -- 고해성사 (confession) 4개
  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, created_at)
  values (v_confession_id, v_author_id,
    '회사 동료의 승진을 몰래 방해한 적이 있습니다',
    '실력이 비슷한 동료가 먼저 승진할 것 같아서 팀장에게 그 동료에 대한 나쁜 얘기를 슬쩍 흘렸습니다. 결국 제가 먼저 승진했고 그 동료는 1년 뒤 퇴사했어요. 그 얼굴이 아직도 생각납니다.',
    false, true, 58, 5, 621, now() - interval '9 days');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, created_at)
  values (v_confession_id, v_author_id,
    '전 남자친구에게 아직 연락이 오는데 답장을 해버렸습니다',
    '헤어진 지 2년이 넘었는데 갑자기 안부 문자가 왔어요. 지금 사귀는 사람이 있는데도 반갑다고 답장을 해버렸고 이후로 계속 연락이 이어지고 있습니다. 현 남자친구에게 너무 미안한데 말하지 못하고 있어요.',
    false, true, 43, 6, 508, now() - interval '8 days');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, created_at)
  values (v_confession_id, v_author_id,
    '친구 돈을 빌려서 갚지 않고 연락을 끊었습니다',
    '5년 전 급하게 300만 원을 빌렸는데 갚을 돈이 없어서 결국 연락을 피하다 차단했습니다. 그 친구 SNS를 가끔 보는데 잘 살고 있더라고요. 용기를 내서 연락해야 할까요, 아니면 이대로 묻어야 할까요.',
    false, true, 35, 3, 447, now() - interval '7 days');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, created_at)
  values (v_confession_id, v_author_id,
    '남편 몰래 카드값이 300만 원 넘게 쌓였습니다',
    '쇼핑을 조금씩 하다 보니 어느 순간 감당이 안 되는 금액이 됐어요. 남편은 아직 모르고 있고, 매달 조금씩 막으려고 하는데 이자가 계속 붙고 있습니다. 말해야 할까요 아니면 혼자 해결해야 할까요.',
    false, true, 61, 4, 589, now() - interval '6 days');

  -- 위로받고 싶어요 (comfort) 3개
  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, created_at)
  values (v_comfort_id, v_author_id,
    '아무리 노력해도 제자리인 것 같아서 지쳐요',
    '5년째 같은 직급입니다. 야근도 하고 자격증도 따고 사내 프로젝트에도 열심히 참여했는데 평가는 항상 보통입니다. 노력이 의미 없는 건지, 제가 능력이 없는 건지 모르겠어요. 그냥 오늘은 누군가 수고했다는 말이 듣고 싶습니다.',
    false, false, 77, 1, 712, now() - interval '5 days');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, created_at)
  values (v_comfort_id, v_author_id,
    '결혼 3년 차인데 남편이 낯선 사람 같아요',
    '처음엔 분명 서로를 잘 알고 좋아서 결혼했는데, 요즘은 같은 집에 살면서도 대화가 거의 없습니다. 각자 폰만 보다 잠드는 날이 대부분이에요. 이게 정상적인 건지 아니면 이미 뭔가 잘못된 건지 모르겠습니다.',
    false, true, 52, 2, 498, now() - interval '4 days');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, created_at)
  values (v_comfort_id, v_author_id,
    '사람들이 많은 자리에 있으면 항상 혼자인 느낌이에요',
    '회식도 가고 모임도 나가는데 집에 돌아오면 더 외롭습니다. 웃고 떠들다 와서 침대에 누우면 공허함이 몰려와요. 이 감정을 어떻게 설명해야 할지도 모르겠고 이해해 줄 사람이 있을지도 모르겠습니다.',
    false, true, 84, 0, 763, now() - interval '3 days');

  -- 해결책 (solutions) 3개
  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, created_at)
  values (v_solutions_id, v_author_id,
    '이직 제안을 받았는데 현 직장이 더 안정적이에요. 어떻게 결정하셨나요',
    '연봉은 현재보다 20% 높고 직급도 올라가는 제안인데, 현 회사는 대기업이고 이직할 곳은 스타트업입니다. 30대 중반에 안정이냐 성장이냐를 두고 진짜 고민됩니다. 비슷한 상황에서 어떻게 결정하셨는지 경험 나눠주실 분 계신가요.',
    false, false, 66, 3, 634, now() - interval '5 days');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, created_at)
  values (v_solutions_id, v_author_id,
    '부부 싸움 후 대화를 거부하는 배우자, 어떻게 접근하면 좋을까요',
    '싸우고 나면 남편이 며칠씩 말을 안 합니다. 제가 먼저 사과를 해도 단답이거나 무시하고, 그 분위기가 일주일 가까이 가는 경우도 있었습니다. 이런 상황에서 어떻게 대화를 여는 게 효과적인지 경험 있으신 분 조언 부탁드립니다.',
    false, false, 48, 2, 521, now() - interval '3 days');

  insert into public.posts (board_id, author_id, title, content, is_notice, is_anonymous, up_count, down_count, view_count, created_at)
  values (v_solutions_id, v_author_id,
    '프리랜서 전향을 고민 중인데 현실적인 조언이 필요해요',
    '디자이너 7년 차입니다. 회사 생활이 너무 지쳐서 프리랜서를 생각하고 있는데, 막상 수입이 불안정해질까봐 망설여집니다. 프리랜서로 전환하신 분들, 초반에 어떻게 클라이언트를 구하셨는지, 수입이 안정되기까지 얼마나 걸렸는지 궁금합니다.',
    false, false, 53, 1, 487, now() - interval '2 days');

  raise notice 'Done: 10 more posts inserted (batch 2).';
end $$;
