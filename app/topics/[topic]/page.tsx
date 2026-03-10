import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import SectionTitle from "@/components/common/SectionTitle";
import PostFeedTable from "@/components/posts/PostFeedTable";
import { buildMetadata, SITE_NAME } from "@/config/seo";
import { TOPICS, isValidTopicSlug } from "@/config/topics";
import { getPostsByTopic, getPopularPosts } from "@/lib/posts";

type TopicPageProps = {
  params: Promise<{ topic: string }>;
};

export async function generateStaticParams() {
  return Object.keys(TOPICS).map((topic) => ({ topic }));
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { topic } = await params;

  if (!isValidTopicSlug(topic)) {
    return {};
  }

  const t = TOPICS[topic];

  return buildMetadata({
    title: t.title,
    description: t.description,
    path: `/topics/${topic}`,
  });
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { topic } = await params;

  if (!isValidTopicSlug(topic)) {
    notFound();
  }

  const t = TOPICS[topic];

  // topic 컬럼으로 필터링. topic이 지정되지 않은 글은 getPopularPosts로 보완.
  const topicResult = await getPostsByTopic(topic, { limit: 20 });
  const posts = topicResult.totalCount > 0
    ? topicResult.items
    : (await getPopularPosts({ limit: 10 }));

  const relatedTopics = t.relatedTopics.map((slug) => TOPICS[slug]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://blackpearls.kr";

  // FAQPage JSON-LD
  const faqJsonLd = t.faqs.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: t.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      }
    : null;

  // BreadcrumbList JSON-LD
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "고민 주제", item: `${siteUrl}/topics` },
      { "@type": "ListItem", position: 3, name: t.label, item: `${siteUrl}/topics/${topic}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <div className="space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-slate-800">홈</Link>
          <span>/</span>
          <Link href="/topics" className="hover:text-slate-800">고민 주제</Link>
          <span>/</span>
          <span className="font-semibold text-slate-800">{t.label}</span>
        </nav>

        {/* H1 + 소개 */}
        <section>
          <div className="rounded-2xl border border-[var(--line)] bg-white p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{t.emoji}</span>
              <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                {t.h1}
              </h1>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              {t.intro}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/posts/new"
                className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--primary)] px-5 text-sm font-semibold text-[var(--primary-ink)] transition hover:bg-[var(--primary-strong)]"
              >
                익명으로 털어놓기
              </Link>
              <Link
                href={`/best/${topic}`}
                className="inline-flex h-10 items-center justify-center rounded-md border border-[var(--line)] bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-[var(--primary)]"
              >
                공감 많이 받은 글 보기
              </Link>
            </div>
          </div>
        </section>

        {/* 이런 고민이 많아요 */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold tracking-[0.14em] text-[var(--primary-ink)]">
            이런 고민이 많아요
          </h2>
          <div className="flex flex-wrap gap-2">
            {t.keywords.map((kw) => (
              <Link
                key={kw}
                href={`/search?q=${encodeURIComponent(kw)}`}
                className="rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-[var(--primary)] hover:text-[var(--primary-ink)]"
              >
                {kw}
              </Link>
            ))}
          </div>
        </section>

        {/* 많이 공감받은 이야기 */}
        <section className="space-y-4">
          <SectionTitle
            eyebrow="Popular"
            title="많이 공감받은 이야기"
            description={
              topicResult.totalCount > 0
                ? `${t.label} 주제로 분류된 글 ${topicResult.totalCount}개 중 추천 순`
                : "블랙펄즈에서 공감과 위로를 많이 받은 이야기들입니다."
            }
            action={
              <Link
                href={`/best/${topic}`}
                className="text-sm font-semibold text-[var(--primary-ink)] hover:text-slate-900"
              >
                더 보기
              </Link>
            }
          />
          <PostFeedTable
            posts={posts.slice(0, 10)}
            emptyMessage="아직 공감받은 이야기가 없습니다."
          />
        </section>

        {/* 관련 게시판으로 이동 */}
        {t.boardSlugs.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-bold tracking-[0.14em] text-slate-700">
              관련 게시판
            </h2>
            <div className="flex flex-wrap gap-2">
              {t.boardSlugs.map((boardSlug) => (
                <Link
                  key={boardSlug}
                  href={`/boards/${boardSlug}`}
                  className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--primary)]"
                >
                  {boardSlug} 게시판 →
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 비슷한 주제 둘러보기 */}
        {relatedTopics.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-bold tracking-[0.14em] text-slate-700">
              비슷한 주제 둘러보기
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {relatedTopics.map((rt) => (
                <Link
                  key={rt.slug}
                  href={`/topics/${rt.slug}`}
                  className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-white p-4 transition hover:border-[var(--primary)] hover:bg-[var(--primary-soft)]"
                >
                  <span className="text-2xl">{rt.emoji}</span>
                  <div>
                    <p className="font-bold text-slate-900">{rt.label}</p>
                    <p className="text-xs text-slate-500 line-clamp-1">{rt.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FAQ 섹션 — People Also Ask / FAQPage JSON-LD */}
        {t.faqs.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-bold tracking-[0.14em] text-slate-700">
              자주 묻는 질문
            </h2>
            <div className="divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
              {t.faqs.map((faq, i) => (
                <details key={i} className="group px-5 py-4">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-slate-800 marker:hidden">
                    <span className="mr-2 text-[var(--primary-ink)]">Q.</span>
                    {faq.question}
                  </summary>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    <span className="mr-2 font-bold text-slate-400">A.</span>
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* 하단 내부 링크 */}
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-5">
          <p className="text-sm font-bold text-slate-700">다른 공간도 둘러보세요</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link
              href="/topics"
              className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--primary)]"
            >
              전체 주제 보기
            </Link>
            <Link
              href="/best"
              className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--primary)]"
            >
              공감 많이 받은 글
            </Link>
            <Link
              href="/hot"
              className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--primary)]"
            >
              지금 인기글
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
