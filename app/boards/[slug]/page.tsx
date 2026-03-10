import { notFound } from "next/navigation";
import Link from "next/link";

import BoardTabs from "@/components/boards/BoardTabs";
import SearchForm from "@/components/common/SearchForm";
import SectionTitle from "@/components/common/SectionTitle";
import PostFeedTable from "@/components/posts/PostFeedTable";
import { getBoardBySlug, getBoards } from "@/lib/boards";
import { getBoardPostFeedBySlug } from "@/lib/posts";

type BoardDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
    q?: string;
  }>;
};

export default async function BoardDetailPage({
  params,
  searchParams,
}: BoardDetailPageProps) {
  const { slug } = await params;
  const { page: rawPage, q: rawQuery } = await searchParams;
  const query = rawQuery?.trim() ?? "";
  const page = Number.isNaN(Number(rawPage)) ? 1 : Math.max(Number(rawPage ?? 1), 1);
  // Start getBoards() immediately; await the board lookup in parallel,
  // then kick off the feed query as soon as the board id is known.
  const boardsPromise = getBoards();
  const board = await getBoardBySlug(slug);

  if (!board) {
    notFound();
  }

  const [boards, feed] = await Promise.all([
    boardsPromise,
    getBoardPostFeedBySlug(board, { page, query }),
  ]);

  return (
    <div className="space-y-6">
      <BoardTabs boards={boards} currentSlug={board.slug} />
      <SectionTitle
        eyebrow="Board"
        title={board.name}
        description={
          query
            ? `‘${query}’ 검색 결과 총 ${feed.posts.totalCount}개의 일반 글을 찾았습니다.`
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
          <p className="text-sm text-slate-500">
            총 {feed.posts.totalCount}개 · 페이지 {feed.posts.page}/{feed.posts.totalPages}
          </p>
        </div>
        <PostFeedTable
          posts={feed.posts.items}
          emptyMessage="이 게시판에는 아직 올라온 이야기가 없습니다."
        />
      </section>
    </div>
  );
}
