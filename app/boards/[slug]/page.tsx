import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import BoardTabs from "@/components/boards/BoardTabs";
import SearchForm from "@/components/common/SearchForm";
import SectionTitle from "@/components/common/SectionTitle";
import Pagination from "@/components/common/Pagination";
import PageSizeSelect from "@/components/common/PageSizeSelect";
import PostFeedTable from "@/components/posts/PostFeedTable";
import { getBoardBySlug, getBoards } from "@/lib/boards";
import { getBoardPostFeedBySlug } from "@/lib/posts";
import { buildMetadata } from "@/config/seo";

const VALID_PAGE_SIZES = [20, 50, 100] as const;

type BoardDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; q?: string; pageSize?: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const board = await getBoardBySlug(slug);

  if (!board) {
    return { title: "게시판을 찾을 수 없습니다" };
  }

  return buildMetadata({
    title: `${board.name} 게시판`,
    description:
      board.description ??
      `블랙펄즈 ${board.name} 게시판. 익명으로 이야기를 나누고 공감과 위로를 받을 수 있습니다.`,
    path: `/boards/${slug}`,
  });
}

export default async function BoardDetailPage({
  params,
  searchParams,
}: BoardDetailPageProps) {
  const { slug } = await params;
  const { page: rawPage, q: rawQuery, pageSize: rawSize } = await searchParams;

  const query = rawQuery?.trim() ?? "";
  const page = Math.max(Number(rawPage ?? 1) || 1, 1);
  const pageSize = (VALID_PAGE_SIZES as readonly number[]).includes(Number(rawSize))
    ? Number(rawSize)
    : 20;

  const boardsPromise = getBoards();
  const board = await getBoardBySlug(slug);

  if (!board) {
    notFound();
  }

  const [boards, feed] = await Promise.all([
    boardsPromise,
    getBoardPostFeedBySlug(board, { page, query, pageSize }),
  ]);

  function buildHref(p: number) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (pageSize !== 20) params.set("pageSize", String(pageSize));
    params.set("page", String(p));
    return `/boards/${board!.slug}?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      <BoardTabs boards={boards} currentSlug={board.slug} />
      <SectionTitle
        eyebrow="Board"
        title={board.name}
        description={
          query
            ? `'${query}' 검색 결과 총 ${feed.posts.totalCount}개의 일반 글을 찾았습니다.`
            : board.description ?? undefined
        }
        action={(
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <SearchForm
              action={`/boards/${board.slug}`}
              placeholder={`${board.name} 안에서 이야기 검색`}
              defaultValue={query}
              className="w-full sm:w-[280px]"
            />
            <Link
              href={`/posts/new?boardId=${board.id}`}
              className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-ink)] transition hover:bg-[var(--primary-strong)]"
            >
              글쓰기
            </Link>
          </div>
        )}
      />

      {feed.notices.length ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold tracking-[0.14em] text-[var(--primary-ink)]">
              공지글
            </h3>
            <p className="text-sm text-slate-500">{feed.notices.length}개</p>
          </div>
          <PostFeedTable posts={feed.notices} pinned />
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-bold tracking-[0.14em] text-slate-700">
            {query ? "검색 결과" : "최신 글"}
          </h3>
          <div className="flex items-center gap-4">
            <PageSizeSelect value={pageSize} />
            <p className="text-sm text-slate-500 whitespace-nowrap">
              총 {feed.posts.totalCount}개 · {feed.posts.page}/{feed.posts.totalPages} 페이지
            </p>
          </div>
        </div>

        <PostFeedTable
          posts={feed.posts.items}
          emptyMessage="이 게시판에는 아직 올라온 이야기가 없습니다."
        />

        <Pagination
          page={feed.posts.page}
          totalPages={feed.posts.totalPages}
          buildHref={buildHref}
        />
      </section>
    </div>
  );
}
