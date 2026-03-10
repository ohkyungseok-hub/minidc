import type { Metadata } from "next";
import Link from "next/link";

import SectionTitle from "@/components/common/SectionTitle";
import PostFeedTable from "@/components/posts/PostFeedTable";
import { buildMetadata } from "@/config/seo";
import { TOPICS, TOPIC_SLUGS } from "@/config/topics";
import { getPopularPosts } from "@/lib/posts";

export const metadata: Metadata = buildMetadata({
  title: "공감 많이 받은 익명 고백 모음",
  description:
    "많은 사람들이 공감하고 위로를 나눈 익명 고백들을 모았습니다. 블랙펄즈에서 가장 많이 읽히고 공감받은 이야기들을 만나보세요.",
  path: "/best",
});

export default async function BestPage() {
  const posts = await getPopularPosts({ limit: 20 });

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Best"
        title="공감 많이 받은 익명 고백 모음"
        description="많은 사람들이 공감하고 위로를 나눈 이야기들을 주제별로 모아두었습니다."
      />

      <p className="max-w-2xl text-sm leading-7 text-slate-600">
        블랙펄즈에서 가장 많은 공감과 위로를 받은 익명 고백들을 모았습니다.
        직장, 연애, 가족, 불안, 외로움, 돈 문제 등 다양한 고민에서 사람들이 가장 많이 공감한 이야기를 주제별로 둘러볼 수 있습니다.
      </p>

      {/* 주제별 공감 글 링크 */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold tracking-[0.14em] text-[var(--primary-ink)]">
          주제별 공감 글 보기
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TOPIC_SLUGS.map((slug) => {
            const t = TOPICS[slug];
            return (
              <Link
                key={slug}
                href={`/best/${slug}`}
                className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-white p-4 transition hover:border-[var(--primary)] hover:shadow-sm"
              >
                <span className="text-2xl">{t.emoji}</span>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900">{t.label} 공감 글</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{t.bestDescription}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 전체 인기글 */}
      <section className="space-y-4">
        <SectionTitle
          eyebrow="All"
          title="전체 공감 글"
          description="주제 구분 없이 공감을 많이 받은 이야기들입니다."
          action={
            <Link
              href="/hot"
              className="text-sm font-semibold text-[var(--primary-ink)] hover:text-slate-900"
            >
              실시간 인기글 →
            </Link>
          }
        />
        <PostFeedTable
          posts={posts}
          emptyMessage="아직 집계된 공감 글이 없습니다."
        />
      </section>

      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-5">
        <p className="text-sm font-bold text-slate-700">다른 공간도 둘러보세요</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link
            href="/topics"
            className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--primary)]"
          >
            고민 주제 탐색
          </Link>
          <Link
            href="/hot"
            className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--primary)]"
          >
            지금 인기글
          </Link>
          <Link
            href="/posts/new"
            className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--primary)]"
          >
            익명으로 털어놓기
          </Link>
        </div>
      </div>
    </div>
  );
}
