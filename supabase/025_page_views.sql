-- 일 방문자 추적용 테이블
CREATE TABLE IF NOT EXISTS public.page_views (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid        REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views (created_at);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- 누구나 삽입 가능 (비회원 포함)
CREATE POLICY "page_views_insert"
  ON public.page_views
  FOR INSERT
  WITH CHECK (true);

-- 어드민만 조회 가능
CREATE POLICY "page_views_admin_select"
  ON public.page_views
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
