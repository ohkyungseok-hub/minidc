import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import CommentForm from "@/components/comments/CommentForm";
import CommentList from "@/components/comments/CommentList";
import PostDetail from "@/components/posts/PostDetail";
import { getSessionUser } from "@/lib/auth";
import { getCommentsByPostId } from "@/lib/comments";
import { getPostById, getPopularPosts } from "@/lib/posts";
import { getPostVoteState } from "@/lib/votes";
import { buildPostMetadata, SITE_URL } from "@/config/seo";
import { extractPostId, getPostUrl } from "@/lib/utils";

type PostDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    commentError?: string;
  }>;
};

export async function generateMetadata({ params }: PostDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getPostById(extractPostId(id));

  if (!post) {
    return { title: "게시글을 찾을 수 없습니다" };
  }

  const topicLabel = post.board?.name;

  return buildPostMetadata({
    postId: post.id,
    title: post.is_notice ? `[공지] ${post.title}` : post.title,
    content: post.content,
    topicLabel,
  });
}

export default async function PostDetailPage({
  params,
  searchParams,
}: PostDetailPageProps) {
  const { id } = await params;
  const { commentError } = await searchParams;
  const postId = extractPostId(id); // pretty URL 호환: UUID 36자 추출
  // getSessionUser is React-cached; calling it first lets the 3 heavier
  // DB queries start in parallel while auth resolves concurrently.
  const currentUser = await getSessionUser();
  const [post, comments, voteState, relatedPosts] = await Promise.all([
    getPostById(postId),
    getCommentsByPostId(postId),
    getPostVoteState(postId, currentUser?.id),
    getPopularPosts({ limit: 5 }),
  ]);

  if (!post) {
    notFound();
  }

  // Article JSON-LD
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    headline: post.title,
    text: post.content.slice(0, 500),
    url: `${SITE_URL}/posts/${post.id}`,
    datePublished: post.created_at,
    dateModified: post.updated_at ?? post.created_at,
    author: {
      "@type": "Person",
      name: post.is_anonymous ? "익명" : (post.author?.nickname ?? "익명"),
    },
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/LikeAction",
        userInteractionCount: post.up_count,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/CommentAction",
        userInteractionCount: comments.length,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <div className="mx-auto max-w-4xl space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-slate-800">홈</Link>
          {post.board && (
            <>
              <span>/</span>
              <Link href={`/boards/${post.board.slug}`} className="hover:text-slate-800">
                {post.board.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="truncate max-w-[200px] font-semibold text-slate-800">{post.title}</span>
        </nav>

        <PostDetail
          post={post}
          canManage={currentUser?.id === post.author_id}
          currentUserId={currentUser?.id}
          voteState={voteState}
        />

        {/* 관련 글 — 내부 링크 */}
        {relatedPosts.length > 0 && (
          <aside className="rounded-2xl border border-[var(--line)] bg-white p-5">
            <h2 className="text-sm font-bold text-slate-700">많이 공감받은 이야기</h2>
            <ul className="mt-3 divide-y divide-[var(--line)]">
              {relatedPosts
                .filter((p) => p.id !== post.id)
                .slice(0, 4)
                .map((p) => (
                  <li key={p.id}>
                    <Link
                      href={getPostUrl(p.id, p.title)}
                      className="flex items-center justify-between gap-3 py-3 text-sm text-slate-700 transition hover:text-[var(--primary-ink)]"
                    >
                      <span className="truncate font-semibold">{p.title}</span>
                      <span className="shrink-0 text-xs text-slate-400">추천 {p.recommend_count}</span>
                    </Link>
                  </li>
                ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              {post.board && (
                <Link
                  href={`/boards/${post.board.slug}`}
                  className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-[var(--primary)]"
                >
                  {post.board.name} 게시판 더 보기
                </Link>
              )}
              <Link
                href="/best"
                className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-[var(--primary)]"
              >
                공감 글 모음
              </Link>
              <Link
                href="/topics"
                className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-[var(--primary)]"
              >
                고민 주제 탐색
              </Link>
            </div>
          </aside>
        )}

        <CommentForm
          postId={post.id}
          currentUserId={currentUser?.id}
          errorMessage={commentError}
        />
        <CommentList comments={comments} currentUserId={currentUser?.id} />
      </div>
    </>
  );
}
