import Link from "next/link";

import type { Post } from "@/types";

type NoticeListProps = {
  posts: Post[];
};

export default function NoticeList({ posts }: NoticeListProps) {
  if (!posts.length) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-md border border-[#d5dce7] bg-white">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/posts/${post.id}`}
          className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eef2f7] px-4 py-3 transition last:border-b-0 hover:bg-[#f8fbff] md:px-5"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="rounded-sm border border-[#f0c674] bg-[#fff2c8] px-2 py-1 text-[11px] font-bold text-[#9a6700]">
              공지
            </span>
            <span className="truncate text-sm font-semibold text-slate-900">
              {post.title}
            </span>
          </div>
          <span className="text-xs font-medium text-slate-500">
            {post.is_anonymous ? "익명" : post.author?.nickname ?? "anonymous"}
          </span>
        </Link>
      ))}
    </div>
  );
}
