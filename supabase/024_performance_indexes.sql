-- ============================================================
-- Migration 024: Performance indexes
-- Adds partial/composite indexes for the most frequent queries
-- ============================================================

-- ── 인기글 TOP 10 (getPopularPosts) ───────────────────────────
-- Filter: is_notice=false, is_hidden=false, created_at >= cutoff
-- Order:  up_count DESC, view_count DESC, created_at DESC
create index if not exists idx_posts_popular
on public.posts (up_count desc, view_count desc, created_at desc)
where is_notice = false and is_hidden = false;

-- ── 최신 일반글 피드 (getFeaturedPosts, getTodayPostCount) ────
-- Filter: is_notice=false, is_hidden=false
-- Order:  created_at DESC
create index if not exists idx_posts_feed
on public.posts (created_at desc)
where is_notice = false and is_hidden = false;

-- ── 공지글 (getNoticePosts) ──────────────────────────────────
-- Filter: is_notice=true, is_hidden=false
-- Order:  created_at DESC
create index if not exists idx_posts_notices
on public.posts (created_at desc)
where is_notice = true and is_hidden = false;

-- ── 게시판별 피드 (getBoardPostFeedBySlug) ───────────────────
-- Existing idx covers (board_id, created_at DESC) but not is_hidden.
-- Drop and recreate as partial index.
drop index if exists posts_board_id_created_at_idx;
create index if not exists idx_posts_board_feed
on public.posts (board_id, created_at desc)
where is_hidden = false;

-- ── post_votes 조회 (getPostVoteState) ──────────────────────
-- Filter: post_id = ?, user_id = ?  (already covered by PK)
-- user_id 단독 조회 보조 (이미 존재하므로 확인 후 생성)
create index if not exists idx_post_votes_user
on public.post_votes (user_id, post_id);

-- ── 댓글 조회 (getCommentsByPostId) ─────────────────────────
-- Filter: post_id = ?, is_hidden = false
-- Order:  created_at ASC
create index if not exists idx_comments_post_feed
on public.comments (post_id, created_at asc)
where is_hidden = false;
