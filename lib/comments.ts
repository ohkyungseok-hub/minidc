import { createSupabaseServer } from "@/lib/supabase/server";
import type { Comment, UserProfile } from "@/types";

const authors: Record<string, UserProfile> = {
  "user-demo": {
    id: "user-demo",
    nickname: "orbit",
    role: "admin",
    level: 4,
    warning_count: 0,
    is_suspended: false,
    suspended_until: null,
    avatar_url: null,
    created_at: "2026-03-09T09:00:00.000Z",
    updated_at: null,
  },
  "user-luma": {
    id: "user-luma",
    nickname: "luma",
    role: "user",
    level: 2,
    warning_count: 0,
    is_suspended: false,
    suspended_until: null,
    avatar_url: null,
    created_at: "2026-03-09T10:00:00.000Z",
    updated_at: null,
  },
};

type SupabaseCommentRow = {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  is_deleted: boolean;
  is_hidden: boolean;
  hidden_reason: string | null;
  upvotes: number | null;
  downvotes: number | null;
  created_at: string;
  updated_at: string | null;
  author:
    | {
        id: string;
        nickname: string;
        role: "user" | "admin";
        level: number;
        warning_count: number;
        is_suspended: boolean;
        suspended_until: string | null;
        avatar_url: string | null;
        created_at: string;
        updated_at: string | null;
      }
    | {
        id: string;
        nickname: string;
        role: "user" | "admin";
        level: number;
        warning_count: number;
        is_suspended: boolean;
        suspended_until: string | null;
        avatar_url: string | null;
        created_at: string;
        updated_at: string | null;
      }[]
    | null;
};

const commentSelect = `
  id,
  post_id,
  author_id,
  body,
  is_deleted,
  is_hidden,
  hidden_reason,
  upvotes,
  downvotes,
  created_at,
  updated_at,
  author:users!comments_author_id_fkey (
    id,
    nickname,
    role,
    level,
    warning_count,
    is_suspended,
    suspended_until,
    avatar_url,
    created_at,
    updated_at
  )
`;

let mockComments: Comment[] = [
  {
    id: "comment-1",
    post_id: "post-1",
    author_id: "user-luma",
    body: "라우팅과 도메인 컴포넌트 분리가 먼저 잡혀 있으면 이후 작업 속도가 확실히 빨라집니다.",
    is_deleted: false,
    is_hidden: false,
    hidden_reason: null,
    upvotes: 4,
    downvotes: 0,
    created_at: "2026-03-09T12:30:00.000Z",
    updated_at: null,
    author: authors["user-luma"],
  },
  {
    id: "comment-2",
    post_id: "post-1",
    author_id: "user-demo",
    body: "맞습니다. 특히 boards/posts/comments 계층을 미리 나누는 게 중요하죠.",
    is_deleted: false,
    is_hidden: false,
    hidden_reason: null,
    upvotes: 3,
    downvotes: 0,
    created_at: "2026-03-09T12:45:00.000Z",
    updated_at: null,
    author: authors["user-demo"],
  },
  {
    id: "comment-3",
    post_id: "post-2",
    author_id: "user-demo",
    body: "env가 비어 있는 상태도 안전하게 처리해야 초기 세팅 피로도가 줄어듭니다.",
    is_deleted: false,
    is_hidden: false,
    hidden_reason: null,
    upvotes: 6,
    downvotes: 1,
    created_at: "2026-03-09T13:40:00.000Z",
    updated_at: null,
    author: authors["user-demo"],
  },
];

function unwrapRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function toComment(row: SupabaseCommentRow): Comment {
  const author = unwrapRelation(row.author);

  return {
    id: row.id,
    post_id: row.post_id,
    author_id: row.author_id,
    body: row.body,
    is_deleted: row.is_deleted,
    is_hidden: row.is_hidden,
    hidden_reason: row.hidden_reason,
    upvotes: row.upvotes ?? 0,
    downvotes: row.downvotes ?? 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
    author: author
      ? {
          id: author.id,
          nickname: author.nickname,
          role: author.role,
          level: author.level,
          warning_count: author.warning_count,
          is_suspended: author.is_suspended,
          suspended_until: author.suspended_until,
          avatar_url: author.avatar_url,
          created_at: author.created_at,
          updated_at: author.updated_at,
        }
      : undefined,
  };
}

export async function getCommentsByPostId(postId: string) {
  const supabase = await createSupabaseServer();

  if (!supabase) {
    return mockComments
      .filter((comment) => comment.post_id === postId)
      .sort((left, right) => left.created_at.localeCompare(right.created_at));
  }

  const { data, error } = await supabase
    .from("comments")
    .select(commentSelect)
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as SupabaseCommentRow[]).map(toComment);
}

export async function getCommentById(commentId: string) {
  const supabase = await createSupabaseServer();

  if (!supabase) {
    return mockComments.find((comment) => comment.id === commentId) ?? null;
  }

  const { data, error } = await supabase
    .from("comments")
    .select(commentSelect)
    .eq("id", commentId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return toComment(data as SupabaseCommentRow);
}

export async function createComment({
  postId,
  body,
  authorId,
}: {
  postId: string;
  body: string;
  authorId?: string;
}) {
  const supabase = await createSupabaseServer();

  if (supabase && authorId) {
    const insertPayload = {
      post_id: postId,
      author_id: authorId,
      body: body.trim(),
      is_deleted: false,
      is_hidden: false,
      hidden_reason: null,
    };

    const { data, error } = await supabase
      .from("comments")
      .insert(insertPayload as never)
      .select(commentSelect)
      .single();

    if (error || !data) {
      throw new Error("Failed to create comment");
    }

    return toComment(data as SupabaseCommentRow);
  }

  const comment: Comment = {
    id: `comment-${mockComments.length + 1}`,
    post_id: postId,
    author_id: "user-demo",
    body: body.trim(),
    is_deleted: false,
    is_hidden: false,
    hidden_reason: null,
    upvotes: 0,
    downvotes: 0,
    created_at: new Date().toISOString(),
    updated_at: null,
    author: authors["user-demo"],
  };

  mockComments = [...mockComments, comment];

  return comment;
}

export async function deleteComment(commentId: string, authorId?: string) {
  const supabase = await createSupabaseServer();

  if (supabase && authorId) {
    const { data, error } = await supabase
      .from("comments")
      .update({
        is_deleted: true,
      } as never)
      .eq("id", commentId)
      .eq("author_id", authorId)
      .select(commentSelect)
      .single();

    if (error || !data) {
      throw new Error("Failed to delete comment");
    }

    return toComment(data as SupabaseCommentRow);
  }

  const comment = mockComments.find((item) => item.id === commentId);

  if (!comment) {
    throw new Error("Comment not found");
  }

  comment.is_deleted = true;
  comment.updated_at = new Date().toISOString();

  return comment;
}
