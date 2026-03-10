import Link from "next/link";

import { deletePostAction } from "@/app/posts/actions";
import type { Post, PostVoteState } from "@/types";

import VoteButtons from "./VoteButtons";

type PostDetailProps = {
  post: Post;
  canManage?: boolean;
  currentUserId?: string;
  voteState?: PostVoteState;
};

export default function PostDetail({
  post,
  canManage = false,
  currentUserId,
  voteState,
}: PostDetailProps) {
  return (
    <article className="rounded-[2rem] border border-black/10 bg-white/90 p-8 shadow-sm">
      <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
        {post.board ? (
          <Link href={`/boards/${post.board.slug}`} className="text-[var(--primary-ink)]">
            {post.board.name}
          </Link>
        ) : null}
        {post.is_notice ? (
          <>
            <span>•</span>
            <span className="rounded-full bg-[var(--sub)] px-2 py-1 tracking-[0.18em] text-[var(--primary-ink)]">
              공지
            </span>
          </>
        ) : null}
        <span>•</span>
        <span>{post.is_anonymous ? "익명" : post.author?.nickname ?? "anonymous"}</span>
        <span>•</span>
        <span>조회 {post.view_count}</span>
      </div>
      <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">
        {post.title}
      </h1>
      <p className="mt-6 whitespace-pre-wrap text-base leading-8 text-slate-700">
        {post.content}
      </p>

      {post.images && post.images.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {post.images.map((url, i) => (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`첨부 이미지 ${i + 1}`}
                loading="lazy"
                decoding="async"
                className="h-48 w-full object-cover transition hover:opacity-90"
              />
            </a>
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6">
        <VoteButtons
          postId={post.id}
          initialUpCount={voteState?.upCount ?? post.up_count}
          initialDownCount={voteState?.downCount ?? post.down_count}
          initialVote={voteState?.currentVote ?? 0}
          isAuthenticated={Boolean(currentUserId)}
          loginHref={`/login?next=${encodeURIComponent(`/posts/${post.id}`)}`}
        />
        {canManage ? (
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/posts/${post.id}/edit`}
              className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-slate-950"
            >
              수정
            </Link>
            <form action={deletePostAction.bind(null, post.id)}>
              <button
                type="submit"
                className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
              >
                삭제
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </article>
  );
}
