import type { Metadata } from "next";
import Link from "next/link";

import BoardList from "@/components/boards/BoardList";
import PollWidget from "@/components/polls/PollWidget";
import PostFeedTable from "@/components/posts/PostFeedTable";
import NoticeList from "@/components/posts/NoticeList";
import SectionTitle from "@/components/common/SectionTitle";
import { getBoards } from "@/lib/boards";
import { getFeaturedPosts, getNoticePosts, getPopularPosts, getTodayPostCount } from "@/lib/posts";
import { buildMetadata, SITE_NAME } from "@/config/seo";
import { TOPICS, TOPIC_SLUGS } from "@/config/topics";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: `${SITE_NAME} | 익명 고백 커뮤니티, 위로와 공감을 나누는 공간`,
  description:
    "블랙펄즈는 남에게 말 못한 고민과 치부를 익명으로 털어놓고, 타인의 이야기에서 위로와 공감을 얻는 익명 커뮤니티입니다. 고백을 소비하지 않고 함께 견디며 때로는 해결책까지 모아가는 공간입니다.",
  path: "/",
});

export default async function HomePage() {
  const [boards, noticePosts, featuredPosts, popularPosts, todayPostCount] = await Promise.all([
    getBoards(),
    getNoticePosts(),
    getFeaturedPosts(),
    getPopularPosts(),
    getTodayPostCount(),
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
            <p className="text-xs font-bold tracking-[0.18em] text-slate-500">오늘 작성된 글</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{todayPostCount}</p>
          </div>
          <div className="rounded-md border border-[var(--line)] bg-[var(--sub-soft)] p-4 text-sm leading-6 text-slate-600">
            고해성사, 위로, 해결책 세 게시판을 중심으로 익명 고백과 공감, 조언이 모이는 구조입니다.
          </div>
          <PollWidget />
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
          title="최근 등록된 이야기"
          description="방금 올라온 글과 최근 등록된 이야기를 먼저 살펴볼 수 있습니다."
        />
        <PostFeedTable posts={featuredPosts} emptyMessage="아직 노출할 게시글이 없습니다." />
      </section>

      {/* 고민 주제 허브 — SEO 내부 링크 */}
      <section className="space-y-4">
        <SectionTitle
          eyebrow="Topics"
          title="고민 주제별 이야기"
          description="직장, 연애, 가족, 불안, 외로움, 돈 문제. 내 마음에 가장 가까운 주제를 골라 이야기를 찾아보세요."
          action={
            <Link
              href="/topics"
              className="text-sm font-semibold text-[var(--primary-ink)] transition hover:text-slate-900"
            >
              전체 주제 보기
            </Link>
          }
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {TOPIC_SLUGS.map((slug) => {
            const t = TOPICS[slug];
            return (
              <Link
                key={slug}
                href={`/topics/${slug}`}
                className="flex flex-col items-center gap-2 rounded-2xl border border-[var(--line)] bg-white px-3 py-4 text-center transition hover:border-[var(--primary)] hover:bg-[var(--primary-soft)]"
              >
                <span className="text-2xl">{t.emoji}</span>
                <span className="text-sm font-bold text-slate-800">{t.label}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
