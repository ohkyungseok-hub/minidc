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
  "user-pixel": {
    id: "user-pixel",
    nickname: "pixel",
    role: "user",
    level: 2,
    warning_count: 0,
    is_suspended: false,
    suspended_until: null,
    avatar_url: null,
    created_at: "2026-03-09T11:00:00.000Z",
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
  is_anonymous: boolean;
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
  is_anonymous,
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
    is_anonymous: false,
    body: "이런 공간이 꼭 필요했습니다. 말하지 못한 마음을 내려놓는 것만으로도 조금 숨이 쉬어질 때가 있더라고요.",
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
    is_anonymous: false,
    body: "누군가의 고백을 가볍게 넘기지 않고 끝까지 읽어주는 분위기를 같이 만들었으면 합니다.",
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
    is_anonymous: false,
    body: "이유 없이 버거운 날이 계속되는 사람 정말 많아요. 버티고 있다는 것만으로도 이미 충분히 잘하고 있는 겁니다.",
    is_deleted: false,
    is_hidden: false,
    hidden_reason: null,
    upvotes: 6,
    downvotes: 1,
    created_at: "2026-03-09T13:40:00.000Z",
    updated_at: null,
    author: authors["user-demo"],
  },
  {
    id: "comment-4",
    post_id: "post-5",
    author_id: "user-demo",
    is_anonymous: false,
    body: "축하와 질투가 같이 드는 건 생각보다 흔한 감정이에요. 그 마음을 알아차리고 있다는 것만으로도 이미 스스로를 잘 보고 계신 것 같습니다.",
    is_deleted: false,
    is_hidden: false,
    hidden_reason: null,
    upvotes: 4,
    downvotes: 0,
    created_at: "2026-03-12T00:50:00.000Z",
    updated_at: null,
    author: authors["user-demo"],
  },
  {
    id: "comment-5",
    post_id: "post-6",
    author_id: "user-luma",
    is_anonymous: false,
    body: "답장을 못 하는 게 무관심이라기보다 지금 여유가 없다는 신호일 수도 있어요. 짧게라도 먼저 살아 있다는 말만 건네보는 것도 괜찮겠습니다.",
    is_deleted: false,
    is_hidden: false,
    hidden_reason: null,
    upvotes: 3,
    downvotes: 0,
    created_at: "2026-03-12T02:00:00.000Z",
    updated_at: null,
    author: authors["user-luma"],
  },
  {
    id: "comment-6",
    post_id: "post-7",
    author_id: "user-pixel",
    is_anonymous: false,
    body: "부러움이 꼭 누군가를 미워한다는 뜻은 아니더라고요. 지금 내 삶이 너무 버겁다는 신호로 받아들여도 될 것 같습니다.",
    is_deleted: false,
    is_hidden: false,
    hidden_reason: null,
    upvotes: 2,
    downvotes: 0,
    created_at: "2026-03-12T02:40:00.000Z",
    updated_at: null,
    author: authors["user-pixel"],
  },
  {
    id: "comment-7",
    post_id: "post-8",
    author_id: "user-demo",
    is_anonymous: false,
    body: "아침부터 지친 상태가 계속된다면 의지 문제가 아니라 정말 많이 소모된 상태일 수 있어요. 하루를 줄이는 방식으로라도 쉬는 시간을 확보해보셨으면 합니다.",
    is_deleted: false,
    is_hidden: false,
    hidden_reason: null,
    upvotes: 5,
    downvotes: 0,
    created_at: "2026-03-12T03:50:00.000Z",
    updated_at: null,
    author: authors["user-demo"],
  },
  {
    id: "comment-8",
    post_id: "post-9",
    author_id: "user-luma",
    is_anonymous: false,
    body: "사람들 사이에 있다고 외롭지 않은 건 아니더라고요. 연결감이 안 느껴질 때는 더 솔직한 대화를 나눌 한 사람만 있어도 조금 달라지기도 합니다.",
    is_deleted: false,
    is_hidden: false,
    hidden_reason: null,
    upvotes: 4,
    downvotes: 0,
    created_at: "2026-03-12T05:20:00.000Z",
    updated_at: null,
    author: authors["user-luma"],
  },
  {
    id: "comment-9",
    post_id: "post-10",
    author_id: "user-pixel",
    is_anonymous: false,
    body: "작은 말이 크게 남는 시기는 분명 있는 것 같아요. 너무 예민한 사람이어서가 아니라 지금 마음이 많이 닳아 있다는 뜻일 수 있습니다.",
    is_deleted: false,
    is_hidden: false,
    hidden_reason: null,
    upvotes: 6,
    downvotes: 0,
    created_at: "2026-03-12T06:40:00.000Z",
    updated_at: null,
    author: authors["user-pixel"],
  },
  {
    id: "comment-10",
    post_id: "post-11",
    author_id: "user-demo",
    is_anonymous: false,
    body: "가계부를 완벽하게 쓰려 하기보다 고정비와 카드 결제 예정 금액부터 먼저 모아보면 현재 상태를 훨씬 빨리 파악할 수 있습니다.",
    is_deleted: false,
    is_hidden: false,
    hidden_reason: null,
    upvotes: 3,
    downvotes: 0,
    created_at: "2026-03-12T08:00:00.000Z",
    updated_at: null,
    author: authors["user-demo"],
  },
  {
    id: "comment-11",
    post_id: "post-12",
    author_id: "user-pixel",
    is_anonymous: false,
    body: "길게 설명하기보다 안부를 묻는 짧은 문자로 시작하는 편이 부담이 덜할 수 있어요. 당장 결론을 내지 않아도 대화를 다시 여는 것 자체가 첫 단계니까요.",
    is_deleted: false,
    is_hidden: false,
    hidden_reason: null,
    upvotes: 4,
    downvotes: 0,
    created_at: "2026-03-12T09:15:00.000Z",
    updated_at: null,
    author: authors["user-pixel"],
  },
  {
    id: "comment-12",
    post_id: "post-13",
    author_id: "user-luma",
    is_anonymous: false,
    body: "남아 있는 동안은 현재 업무를 정리해서 신뢰를 회복하는 쪽이 현실적일 것 같아요. 감정적으로 해명하기보다 일정과 인수인계 태도를 분명히 보여주는 게 더 효과적일 수 있습니다.",
    is_deleted: false,
    is_hidden: false,
    hidden_reason: null,
    upvotes: 5,
    downvotes: 0,
    created_at: "2026-03-12T10:50:00.000Z",
    updated_at: null,
    author: authors["user-luma"],
  },
  {
    id: "comment-13",
    post_id: "post-14",
    author_id: "user-demo",
    is_anonymous: false,
    body: "관계를 지키고 싶더라도 상환 일정은 구체적으로 못 박는 편이 좋습니다. 날짜와 금액을 문자로 남겨두면 감정 소모를 조금 줄일 수 있어요.",
    is_deleted: false,
    is_hidden: false,
    hidden_reason: null,
    upvotes: 3,
    downvotes: 0,
    created_at: "2026-03-12T12:20:00.000Z",
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
    is_anonymous: row.is_anonymous,
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
  isAnonymous,
}: {
  postId: string;
  body: string;
  authorId?: string;
  isAnonymous?: boolean;
}) {
  const supabase = await createSupabaseServer();

  if (supabase && authorId) {
    const insertPayload = {
      post_id: postId,
      author_id: authorId,
      body: body.trim(),
      is_anonymous: isAnonymous ?? false,
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
    is_anonymous: isAnonymous ?? false,
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
