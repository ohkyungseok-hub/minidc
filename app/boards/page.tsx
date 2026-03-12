export const dynamic = "force-dynamic";

import BoardTabs from "@/components/boards/BoardTabs";
import SearchForm from "@/components/common/SearchForm";
import SectionTitle from "@/components/common/SectionTitle";
import Pagination from "@/components/common/Pagination";
import PageSizeSelect from "@/components/common/PageSizeSelect";
import PostFeedTable from "@/components/posts/PostFeedTable";
import { getBoards } from "@/lib/boards";
import { getAllPostsFeed } from "@/lib/posts";

const VALID_PAGE_SIZES = [20, 50, 100] as const;

type BoardsPageProps = {
  searchParams: Promise<{ page?: string; q?: string; pageSize?: string }>;
};

export default async function BoardsPage({ searchParams }: BoardsPageProps) {
  const { page: rawPage, q: rawQuery, pageSize: rawSize } = await searchParams;

  const query = rawQuery?.trim() ?? "";
  const page = Math.max(Number(rawPage ?? 1) || 1, 1);
  const pageSize = (VALID_PAGE_SIZES as readonly number[]).includes(Number(rawSize))
    ? Number(rawSize)
    : 20;

  const [boards, feed] = await Promise.all([
    getBoards(),
    getAllPostsFeed({ page, query, pageSize }),
  ]);

  function buildHref(p: number) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (pageSize !== 20) params.set("pageSize", String(pageSize));
    params.set("page", String(p));
    return `/boards?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      <BoardTabs boards={boards} />
      <SectionTitle
        eyebrow="Board"
        title="전체 게시글"
        description={
          query
            ? `'${query}' 검색 결과 총 ${feed.totalCount}개의 글을 찾았습니다.`
            : "전체 게시판의 최신 글을 모아서 보여드립니다."
        }
        action={(
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <SearchForm
              action="/boards"
              placeholder="전체 게시글에서 검색"
              defaultValue={query}
              className="w-full sm:w-[280px]"
            />
          </div>
        )}
      />

      <section className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-bold tracking-[0.14em] text-slate-700">
            {query ? "검색 결과" : "최신 글"}
          </h3>
          <div className="flex items-center gap-4">
            <PageSizeSelect value={pageSize} />
            <p className="text-sm text-slate-500 whitespace-nowrap">
              총 {feed.totalCount}개 · {feed.page}/{feed.totalPages} 페이지
            </p>
          </div>
        </div>

        <PostFeedTable
          posts={feed.items}
          emptyMessage="아직 올라온 이야기가 없습니다."
        />

        <Pagination
          page={feed.page}
          totalPages={feed.totalPages}
          buildHref={buildHref}
        />
      </section>
    </div>
  );
}
