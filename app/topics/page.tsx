import type { Metadata } from "next";
import Link from "next/link";

import SectionTitle from "@/components/common/SectionTitle";
import { buildMetadata } from "@/config/seo";
import { TOPICS, TOPIC_SLUGS } from "@/config/topics";

export const metadata: Metadata = buildMetadata({
  title: "익명 고민 주제 모음",
  description:
    "직장, 연애, 가족, 불안, 외로움, 돈 문제까지. 남에게 쉽게 말 못하는 고민을 익명으로 털어놓고 공감과 위로를 나눌 수 있는 블랙펄즈의 고민 주제 모음입니다.",
  path: "/topics",
});

export default function TopicsPage() {
  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Topics"
        title="익명 고민 주제 모음"
        description="직장, 연애, 가족, 불안, 외로움, 돈 문제까지. 내 마음에 가장 가까운 주제를 골라보세요."
      />

      <p className="max-w-2xl text-sm leading-7 text-slate-600">
        남에게 쉽게 말 못하는 고민은 주제가 정해져 있는 경우가 많습니다.
        블랙펄즈는 그 주제별로 비슷한 고민을 가진 사람들의 이야기를 모아두었습니다.
        같은 상황을 겪어본 사람의 말 한 마디가 가장 큰 위로가 되기도 합니다.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOPIC_SLUGS.map((slug) => {
          const t = TOPICS[slug];
          return (
            <Link
              key={slug}
              href={`/topics/${slug}`}
              className="group flex flex-col gap-3 rounded-2xl border border-[var(--line)] bg-white p-5 transition hover:border-[var(--primary)] hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{t.emoji}</span>
                <span className="text-lg font-black text-slate-950 group-hover:text-[var(--primary-ink)]">
                  {t.label}
                </span>
              </div>
              <p className="text-sm leading-6 text-slate-600">{t.description}</p>
              <span className="mt-auto self-start text-xs font-semibold text-[var(--primary-ink)]">
                이야기 보기 →
              </span>
            </Link>
          );
        })}
      </div>

      {/* 내부 링크 */}
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-5">
        <p className="text-sm font-bold text-slate-700">다른 공간도 둘러보세요</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link
            href="/best"
            className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--primary)]"
          >
            공감 많이 받은 글 모음
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
