do $$
declare
  v_author_id uuid;
  v_confession_id uuid;
  v_comfort_id uuid;
  v_solutions_id uuid;
begin
  select id
  into v_author_id
  from public.users
  order by created_at asc
  limit 1;

  if v_author_id is null then
    raise exception 'No users found in public.users. Create at least one user first.';
  end if;

  select id into v_confession_id from public.boards where slug = 'confession' limit 1;
  select id into v_comfort_id from public.boards where slug = 'comfort' limit 1;
  select id into v_solutions_id from public.boards where slug = 'solutions' limit 1;

  if v_confession_id is null or v_comfort_id is null or v_solutions_id is null then
    raise exception 'Required boards are missing. Run 014_reframe_bless_you_boards.sql or 007_community_bootstrap.sql first.';
  end if;

  insert into public.posts (
    board_id,
    author_id,
    title,
    content,
    is_notice,
    is_anonymous,
    up_count,
    down_count,
    view_count,
    created_at,
    updated_at
  )
  select *
  from (
    values
      (
        v_confession_id,
        v_author_id,
        '운영 안내 | 이곳은 익명 고백과 위로를 위한 공간입니다',
        'BLACKPEARLS는 남에게 쉽게 말하지 못한 감정과 사연을 익명으로 내려놓고, 타인의 이야기에서 위로를 얻는 공간입니다. 고백을 조롱하지 말고, 위로를 가볍게 하지 말고, 해결책을 말할 때는 상대의 현실을 먼저 생각해주세요.',
        true,
        false,
        24,
        0,
        296,
        now() - interval '2 days',
        now() - interval '2 days'
      ),
      (
        v_confession_id,
        v_author_id,
        '결혼을 앞두고도 예전 사람을 아직 못 잊고 있습니다',
        '지금 만나는 사람은 정말 좋은 사람인데, 가끔은 예전에 헤어진 사람이 아직 마음 한쪽에 남아 있다는 걸 느낍니다. 결혼 날짜가 가까워질수록 죄책감이 더 커져서 누구에게도 말을 못 하겠네요.',
        false,
        true,
        17,
        1,
        184,
        now() - interval '11 hours',
        now() - interval '11 hours'
      ),
      (
        v_confession_id,
        v_author_id,
        '부모님 지갑에서 돈을 가져간 적이 있다는 걸 아직 말 못했습니다',
        '학생 때 너무 갖고 싶은 게 있어서 부모님 지갑에서 몇 번 돈을 빼간 적이 있습니다. 시간이 한참 지났는데도 문득문득 그 장면이 떠오르고, 지금이라도 말씀드려야 하나 싶다가도 괜히 상처만 드릴까 봐 망설이고 있습니다.',
        false,
        true,
        22,
        2,
        239,
        now() - interval '29 hours',
        now() - interval '29 hours'
      ),
      (
        v_confession_id,
        v_author_id,
        '친한 친구가 잘 안됐다는 말을 듣고 속으로 안도했습니다',
        '입으로는 걱정하는 척했는데 마음속에서는 내가 뒤처지지 않았다는 안도감이 먼저 들었습니다. 그런 제 모습이 너무 싫은데, 동시에 누구나 그런 마음이 조금은 있지 않나 싶어서 더 혼란스럽습니다.',
        false,
        true,
        14,
        1,
        151,
        now() - interval '6 hours',
        now() - interval '6 hours'
      ),
      (
        v_confession_id,
        v_author_id,
        '동생보다 잘되길 바라지 않았던 적이 있습니다',
        '가족이라서 늘 응원해야 한다고 생각했는데, 어느 순간부터는 동생이 잘되면 제가 초라해질까 봐 두려워졌습니다. 겉으로는 축하했지만 속으로는 불편했던 제 마음이 너무 부끄럽습니다.',
        false,
        true,
        18,
        1,
        172,
        now() - interval '14 hours',
        now() - interval '14 hours'
      ),
      (
        v_confession_id,
        v_author_id,
        '부모님 전화를 일부러 계속 미뤘습니다',
        '받으면 또 결혼 이야기와 비교 이야기가 나올 걸 알아서 벨이 울려도 일부러 안 받았습니다. 죄책감이 큰데도 잠깐이라도 편해지고 싶어서 계속 피하게 됩니다.',
        false,
        true,
        13,
        0,
        128,
        now() - interval '2 hours',
        now() - interval '2 hours'
      ),
      (
        v_comfort_id,
        v_author_id,
        '오늘도 아무 일 없는 척 출근하고 왔어요',
        '겉으로는 평소처럼 웃고 일했는데 집에 오자마자 그대로 주저앉았습니다. 누가 특별히 괴롭힌 것도 아닌데 하루가 끝날 때마다 너무 지쳐서 내가 왜 이러는지도 모르겠습니다.',
        false,
        true,
        34,
        0,
        311,
        now() - interval '9 hours',
        now() - interval '9 hours'
      ),
      (
        v_comfort_id,
        v_author_id,
        '다들 잘 사는 것 같은데 저만 멈춰 있는 기분입니다',
        '친구들은 이직도 하고 결혼도 하고 집도 알아보는데 저는 몇 년째 같은 자리에서 아무것도 못 바꾼 느낌입니다. 조급해하지 말라고는 하지만, 가끔은 정말 저만 멈춘 것 같아서 숨이 막힙니다.',
        false,
        true,
        29,
        1,
        267,
        now() - interval '21 hours',
        now() - interval '21 hours'
      ),
      (
        v_comfort_id,
        v_author_id,
        '헤어지고 나서 하루 종일 멍한 상태로만 지냅니다',
        '한 달쯤 지나면 나아질 줄 알았는데 오히려 더 비어 있는 느낌이 큽니다. 주말에는 잠만 자고, 평일에는 일만 겨우 하고 나면 아무 감정도 안 느껴져서 무섭습니다.',
        false,
        true,
        26,
        0,
        205,
        now() - interval '31 hours',
        now() - interval '31 hours'
      ),
      (
        v_comfort_id,
        v_author_id,
        '육아가 버거운데 저만 약한 부모 같아요',
        '아이를 사랑하지 않는 건 아닌데, 하루 종일 돌보다 보면 숨고 싶다는 생각이 들 때가 있습니다. 주변에는 다들 잘 해내는 것처럼 보여서 이런 말도 쉽게 못 꺼내겠어요.',
        false,
        true,
        38,
        2,
        333,
        now() - interval '4 hours',
        now() - interval '4 hours'
      ),
      (
        v_comfort_id,
        v_author_id,
        '주말이 오면 더 외로운 사람이 저뿐은 아니었으면 좋겠어요',
        '평일엔 일 때문에 버티는데 주말이 되면 누구에게도 연락할 사람이 없다는 사실이 더 크게 느껴집니다. 쉬는 날이 반갑지 않고 오히려 두려워지는 마음을 어디에 말해야 할지 모르겠습니다.',
        false,
        true,
        27,
        0,
        224,
        now() - interval '13 hours',
        now() - interval '13 hours'
      ),
      (
        v_comfort_id,
        v_author_id,
        '퇴근 후 아무것도 못 하고 누워만 있는 날이 많습니다',
        '해야 할 일은 머릿속에 많은데 몸이 전혀 따라주지 않습니다. 핸드폰만 보다가 자책하다 잠드는 패턴이 계속 반복돼서, 제가 점점 비어 가는 느낌이 듭니다.',
        false,
        true,
        24,
        1,
        198,
        now() - interval '5 hours',
        now() - interval '5 hours'
      ),
      (
        v_solutions_id,
        v_author_id,
        '회사 그만두고 싶은데 당장 생활비가 무섭습니다',
        '출근길마다 그만두고 싶다는 생각이 드는데, 월세와 대출 때문에 무작정 나올 용기는 없습니다. 버티면서 이직 준비를 해야 할지, 잠깐 쉬는 게 맞을지 현실적인 순서를 조언받고 싶습니다.',
        false,
        true,
        21,
        0,
        196,
        now() - interval '8 hours',
        now() - interval '8 hours'
      ),
      (
        v_solutions_id,
        v_author_id,
        '가족과 거의 절연 상태인데 대화를 다시 시작할 방법이 있을까요',
        '큰 싸움 이후 몇 달째 연락을 끊고 있습니다. 먼저 연락하면 또 상처받을까 봐 무섭고, 그렇다고 이대로 완전히 끝내는 것도 후회될 것 같습니다. 감정이 덜 격해지는 첫 문장을 어떻게 꺼내야 할지 모르겠습니다.',
        false,
        true,
        19,
        0,
        173,
        now() - interval '25 hours',
        now() - interval '25 hours'
      ),
      (
        v_solutions_id,
        v_author_id,
        '빚을 들키기 전에 정리하려면 무엇부터 해야 할까요',
        '카드값을 돌려막다가 생각보다 커졌고, 지금은 정확한 총액부터 정리해야 하는 상황입니다. 가족에게 말하기 전에 해야 할 일, 하지 말아야 할 일이 있으면 현실적으로 조언 부탁드립니다.',
        false,
        true,
        41,
        1,
        348,
        now() - interval '18 hours',
        now() - interval '18 hours'
      ),
      (
        v_solutions_id,
        v_author_id,
        '친구에게 사기 비슷한 일을 당했는데 신고가 맞을까요',
        '가까운 친구라 믿고 돈을 빌려줬는데 계속 거짓말만 하고 있습니다. 감정적으로 끊어내는 것과 법적으로 대응하는 것 사이에서 머뭇거리는데, 경험 있는 분들 조언을 듣고 싶습니다.',
        false,
        true,
        16,
        0,
        147,
        now() - interval '3 hours',
        now() - interval '3 hours'
      ),
      (
        v_solutions_id,
        v_author_id,
        '이직 준비를 몰래 하다가 팀장에게 들켰는데 어떻게 수습할까요',
        '퇴근 후 면접을 보고 다닌 걸 팀장이 알게 됐습니다. 지금 회사에 남을 가능성도 완전히 없지는 않은데 이미 신뢰가 깨진 것 같아서, 어떤 태도로 정리해야 할지 고민입니다.',
        false,
        true,
        22,
        0,
        186,
        now() - interval '15 hours',
        now() - interval '15 hours'
      ),
      (
        v_solutions_id,
        v_author_id,
        '사과를 받아야 끝날 일인지 그냥 멀어지는 게 맞는지 모르겠습니다',
        '상처를 준 사람이 있는데, 제대로 사과받고 정리해야 할지 아니면 더 기대하지 말고 조용히 멀어지는 게 맞을지 계속 흔들립니다. 비슷한 일을 겪은 분들 생각이 궁금합니다.',
        false,
        true,
        20,
        0,
        169,
        now() - interval '1 hours',
        now() - interval '1 hours'
      )
  ) as seed_posts (
    board_id,
    author_id,
    title,
    content,
    is_notice,
    is_anonymous,
    up_count,
    down_count,
    view_count,
    created_at,
    updated_at
  )
  where not exists (
    select 1
    from public.posts p
    where p.author_id = seed_posts.author_id
      and p.title = seed_posts.title
  );
end
$$;
