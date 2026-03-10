import type { Metadata } from "next";

import SectionTitle from "@/components/common/SectionTitle";
import Pagination from "@/components/common/Pagination";
import PageSizeSelect from "@/components/common/PageSizeSelect";
import PostFeedTable from "@/components/posts/PostFeedTable";
import { searchPosts } from "@/lib/posts";
import { buildMetadata } from "@/config/seo";

export const metadata: Metadata = buildMetadata({
  title: "게시글 검색",
  description: "블랙펄즈 전체 게시판에서 키워드로 익명 고백 이야기를 검색할 수 있습니다.",
  path: "/search",
  noindex: true, // 검색결과 페이지는 색인 제외
});

const VALID_PAGE_SIZES = [20, 50, 100] as const;

type SearchPageProps = {
  searchParams: Promise<{ q?: string; page?: string; pageSize?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, page: rawPage, pageSize: rawSize } = await searchParams;

  const query = q?.trim() ?? "";
  const page = Math.max(Number(rawPage ?? 1) || 1, 1);
  const pageSize = (VALID_PAGE_SIZES as readonly number[]).includes(Number(rawSize))
    ? Number(rawSize)
    : 20;

  const result = query ? await searchPosts(query, page, pageSize) : null;

  function buildHref(p: number) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (pageSize !== 20) params.set("pageSize", String(pageSize));
    params.set("page", String(p));
    return `/search?${params.toString()}`;
  }

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
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              총 {result.totalCount}개 · {result.page}/{result.totalPages} 페이지
            </p>
            <PageSizeSelect value={pageSize} />
          </div>

          <PostFeedTable
            posts={result.items}
            emptyMessage={`'${query}'에 해당하는 게시글이 없습니다.`}
          />

          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            buildHref={buildHref}
          />
        </>
      ) : null}
    </div>
  );
}
