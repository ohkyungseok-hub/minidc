import Link from "next/link";

import type { PostListItem } from "@/types";
import { getPostUrl } from "@/lib/utils";

type NoticeListProps = {
  posts: PostListItem[];
};

export default function NoticeList({ posts }: NoticeListProps) {
  if (!posts.length) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-md border border-[var(--line)] bg-white">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={getPostUrl(post.id, post.title)}
          className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-3 transition last:border-b-0 hover:bg-[var(--sub-soft)] md:px-5"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="rounded-sm border border-[var(--sub-strong)] bg-[var(--sub)] px-2 py-1 text-[11px] font-bold text-[var(--primary-ink)]">
              공지
            </span>
            <span className="truncate text-sm font-semibold text-slate-900">
              {post.title}
            </span>
          </div>
          <span className="text-xs font-medium text-slate-500">
            {post.is_notice ? "관리자" : post.is_anonymous ? "익명" : post.author?.nickname ?? "anonymous"}
          </span>
        </Link>
      ))}
    </div>
  );
}
