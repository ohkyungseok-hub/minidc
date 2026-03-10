import { notFound, redirect } from "next/navigation";
import type { TopicValue } from "@/types";

import { updatePostAction } from "@/app/posts/actions";
import PostForm from "@/components/posts/PostForm";
import SectionTitle from "@/components/common/SectionTitle";
import { isAdminUser, requireUser } from "@/lib/auth";
import { getBoards } from "@/lib/boards";
import { getPostById } from "@/lib/posts";

type EditPostPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EditPostPage({
  params,
  searchParams,
}: EditPostPageProps) {
  const user = await requireUser("/login");
  const { id } = await params;
  const { error } = await searchParams;
  const postId = id.substring(0, 36);
  const [boards, post] = await Promise.all([getBoards(), getPostById(postId)]);

  if (!post) {
    notFound();
  }

  if (post.author_id !== user.id) {
    redirect(`/posts/${post.id}`);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <SectionTitle
        eyebrow="Edit"
        title="글 수정"
        description="본인 글만 수정할 수 있습니다. 저장하면 상세 페이지로 이동합니다."
      />
      <PostForm
        boards={boards}
        formAction={updatePostAction.bind(null, post.id)}
        defaultValues={{
          boardId: post.board_id,
          title: post.title,
          content: post.content,
          isAnonymous: post.is_anonymous,
          isNotice: post.is_notice,
          images: post.images ?? [],
          topic: (post.topic as TopicValue) ?? "",
        }}
        submitLabel="수정 저장"
        errorMessage={error}
        canManageNotice={isAdminUser(user)}
        userId={user.id}
      />
    </div>
  );
}
