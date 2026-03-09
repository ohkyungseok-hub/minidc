import Link from "next/link";

import BoardList from "@/components/boards/BoardList";
import PostList from "@/components/posts/PostList";
import PostFeedTable from "@/components/posts/PostFeedTable";
import NoticeList from "@/components/posts/NoticeList";
import SectionTitle from "@/components/common/SectionTitle";
import { getBoards } from "@/lib/boards";
import { getFeaturedPosts, getNoticePosts, getPopularPosts } from "@/lib/posts";

export default async function HomePage() {
  const [boards, noticePosts, featuredPosts, popularPosts] = await Promise.all([
    getBoards(),
    getNoticePosts(),
    getFeaturedPosts(),
    getPopularPosts(),
  ]);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-md border border-[#d5dce7] bg-white">
          <div className="border-b border-[#dfe5ef] bg-[#f8fafc] px-5 py-3 text-sm font-bold text-[#244a85]">
            메인 안내
          </div>
          <div className="space-y-4 px-5 py-5">
            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              디시인사이드 톤의 가벼운 게시판형 미니 커뮤니티
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
              게시판 탭, 공지 고정, 인기글 집계, 글쓰기와 댓글 흐름을 App Router와
              Supabase 기준으로 정리한 구조입니다.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/boards"
                className="inline-flex h-10 items-center justify-center rounded-md bg-[#2f5ea9] px-4 text-sm font-semibold text-white transition hover:bg-[#244a85]"
              >
                게시판 둘러보기
              </Link>
              <Link
                href="/posts/new"
                className="inline-flex h-10 items-center justify-center rounded-md border border-[#c8d1df] bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-[#9eacc3] hover:text-slate-900"
              >
                새 글 작성
              </Link>
            </div>
          </div>
        </div>
        <div className="grid gap-3">
          <div className="rounded-md border border-[#d5dce7] bg-white p-4">
            <p className="text-xs font-bold tracking-[0.18em] text-slate-500">게시판 수</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{boards.length}</p>
          </div>
          <div className="rounded-md border border-[#d5dce7] bg-white p-4">
            <p className="text-xs font-bold tracking-[0.18em] text-slate-500">최근 3일 인기글</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{popularPosts.length}</p>
          </div>
          <div className="rounded-md border border-[#d5dce7] bg-white p-4 text-sm leading-6 text-slate-600">
            공지글은 상단 고정되고, 인기글은 추천수 우선과 조회수 보조 기준으로 집계됩니다.
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap gap-3">
          {boards.slice(0, 6).map((board) => (
            <Link
              key={board.id}
              href={`/boards/${board.slug}`}
              className="rounded-md border border-[#c8d1df] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#9eacc3] hover:bg-[#f8fbff] hover:text-slate-950"
            >
              {board.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle
          eyebrow="Notice"
          title="공지글"
          description="운영 공지나 필독 글은 `posts.is_notice`를 기준으로 별도 노출합니다."
        />
        <NoticeList posts={noticePosts} />
      </section>

      <section className="space-y-4">
        <SectionTitle
          eyebrow="Popular"
          title="인기글 TOP 10"
          description="최근 3일 이내 글을 추천수 우선, 조회수 보조 기준으로 정렬합니다."
          action={(
            <Link
              href="/hot"
              className="text-sm font-semibold text-amber-700 transition hover:text-amber-800"
            >
              전체 보기
            </Link>
          )}
        />
        <PostFeedTable
          posts={popularPosts}
          emptyMessage="최근 3일 내 집계할 인기글이 없습니다."
        />
      </section>

      <section className="space-y-4">
        <SectionTitle
          eyebrow="Boards"
          title="주요 게시판"
          description="게시판형 표 레이아웃으로 주요 게시판을 빠르게 확인할 수 있습니다."
        />
        <BoardList boards={boards} />
      </section>

      <section className="space-y-4">
        <SectionTitle
          eyebrow="Featured"
          title="최근 주목 글"
          description="홈 피드에서 바로 재사용할 수 있는 게시글 리스트입니다."
        />
        <PostList posts={featuredPosts} emptyMessage="아직 노출할 게시글이 없습니다." />
      </section>
    </div>
  );
}
