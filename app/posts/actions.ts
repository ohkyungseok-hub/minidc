"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdminUser, requireUser } from "@/lib/auth";
import { getBoardById } from "@/lib/boards";
import { createPost, deletePost, getPostById, updatePost } from "@/lib/posts";

type PostFormInput = {
  boardId: string;
  title: string;
  content: string;
  isAnonymous: boolean;
  images: string[];
};

function encodeMessage(message: string) {
  return encodeURIComponent(message);
}

function normalizeFormData(formData: FormData): PostFormInput {
  return {
    boardId: String(formData.get("boardId") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    content: String(formData.get("content") ?? "").trim(),
    isAnonymous: formData.get("isAnonymous") === "on",
    images: formData.getAll("images").map(String).filter(Boolean),
  };
}

function validatePostInput(input: PostFormInput) {
  if (!input.boardId) {
    return "게시판을 선택하세요.";
  }

  if (!input.title) {
    return "제목을 입력하세요.";
  }

  if (!input.content) {
    return "본문을 입력하세요.";
  }

  return null;
}

function getRequestedNoticeValue(formData: FormData) {
  return formData.get("isNotice") === "on";
}

function revalidatePostPages(boardSlug?: string | null, postId?: string) {
  revalidatePath("/");
  revalidatePath("/boards");
  revalidatePath("/hot");

  if (boardSlug) {
    revalidatePath(`/boards/${boardSlug}`);
  }

  if (postId) {
    revalidatePath(`/posts/${postId}`);
    revalidatePath(`/posts/${postId}/edit`);
  }
}

export async function createPostAction(formData: FormData) {
  const user = await requireUser("/login?next=/posts/new");
  const input = normalizeFormData(formData);
  const requestedIsNotice = getRequestedNoticeValue(formData);
  const validationError = validatePostInput(input);

  if (validationError) {
    redirect(`/posts/new?error=${encodeMessage(validationError)}`);
  }

  if (requestedIsNotice && !isAdminUser(user)) {
    redirect(`/posts/new?error=${encodeMessage("공지글은 관리자만 작성할 수 있습니다.")}`);
  }

  const board = await getBoardById(input.boardId);

  if (!board) {
    redirect(`/posts/new?error=${encodeMessage("존재하지 않는 게시판입니다.")}`);
  }

  const post = await createPost({
    boardId: input.boardId,
    title: input.title,
    content: input.content,
    isNotice: isAdminUser(user) ? requestedIsNotice : false,
    isAnonymous: input.isAnonymous,
    authorId: user.id,
    images: input.images,
  });

  revalidatePostPages(post.board?.slug ?? board.slug, post.id);
  redirect(`/posts/${post.id}`);
}

export async function updatePostAction(postId: string, formData: FormData) {
  const user = await requireUser(`/login?next=${encodeURIComponent(`/posts/${postId}/edit`)}`);
  const currentPost = await getPostById(postId);

  if (!currentPost) {
    redirect("/boards");
  }

  if (currentPost.author_id !== user.id) {
    redirect(`/posts/${postId}`);
  }

  const input = normalizeFormData(formData);
  const requestedIsNotice = getRequestedNoticeValue(formData);
  const validationError = validatePostInput(input);

  if (validationError) {
    redirect(`/posts/${postId}/edit?error=${encodeMessage(validationError)}`);
  }

  if (requestedIsNotice && !isAdminUser(user)) {
    redirect(`/posts/${postId}/edit?error=${encodeMessage("공지글은 관리자만 설정할 수 있습니다.")}`);
  }

  const nextBoard = await getBoardById(input.boardId);

  if (!nextBoard) {
    redirect(`/posts/${postId}/edit?error=${encodeMessage("존재하지 않는 게시판입니다.")}`);
  }

  const updatedPost = await updatePost(postId, {
    boardId: input.boardId,
    title: input.title,
    content: input.content,
    isNotice: isAdminUser(user) ? requestedIsNotice : currentPost.is_notice,
    isAnonymous: input.isAnonymous,
    authorId: user.id,
    images: input.images,
  });

  revalidatePostPages(currentPost.board?.slug ?? null, postId);
  revalidatePostPages(updatedPost.board?.slug ?? nextBoard.slug, postId);
  redirect(`/posts/${updatedPost.id}`);
}

export async function deletePostAction(postId: string) {
  const user = await requireUser("/login");
  const currentPost = await getPostById(postId);

  if (!currentPost) {
    redirect("/boards");
  }

  if (currentPost.author_id !== user.id) {
    redirect(`/posts/${postId}`);
  }

  const deletedPost = await deletePost(postId, user.id);

  revalidatePostPages(currentPost.board?.slug ?? deletedPost.board?.slug ?? null, postId);
  redirect(currentPost.board?.slug ? `/boards/${currentPost.board.slug}` : "/boards");
}
