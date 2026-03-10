import Link from "next/link";

import type { PostListItem } from "@/types";

type PostFeedTableProps = {
  posts: PostListItem[];
  emptyMessage?: string;
  pinned?: boolean;
};

function formatPostDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export default function PostFeedTable({
  posts,
  emptyMessage = "게시글이 없습니다.",
  pinned = false,
}: PostFeedTableProps) {
  if (!posts.length) {
    return (
      <div className="rounded-md border border-dashed border-[#cbd5e1] bg-white p-8 text-center text-sm text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-[var(--line)] bg-white">
      <div className="hidden grid-cols-[90px_minmax(0,1fr)_130px_120px_90px_90px] gap-4 border-b border-[var(--line)] bg-[var(--surface-strong)] px-5 py-3 text-xs font-bold tracking-[0.18em] text-slate-500 md:grid">
        <span>구분</span>
        <span>제목</span>
        <span>작성자</span>
        <span>작성일</span>
        <span className="text-right">조회</span>
        <span className="text-right">추천</span>
      </div>
      <div className="divide-y divide-[var(--line)]">
        {posts.map((post) => (
          <article
            key={post.id}
            className={`px-4 py-4 transition hover:bg-[var(--primary-soft)] md:px-5 ${
              pinned ? "bg-[var(--sub-soft)]" : ""
            }`}
          >
            <div className="grid gap-2 md:grid-cols-[90px_minmax(0,1fr)_130px_120px_90px_90px] md:items-center md:gap-4">
              <div className="text-sm font-semibold text-slate-500">
                {post.board?.name ? (
                  <span className="inline-flex rounded-sm border border-[var(--line)] bg-[var(--surface-strong)] px-2 py-1 text-xs font-semibold text-slate-600">
                    {post.board.name}
                  </span>
                ) : (
                  <span className="inline-flex rounded-sm border border-[var(--line)] bg-[var(--surface-strong)] px-2 py-1 text-xs font-semibold text-slate-400">
                    —
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <Link
                  href={`/posts/${post.id}`}
                  className="block truncate text-sm font-semibold text-slate-900 transition hover:text-[var(--primary-ink)] md:text-[15px]"
                >
                  <span className="truncate">{post.title}</span>
                </Link>
                {post.board?.name ? (
                  <p className="mt-1 text-xs text-slate-400 md:hidden">
                    {post.board.name}
                  </p>
                ) : null}
              </div>
              <div className="text-sm text-slate-600 md:text-center">
                {post.is_anonymous ? "익명" : post.author?.nickname ?? "anonymous"}
              </div>
              <div className="text-sm text-slate-500 md:text-center">
                {formatPostDate(post.created_at)}
              </div>
              <div className="text-sm text-slate-500 md:text-right">
                <span className="md:hidden">조회 </span>
                {post.view_count}
              </div>
              <div className="text-sm font-semibold text-[var(--primary-ink)] md:text-right">
                <span className="md:hidden">추천 </span>
                {post.recommend_count}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
