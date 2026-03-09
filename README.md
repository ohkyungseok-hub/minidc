# BLACKPEARLS

Next.js + TypeScript + Tailwind CSS + Supabase로 만드는 디시인사이드 느낌의 미니 커뮤니티 스타터입니다.

현재 저장소는 초보자가 구조를 이해하기 쉽도록 다음 기준으로 나뉘어 있습니다.

- `app/`: 화면 라우트와 API 라우트
- `components/`: 화면에서 재사용하는 UI
- `lib/`: 인증, 게시판, 게시글, 댓글, 투표 로직
- `types/`: DB 타입과 공용 타입

지금 상태는 바로 실행 가능한 UI 스캐폴드이며, 데이터 계층은 `mock*` 데이터로 동작합니다. Supabase 환경변수를 연결한 뒤 `lib/*`에서 실제 쿼리로 바꾸면 됩니다.

## 1. 추천 기술 스택

- Next.js 15
- TypeScript
- Tailwind CSS
- Supabase Auth + Database + SSR

## 2. 새 프로젝트를 만들 때 설치 순서

Next.js 공식 템플릿은 시점에 따라 최신 메이저가 달라질 수 있으므로, App Router 템플릿을 만든 뒤 `next@15`로 고정하는 방식이 가장 안전합니다.

```bash
npx create-next-app@latest blackpearls \
  --ts \
  --tailwind \
  --eslint \
  --app \
  --use-npm \
  --no-src-dir \
  --import-alias "@/*"

cd blackpearls
npm install next@15 eslint-config-next@15
npm install @supabase/supabase-js @supabase/ssr
```

이미 이 저장소를 받고 시작한다면:

```bash
npm install
cp .env.example .env.local
npm run dev
```

## 3. 필요한 패키지

핵심 런타임 패키지:

- `next`
- `react`
- `react-dom`
- `@supabase/supabase-js`
- `@supabase/ssr`

개발 패키지:

- `typescript`
- `@types/node`
- `@types/react`
- `@types/react-dom`
- `tailwindcss`
- `@tailwindcss/postcss`
- `eslint`
- `eslint-config-next`

## 4. 환경 변수

`.env.local` 예시:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 5. 실행 명령어

```bash
npm run dev
npm run lint
npm run build
```

## 6. 초보자용 폴더 구조

```text
blackpearls/
├─ app/
│  ├─ (auth)/
│  │  ├─ login/page.tsx
│  │  └─ signup/page.tsx
│  ├─ boards/
│  │  ├─ page.tsx
│  │  └─ [slug]/page.tsx
│  ├─ posts/
│  │  ├─ new/page.tsx
│  │  └─ [id]/
│  │     ├─ page.tsx
│  │     └─ edit/page.tsx
│  ├─ hot/page.tsx
│  ├─ api/
│  │  ├─ posts/
│  │  │  ├─ route.ts
│  │  │  └─ [id]/route.ts
│  │  ├─ comments/
│  │  │  ├─ route.ts
│  │  │  └─ [id]/route.ts
│  │  ├─ votes/route.ts
│  │  └─ view/route.ts
│  ├─ favicon.ico
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx
├─ components/
│  ├─ common/
│  │  ├─ Header.tsx
│  │  ├─ Nav.tsx
│  │  └─ SectionTitle.tsx
│  ├─ boards/
│  │  ├─ BoardList.tsx
│  │  └─ BoardTabs.tsx
│  ├─ posts/
│  │  ├─ NoticeList.tsx
│  │  ├─ PostList.tsx
│  │  ├─ PostForm.tsx
│  │  ├─ PostDetail.tsx
│  │  └─ VoteButtons.tsx
│  └─ comments/
│     ├─ CommentForm.tsx
│     └─ CommentList.tsx
├─ lib/
│  ├─ supabase/
│  │  ├─ client.ts
│  │  ├─ server.ts
│  │  └─ middleware.ts
│  ├─ auth.ts
│  ├─ boards.ts
│  ├─ posts.ts
│  ├─ comments.ts
│  └─ votes.ts
├─ types/
│  ├─ database.ts
│  └─ index.ts
├─ middleware.ts
├─ .env.example
├─ package.json
└─ tsconfig.json
```

## 7. 왜 이렇게 나누는가

초보자는 보통 “페이지 파일에 모든 걸 다 넣는 구조”에서 금방 꼬입니다. 그래서 기능별 역할을 분리해 두는 편이 유지보수에 훨씬 좋습니다.

- `app/`은 URL과 서버 엔트리
- `components/`는 UI 조립
- `lib/`는 비즈니스 로직
- `types/`는 타입 모음

예를 들어 댓글 삭제가 필요하면:

- 화면 버튼은 `components/comments/CommentList.tsx`
- 삭제 API는 `app/api/comments/[id]/route.ts`
- 실제 삭제 로직은 `lib/comments.ts`

이렇게 찾으면 됩니다.

## 8. 필수 기능을 어디에 구현하면 되는가

- 회원가입 / 로그인: `app/(auth)` + `lib/auth.ts` + `lib/supabase/*`
- 게시판 목록: `app/boards/page.tsx` + `components/boards/*`
- 게시글 CRUD: `app/posts/*` + `app/api/posts/*` + `lib/posts.ts`
- 댓글 작성/삭제: `app/api/comments/*` + `components/comments/*` + `lib/comments.ts`
- 추천/비추천: `components/posts/VoteButtons.tsx` + `app/api/votes/route.ts`
- 공지글: `posts.is_notice` + `components/posts/NoticeList.tsx`
- 인기글: `app/hot/page.tsx` + `lib/posts.ts`

## 9. Supabase로 실제 연결할 때 순서

1. Supabase 프로젝트 생성
2. `.env.local`에 URL, Anon Key 입력
3. `types/database.ts`를 실제 스키마와 맞추기
4. `lib/boards.ts`, `lib/posts.ts`, `lib/comments.ts`, `lib/votes.ts`의 mock 데이터를 Supabase 쿼리로 교체
5. 로그인/회원가입을 `supabase.auth`로 연결
6. Row Level Security 정책 추가

## 10. 지금 바로 확인할 수 있는 것

- 게시판 목록 화면
- 게시글 목록 / 상세 / 수정 화면
- 댓글 작성 UI
- 댓글 삭제 API 구조
- 추천/비추천 API 구조
- 공지글 / 인기글 분리 구조

## 11. 다음 단계 추천

가장 먼저 할 일은 두 가지입니다.

1. Supabase 테이블 스키마를 확정한다.
2. `lib/*`의 mock 데이터를 실제 Supabase 쿼리로 바꾼다.

그 다음부터 로그인, 글 저장, 댓글 저장, 추천 집계를 차례대로 연결하면 됩니다.
