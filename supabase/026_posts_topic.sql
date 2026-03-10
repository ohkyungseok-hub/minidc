-- posts 테이블에 topic 컬럼 추가
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS topic text
    CHECK (topic IN ('work', 'relationship', 'family', 'anxiety', 'loneliness', 'money'));

-- topic 기반 빠른 조회용 인덱스
CREATE INDEX IF NOT EXISTS idx_posts_topic
  ON public.posts (topic, up_count DESC, created_at DESC)
  WHERE topic IS NOT NULL AND is_hidden = false AND is_notice = false;
