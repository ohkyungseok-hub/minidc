import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import SectionTitle from "@/components/common/SectionTitle";
import PostFeedTable from "@/components/posts/PostFeedTable";
import { buildMetadata } from "@/config/seo";
import { TOPICS, isValidTopicSlug } from "@/config/topics";
import { getPostsByTopic, getPopularPosts } from "@/lib/posts";

type BestTopicPageProps = {
  params: Promise<{ topic: string }>;
};

export async function generateStaticParams() {
  return Object.keys(TOPICS).map((topic) => ({ topic }));
}

export async function generateMetadata({ params }: BestTopicPageProps): Promise<Metadata> {
  const { topic } = await params;

  if (!isValidTopicSlug(topic)) {
    return {};
  }

  const t = TOPICS[topic];

  return buildMetadata({
    title: t.bestTitle,
    description: t.bestDescription,
    path: `/best/${topic}`,
  });
}

export default async function BestTopicPage({ params }: BestTopicPageProps) {
  const { topic } = await params;

  if (!isValidTopicSlug(topic)) {
    notFound();
  }

  const t = TOPICS[topic];

  const topicResult = await getPostsByTopic(topic, { limit: 30 });
  const posts = topicResult.totalCount > 0
    ? topicResult.items
    : (await getPopularPosts({ limit: 20 }));

  const relatedTopics = t.relatedTopics.map((slug) => TOPICS[slug]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://blackpearls.kr";

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "공감 글 모음", item: `${siteUrl}/best` },
      { "@type": "ListItem", position: 3, name: `${t.label} 공감 글`, item: `${siteUrl}/best/${topic}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-slate-800">홈</Link>
          <span>/</span>
          <Link href="/best" className="hover:text-slate-800">공감 글 모음</Link>
          <span>/</span>
          <span className="font-semibold text-slate-800">{t.label}</span>
        </nav>

        <SectionTitle
          eyebrow={`Best · ${t.emoji} ${t.label}`}
          title={t.bestTitle}
          description={t.bestDescription}
          action={
            <Link
              href={`/topics/${topic}`}
              className="text-sm font-semibold text-[var(--primary-ink)] hover:text-slate-900"
            >
              {t.label} 주제 보기 →
            </Link>
          }
        />

        <PostFeedTable
          posts={posts}
          emptyMessage="아직 집계된 공감 글이 없습니다."
        />

        {relatedTopics.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-bold tracking-[0.14em] text-slate-700">
              비슷한 주제 공감 글
            </h2>
            <div className="flex flex-wrap gap-3">
              {relatedTopics.map((rt) => (
                <Link
                  key={rt.slug}
                  href={`/best/${rt.slug}`}
                  className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--primary)]"
                >
                  <span>{rt.emoji}</span>
                  <span>{rt.label} 공감 글</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-5">
          <p className="text-sm font-bold text-slate-700">다른 공간도 둘러보세요</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link
              href={`/topics/${topic}`}
              className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--primary)]"
            >
              {t.emoji} {t.label} 이야기 더 보기
            </Link>
            <Link
              href="/best"
              className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--primary)]"
            >
              전체 공감 글
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
    </>
  );
}
