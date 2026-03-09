import { notFound } from "next/navigation";

import CommentForm from "@/components/comments/CommentForm";
import CommentList from "@/components/comments/CommentList";
import PostDetail from "@/components/posts/PostDetail";
import { getSessionUser } from "@/lib/auth";
import { getCommentsByPostId } from "@/lib/comments";
import { getPostById } from "@/lib/posts";
import { getPostVoteState } from "@/lib/votes";

type PostDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    commentError?: string;
  }>;
};

export default async function PostDetailPage({
  params,
  searchParams,
}: PostDetailPageProps) {
  const { id } = await params;
  const { commentError } = await searchParams;
  const [post, comments, currentUser] = await Promise.all([
    getPostById(id),
    getCommentsByPostId(id),
    getSessionUser(),
  ]);

  if (!post) {
    notFound();
  }

  const voteState = await getPostVoteState(post.id, currentUser?.id);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PostDetail
        post={post}
        canManage={currentUser?.id === post.author_id}
        currentUserId={currentUser?.id}
        voteState={voteState}
      />
      <CommentForm
        postId={post.id}
        currentUserId={currentUser?.id}
        errorMessage={commentError}
      />
      <CommentList comments={comments} currentUserId={currentUser?.id} />
    </div>
  );
}
