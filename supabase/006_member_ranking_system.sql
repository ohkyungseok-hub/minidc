-- ============================================================
-- Migration 006: Member Ranking System
-- Adds level, activity score, and suspension columns to
-- public.users and creates supporting tables, functions,
-- triggers, and views.
--
-- Depends on: 001_auth_users.sql (public.users must exist)
-- ============================================================


-- ============================================================
-- STEP 1: member_levels (reference table — create first)
-- ============================================================
create table if not exists public.member_levels (
  level                   integer     primary key,
  level_name              varchar(50) not null,
  min_score               integer     not null default 0,
  min_days_since_signup   integer     not null default 0,
  requires_phone_verified boolean     not null default false,
  description             text
);

comment on table  public.member_levels                          is 'Membership level definitions and promotion requirements';
comment on column public.member_levels.level                   is 'Level number: 1=new, 2=normal, 3=verified, 4=advanced, 9=admin';
comment on column public.member_levels.min_score               is 'Minimum activity_score required for this level';
comment on column public.member_levels.min_days_since_signup   is 'Minimum days since account creation required';
comment on column public.member_levels.requires_phone_verified is 'Whether phone verification is required';


-- ============================================================
-- STEP 2: Seed member_levels
-- ============================================================
insert into public.member_levels (level, level_name, min_score, min_days_since_signup, requires_phone_verified, description)
values
  (1, '새싹회원',  0,   0,  false, 'Default level for all new accounts. Limited posting rights.'),
  (2, '일반회원',  10,  3,  false, 'Basic member with standard write and comment privileges.'),
  (3, '인증회원',  10,  3,  true,  'Phone-verified member with access to marketplace.'),
  (4, '우수회원',  50,  14, false, 'Long-standing active member with enhanced privileges.'),
  (9, '관리자',    0,   0,  false, 'Site administrator with full permissions.')
on conflict (level) do update
  set level_name              = excluded.level_name,
      min_score               = excluded.min_score,
      min_days_since_signup   = excluded.min_days_since_signup,
      requires_phone_verified = excluded.requires_phone_verified,
      description             = excluded.description;


-- ============================================================
-- STEP 3: Extend public.users with ranking columns
-- ============================================================

-- email: useful for admin lookups without joining auth.users
alter table public.users
  add column if not exists email text;

-- level: current membership level (1~4, 9 for admin)
alter table public.users
  add column if not exists level integer not null default 1
    references public.member_levels(level);

-- activity_score: cumulative score, cannot go below 0
alter table public.users
  add column if not exists activity_score integer not null default 0;

alter table public.users
  add column if not exists email_verified boolean not null default false;

alter table public.users
  add column if not exists phone_verified boolean not null default false;

alter table public.users
  add column if not exists warning_count integer not null default 0;

alter table public.users
  add column if not exists is_suspended boolean not null default false;

-- null = not suspended or permanent suspension
alter table public.users
  add column if not exists suspended_until timestamptz;

-- ── Check constraints (idempotent via DO block) ─────────────
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'users_activity_score_nonneg'
      and conrelid = 'public.users'::regclass
  ) then
    alter table public.users
      add constraint users_activity_score_nonneg check (activity_score >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'users_warning_count_nonneg'
      and conrelid = 'public.users'::regclass
  ) then
    alter table public.users
      add constraint users_warning_count_nonneg check (warning_count >= 0);
  end if;
end $$;

-- ── Add 'moderator' to role constraint ──────────────────────
-- Drop existing constraint and recreate with moderator included
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'users_role_chk'
      and conrelid = 'public.users'::regclass
  ) then
    alter table public.users drop constraint users_role_chk;
  end if;
end $$;

alter table public.users
  add constraint users_role_chk check (role in ('user', 'moderator', 'admin'));

-- ── Indexes ──────────────────────────────────────────────────
create index if not exists idx_users_level          on public.users(level);
create index if not exists idx_users_is_suspended   on public.users(is_suspended);
create index if not exists idx_users_activity_score on public.users(activity_score);


-- ============================================================
-- STEP 4: activity_logs table
-- ============================================================
create table if not exists public.activity_logs (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.users(id) on delete cascade,
  action_type varchar(50) not null
                          check (action_type in (
                            'post_created',
                            'comment_created',
                            'post_upvote_received',
                            'comment_upvote_received',
                            'warning_penalty',
                            'suspension_penalty',
                            'admin_deleted_content'
                          )),
  score_delta integer     not null,
  ref_table   varchar(50),
  ref_id      uuid,
  note        text,
  created_at  timestamptz not null default now()
);

comment on table  public.activity_logs             is 'Immutable log of all activity score changes per user';
comment on column public.activity_logs.score_delta is 'Score change: positive = earned, negative = penalty';
comment on column public.activity_logs.ref_table   is 'Source table name (posts, comments, etc.)';
comment on column public.activity_logs.ref_id      is 'Source record UUID for this activity';

create index if not exists idx_activity_logs_user_id    on public.activity_logs(user_id);
create index if not exists idx_activity_logs_created_at on public.activity_logs(created_at desc);
create index if not exists idx_activity_logs_action     on public.activity_logs(action_type);

alter table public.activity_logs enable row level security;

drop policy if exists "Users can view own activity logs" on public.activity_logs;
create policy "Users can view own activity logs"
on public.activity_logs for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Admins can view all activity logs" on public.activity_logs;
create policy "Admins can view all activity logs"
on public.activity_logs for select
to authenticated
using (public.is_admin((select auth.uid())));


-- ============================================================
-- STEP 5: member_levels RLS
-- ============================================================
alter table public.member_levels enable row level security;

drop policy if exists "Anyone can read member levels" on public.member_levels;
create policy "Anyone can read member levels"
on public.member_levels for select
using (true);


-- ============================================================
-- STEP 6: handle_new_user() — updated to set new columns
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nickname text;
begin
  v_nickname := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'nickname'), ''),
    'user_' || substr(replace(new.id::text, '-', ''), 1, 10)
  );

  insert into public.users (id, nickname, email, level, activity_score, email_verified)
  values (
    new.id,
    v_nickname,
    new.email,
    1,
    0,
    coalesce(new.email_confirmed_at is not null, false)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Ensure trigger exists (recreate to pick up function changes)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================
-- STEP 7: recalculate_member_level(p_user_id)
-- Reads current profile state and sets the correct level.
--
-- Priority order:
--   1. is_suspended = true  → level 1  (forced)
--   2. role = 'admin'       → level 9  (forced)
--   3. level 4 conditions   → level 4
--   4. level 3 conditions   → level 3
--   5. level 2 conditions   → level 2
--   6. default              → level 1
-- ============================================================
create or replace function public.recalculate_member_level(p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user        public.users%rowtype;
  v_days_since  integer;
  v_new_level   integer;
begin
  select * into v_user
  from public.users
  where id = p_user_id;

  if not found then
    raise exception 'User not found: %', p_user_id;
  end if;

  v_days_since := extract(epoch from (now() - v_user.created_at)) / 86400;

  -- ── Level decision tree ──────────────────────────────────
  if v_user.is_suspended = true then
    v_new_level := 1;

  elsif v_user.role = 'admin' then
    v_new_level := 9;

  elsif v_days_since            >= 14
    and v_user.activity_score   >= 50
    and v_user.warning_count    <= 1
    and v_user.is_suspended     = false
  then
    v_new_level := 4;

  elsif v_days_since            >= 3
    and v_user.activity_score   >= 10
    and v_user.phone_verified   = true
  then
    v_new_level := 3;

  elsif v_days_since            >= 3
    and v_user.activity_score   >= 10
  then
    v_new_level := 2;

  else
    v_new_level := 1;
  end if;

  -- Only write if level actually changed
  if v_user.level <> v_new_level then
    update public.users
    set level      = v_new_level,
        updated_at = now()
    where id = p_user_id;
  end if;

  return v_new_level;
end;
$$;

grant execute on function public.recalculate_member_level(uuid) to authenticated;


-- ============================================================
-- STEP 8: apply_activity_score(...)
-- Records an activity log entry, updates activity_score,
-- and triggers level recalculation — all in one atomic call.
-- ============================================================
create or replace function public.apply_activity_score(
  p_user_id   uuid,
  p_action    varchar(50),
  p_ref_table varchar(50) default null,
  p_ref_id    uuid        default null,
  p_note      text        default null
)
returns table (new_score integer, new_level integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_delta         integer;
  v_current_score integer;
  v_final_score   integer;
  v_new_level     integer;
begin
  -- ── Map action → score delta ─────────────────────────────
  v_delta := case p_action
    when 'post_created'            then  3
    when 'comment_created'         then  1
    when 'post_upvote_received'    then  2
    when 'comment_upvote_received' then  1
    when 'warning_penalty'         then -10
    when 'suspension_penalty'      then -30
    when 'admin_deleted_content'   then -10
    else null
  end;

  if v_delta is null then
    raise exception 'Unknown action_type: %', p_action;
  end if;

  -- Lock row for this transaction
  select activity_score into v_current_score
  from public.users
  where id = p_user_id
  for update;

  if not found then
    raise exception 'User not found: %', p_user_id;
  end if;

  -- Clamp score to minimum 0
  v_final_score := greatest(0, v_current_score + v_delta);

  -- ── Insert activity log ──────────────────────────────────
  insert into public.activity_logs (
    user_id, action_type, score_delta, ref_table, ref_id, note
  ) values (
    p_user_id, p_action, v_delta, p_ref_table, p_ref_id, p_note
  );

  -- ── Update score ─────────────────────────────────────────
  update public.users
  set activity_score = v_final_score,
      updated_at     = now()
  where id = p_user_id;

  -- ── Recalculate level ────────────────────────────────────
  v_new_level := public.recalculate_member_level(p_user_id);

  return query select v_final_score, v_new_level;
end;
$$;

grant execute on function public.apply_activity_score(uuid, varchar, varchar, uuid, text) to authenticated;


-- ============================================================
-- STEP 9: release_expired_suspensions()
-- Lifts suspensions whose suspended_until has passed.
-- Intended for pg_cron or scheduled Edge Function.
-- Returns number of accounts released.
-- ============================================================
create or replace function public.release_expired_suspensions()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid;
  v_ids   uuid[];
  v_count integer;
begin
  update public.users
  set is_suspended    = false,
      suspended_until = null,
      updated_at      = now()
  where is_suspended    = true
    and suspended_until is not null
    and suspended_until <= now()
  returning id into v_ids;

  get diagnostics v_count = row_count;

  -- Recalculate level for each released user
  if v_count > 0 then
    foreach v_uid in array v_ids loop
      perform public.recalculate_member_level(v_uid);
    end loop;
  end if;

  return v_count;
end;
$$;


-- ============================================================
-- STEP 10: Trigger — auto-recalculate level on key column changes
-- Fires AFTER UPDATE on columns that affect level logic.
-- The recalculate function only writes to `level`, so this
-- trigger will NOT fire recursively.
-- ============================================================
create or replace function public.trg_recalculate_level_on_user_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only recalculate when a level-relevant column actually changed
  if  old.phone_verified is distinct from new.phone_verified
   or old.is_suspended   is distinct from new.is_suspended
   or old.role           is distinct from new.role
   or old.warning_count  is distinct from new.warning_count
  then
    perform public.recalculate_member_level(new.id);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_users_level_recalc on public.users;
create trigger trg_users_level_recalc
  after update of phone_verified, is_suspended, role, warning_count
  on public.users
  for each row
  execute function public.trg_recalculate_level_on_user_change();


-- ============================================================
-- STEP 11: profile_permissions view
-- Exposes boolean permission flags based on level and role.
-- Use this in application code instead of raw level checks.
-- ============================================================
create or replace view public.profile_permissions as
select
  u.id                                              as user_id,
  u.nickname,
  u.role,
  u.level,
  u.is_suspended,
  u.activity_score,

  -- 글쓰기: level 2 이상 + 미정지
  (u.level >= 2 and u.is_suspended = false)         as can_write_post,

  -- 댓글: level 2 이상 + 미정지
  (u.level >= 2 and u.is_suspended = false)         as can_write_comment,

  -- 추천/비추천: level 2 이상 + 미정지
  (u.level >= 2 and u.is_suspended = false)         as can_vote,

  -- 장터: level 3(인증회원) 이상 + 미정지
  (u.level >= 3 and u.is_suspended = false)         as can_access_market,

  -- 우수회원 전용 게시판
  (u.level >= 4 and u.is_suspended = false)         as can_access_advanced_board,

  -- 공지 작성: admin 전용
  (u.role = 'admin')                                as can_write_notice,

  -- 회원 관리: admin 전용
  (u.role = 'admin')                                as can_manage_users,

  -- 신고 처리: moderator 이상
  (u.role in ('admin', 'moderator'))                as can_handle_reports,

  -- 콘텐츠 삭제: moderator 이상
  (u.role in ('admin', 'moderator'))                as can_delete_content

from public.users u;

comment on view public.profile_permissions is
  'Per-user permission flags derived from level and role. Query this view instead of checking raw level values in application code.';


-- ============================================================
-- STEP 12: Update existing posts RLS to check level >= 2
-- Replaces the old policy which had no level restriction.
-- ============================================================
drop policy if exists "Authenticated users can insert own posts" on public.posts;
create policy "Authenticated users can insert own posts"
on public.posts for insert
to authenticated
with check (
  (select auth.uid()) = author_id
  and (
    -- must be level 2+ or admin to post
    exists (
      select 1 from public.users
      where id = (select auth.uid())
        and (level >= 2 or role = 'admin')
        and is_suspended = false
    )
  )
  and (
    is_notice = false
    or public.is_admin((select auth.uid()))
  )
);

-- Update posts update policy similarly
drop policy if exists "Users can update own posts" on public.posts;
create policy "Users can update own posts"
on public.posts for update
to authenticated
using ((select auth.uid()) = author_id)
with check (
  (select auth.uid()) = author_id
  and exists (
    select 1 from public.users
    where id = (select auth.uid())
      and is_suspended = false
  )
  and (
    is_notice = false
    or public.is_admin((select auth.uid()))
  )
);

-- Update comments insert policy to require level >= 2
drop policy if exists "Authenticated users can insert own comments" on public.comments;
create policy "Authenticated users can insert own comments"
on public.comments for insert
to authenticated
with check (
  (select auth.uid()) = author_id
  and exists (
    select 1 from public.users
    where id = (select auth.uid())
      and (level >= 2 or role = 'admin')
      and is_suspended = false
  )
);
