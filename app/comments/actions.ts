"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { createComment, deleteComment, getCommentById } from "@/lib/comments";
import { getPostById } from "@/lib/posts";

function encodeMessage(message: string) {
  return encodeURIComponent(message);
}

export async function createCommentAction(postId: string, formData: FormData) {
  const user = await requireUser(`/login?next=${encodeURIComponent(`/posts/${postId}`)}`);
  const body = String(formData.get("body") ?? "").trim();

  if (!body) {
    redirect(`/posts/${postId}?commentError=${encodeMessage("댓글 내용을 입력하세요.")}#comments`);
  }

  const post = await getPostById(postId);

  if (!post) {
    redirect("/boards");
  }

  await createComment({
    postId,
    body,
    authorId: user.id,
  });

  revalidatePath(`/posts/${postId}`);
  redirect(`/posts/${postId}#comments`);
}

export async function deleteCommentAction(postId: string, commentId: string) {
  const user = await requireUser(`/login?next=${encodeURIComponent(`/posts/${postId}`)}`);
  const comment = await getCommentById(commentId);

  if (!comment || comment.post_id !== postId) {
    redirect(`/posts/${postId}#comments`);
  }

  if (comment.author_id !== user.id) {
    redirect(`/posts/${postId}#comments`);
  }

  if (!comment.is_deleted) {
    await deleteComment(commentId, user.id);
    revalidatePath(`/posts/${postId}`);
  }

  redirect(`/posts/${postId}#comments`);
}
