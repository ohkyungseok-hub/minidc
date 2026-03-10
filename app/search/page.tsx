import Link from "next/link";

import PostFeedTable from "@/components/posts/PostFeedTable";
import SectionTitle from "@/components/common/SectionTitle";
import { searchPosts } from "@/lib/posts";

type SearchPageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, page: rawPage } = await searchParams;
  const query = q?.trim() ?? "";
  const page = Math.max(Number(rawPage ?? 1) || 1, 1);

  const result = query ? await searchPosts(query, page) : null;

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Search"
        title="게시글 검색"
        description={
          result
            ? `'${query}' 검색 결과 ${result.totalCount}개`
            : "키워드를 입력하면 전체 게시판에서 게시글을 찾아드립니다."
        }
      />

      {result ? (
        <>
          <PostFeedTable
            posts={result.items}
            emptyMessage={`'${query}'에 해당하는 게시글이 없습니다.`}
          />

          {result.totalPages > 1 ? (
            <nav className="flex items-center justify-center gap-1">
              {page > 1 ? (
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
                  className="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[var(--primary-soft)]"
                >
                  이전
                </Link>
              ) : null}
              {Array.from({ length: result.totalPages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - page) <= 2)
                .map((p) => (
                  <Link
                    key={p}
                    href={`/search?q=${encodeURIComponent(query)}&page=${p}`}
                    className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
                      p === page
                        ? "border-[var(--primary-strong)] bg-[var(--primary)] text-[var(--primary-ink)]"
                        : "border-[var(--line)] bg-white text-slate-700 hover:bg-[var(--primary-soft)]"
                    }`}
                  >
                    {p}
                  </Link>
                ))}
              {page < result.totalPages ? (
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
                  className="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[var(--primary-soft)]"
                >
                  다음
                </Link>
              ) : null}
            </nav>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
