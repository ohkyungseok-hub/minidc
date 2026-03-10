import Link from "next/link";

import { getScore } from "@/lib/votes";
import type { Post } from "@/types";

type PostListProps = {
  posts: Post[];
  emptyMessage?: string;
};

export default function PostList({
  posts,
  emptyMessage = "게시글이 없습니다.",
}: PostListProps) {
  if (!posts.length) {
    return (
      <div className="rounded-md border border-dashed border-[#cbd5e1] bg-white p-10 text-center text-sm text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-[var(--line)] bg-white">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/posts/${post.id}`}
          className="block border-b border-[var(--line)] px-4 py-4 transition last:border-b-0 hover:bg-[var(--primary-soft)] md:px-5"
        >
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400">
            <span className="text-[var(--primary-ink)]">{post.board?.name ?? "게시판"}</span>
            {post.is_notice ? (
              <span className="rounded-sm border border-[var(--sub-strong)] bg-[var(--sub)] px-2 py-0.5 text-[11px] font-bold text-[var(--primary-ink)]">
                공지
              </span>
            ) : null}
            <span>{post.is_anonymous ? "익명" : post.author?.nickname ?? "anonymous"}</span>
          </div>
          <h3 className="mt-2 text-lg font-bold tracking-tight text-slate-950">
            {post.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
            {post.content}
          </p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm font-medium text-slate-500">
            <span>점수 {getScore(post)}</span>
            <span>댓글 {post.comment_count ?? 0}</span>
            <span>조회 {post.view_count}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
