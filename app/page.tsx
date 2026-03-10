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
        <div className="rounded-md border border-[var(--line)] bg-white">
          <div className="border-b border-[var(--line)] bg-[var(--surface-strong)] px-5 py-3 text-sm font-bold text-[var(--primary-ink)]">
            bless you
          </div>
          <div className="space-y-4 px-5 py-5">
            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              남에게 말 못한 치부를 익명으로 고백하고, 타인의 이야기에서 위로를 받는 공간
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
              BLACKPEARLS는 누군가의 고백을 함부로 소비하지 않고, 함께 견디고,
              필요한 경우에는 해결책까지 모아보는 익명 커뮤니티를 목표로 합니다.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/posts/new"
                className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-ink)] transition hover:bg-[var(--primary-strong)]"
              >
                익명 글 작성
              </Link>
            </div>
          </div>
        </div>
        <div className="grid gap-3">
          <div className="rounded-md border border-[var(--line)] bg-white p-4">
            <p className="text-xs font-bold tracking-[0.18em] text-slate-500">게시판 수</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{boards.length}</p>
          </div>
          <div className="rounded-md border border-[var(--line)] bg-white p-4">
            <p className="text-xs font-bold tracking-[0.18em] text-slate-500">최근 3일 인기글</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{popularPosts.length}</p>
          </div>
          <div className="rounded-md border border-[var(--line)] bg-[var(--sub-soft)] p-4 text-sm leading-6 text-slate-600">
            고해성사, 위로, 해결책 세 게시판을 중심으로 익명 고백과 공감, 조언이 모이는 구조입니다.
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle
          eyebrow="Notice"
          title="공지글"
          description="운영 공지와 이용 가이드는 상단에 고정되어 처음 온 사용자도 흐름을 이해할 수 있습니다."
        />
        <NoticeList posts={noticePosts} />
      </section>

      <section className="space-y-4">
        <SectionTitle
          eyebrow="Boards"
          title="주요 게시판"
          description="고백, 위로, 해결책 세 흐름으로 나누어 마음 상태에 맞는 공간을 찾을 수 있습니다."
        />
        <BoardList boards={boards} />
      </section>

      <section className="space-y-4">
        <SectionTitle
          eyebrow="Popular"
          title="인기글 TOP 10"
          description="최근 3일 동안 많은 공감과 반응을 얻은 이야기들을 모아 봅니다."
          action={(
            <Link
              href="/hot"
              className="text-sm font-semibold text-[var(--primary-ink)] transition hover:text-slate-900"
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
          eyebrow="Featured"
          title="지금 많이 읽히는 이야기"
          description="최근 올라온 글 중 공감과 반응이 빠르게 모이는 이야기입니다."
        />
        <PostList posts={featuredPosts} emptyMessage="아직 노출할 게시글이 없습니다." />
      </section>
    </div>
  );
}
