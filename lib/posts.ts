import { mockBoards } from "@/lib/boards";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { Board, PaginatedList, Post, PostListItem, UserProfile } from "@/types";

const authors: Record<string, UserProfile> = {
  "user-demo": {
    id: "user-demo",
    nickname: "orbit",
    role: "admin",
    avatar_url: null,
    created_at: "2026-03-09T09:00:00.000Z",
    updated_at: null,
  },
  "user-luma": {
    id: "user-luma",
    nickname: "luma",
    role: "user",
    avatar_url: null,
    created_at: "2026-03-09T10:00:00.000Z",
    updated_at: null,
  },
  "user-pixel": {
    id: "user-pixel",
    nickname: "pixel",
    role: "user",
    avatar_url: null,
    created_at: "2026-03-09T11:00:00.000Z",
    updated_at: null,
  },
};

const bySlug = (slug: string) => mockBoards.find((board) => board.slug === slug)!;

type PostFeedOptions = {
  page?: number;
  pageSize?: number;
  noticeLimit?: number;
  query?: string;
};

type SupabasePostFeedRow = {
  id: string;
  board_id: string;
  title: string;
  is_notice: boolean;
  is_anonymous: boolean;
  up_count: number | null;
  down_count: number | null;
  view_count: number | null;
  created_at: string;
  author: { id: string; nickname: string } | { id: string; nickname: string }[] | null;
  board:
    | { id: string; slug: string; name: string }
    | { id: string; slug: string; name: string }[]
    | null;
};

export const DEFAULT_POSTS_PAGE_SIZE = 20;
export const DEFAULT_NOTICE_LIMIT = 5;
export const DEFAULT_POPULAR_POST_LIMIT = 10;
export const DEFAULT_POPULAR_POST_DAYS = 3;

type PopularPostsOptions = {
  limit?: number;
  days?: number;
};

function unwrapRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function toPostListItem(record: SupabasePostFeedRow): PostListItem {
  const author = unwrapRelation(record.author);
  const board = unwrapRelation(record.board);

  return {
    id: record.id,
    board_id: record.board_id,
    title: record.title,
    is_notice: record.is_notice,
    is_anonymous: record.is_anonymous,
    view_count: record.view_count ?? 0,
    created_at: record.created_at,
    recommend_count: (record.up_count ?? 0) - (record.down_count ?? 0),
    author: author
      ? {
          id: author.id,
          nickname: author.nickname,
        }
      : null,
    board: board
      ? {
          id: board.id,
          slug: board.slug,
          name: board.name,
        }
      : null,
  };
}

function normalizePage(value?: number) {
  if (!value || Number.isNaN(value) || value < 1) {
    return 1;
  }

  return Math.floor(value);
}

function normalizePageSize(value?: number) {
  if (!value || Number.isNaN(value)) {
    return DEFAULT_POSTS_PAGE_SIZE;
  }

  return Math.min(Math.max(Math.floor(value), 1), 100);
}

function normalizeSearchQuery(value?: string) {
  return value?.trim() ?? "";
}

function createPaginatedList<T>(
  items: T[],
  page: number,
  pageSize: number,
  totalCount: number,
): PaginatedList<T> {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return {
    items,
    page,
    pageSize,
    totalCount,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

function getMockPostListItem(post: Post): PostListItem {
  return {
    id: post.id,
    board_id: post.board_id,
    title: post.title,
    is_notice: post.is_notice,
    is_anonymous: post.is_anonymous,
    view_count: post.view_count,
    created_at: post.created_at,
    recommend_count: post.up_count - post.down_count,
    author: post.author
      ? {
          id: post.author.id,
          nickname: post.author.nickname,
        }
      : null,
    board: post.board
      ? {
          id: post.board.id,
          slug: post.board.slug,
          name: post.board.name,
        }
      : null,
  };
}

function normalizePopularLimit(value?: number) {
  if (!value || Number.isNaN(value)) {
    return DEFAULT_POPULAR_POST_LIMIT;
  }

  return Math.min(Math.max(Math.floor(value), 1), 50);
}

function normalizePopularDays(value?: number) {
  if (!value || Number.isNaN(value)) {
    return DEFAULT_POPULAR_POST_DAYS;
  }

  return Math.min(Math.max(Math.floor(value), 1), 30);
}

function getPopularPostsCutoff(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function comparePopularPosts(left: PostListItem, right: PostListItem) {
  if (right.recommend_count !== left.recommend_count) {
    return right.recommend_count - left.recommend_count;
  }

  if (right.view_count !== left.view_count) {
    return right.view_count - left.view_count;
  }

  return right.created_at.localeCompare(left.created_at);
}

function getMockPopularPosts(options: Required<PopularPostsOptions>) {
  const cutoff = getPopularPostsCutoff(options.days);

  return mockPosts
    .filter((post) => !post.is_notice && post.created_at >= cutoff)
    .map(getMockPostListItem)
    .sort(comparePopularPosts)
    .slice(0, options.limit);
}

function getMockBoardFeed(
  board: Board,
  options: Required<PostFeedOptions>,
) {
  const matchesQuery = (post: Post) =>
    !options.query ||
    post.title.toLowerCase().includes(options.query.toLowerCase()) ||
    post.content.toLowerCase().includes(options.query.toLowerCase());

  const notices = mockPosts
    .filter((post) => post.board?.slug === board.slug && post.is_notice && matchesQuery(post))
    .slice(0, options.noticeLimit)
    .map(getMockPostListItem);

  const normalPosts = mockPosts
    .filter((post) => post.board?.slug === board.slug && !post.is_notice && matchesQuery(post))
    .sort((left, right) => right.created_at.localeCompare(left.created_at));

  const from = (options.page - 1) * options.pageSize;
  const to = from + options.pageSize;

  return {
    board,
    notices,
    posts: createPaginatedList(
      normalPosts.slice(from, to).map(getMockPostListItem),
      options.page,
      options.pageSize,
      normalPosts.length,
    ),
  };
}

const boardPostFeedSelect = `
  id,
  board_id,
  title,
  is_notice,
  is_anonymous,
  up_count,
  down_count,
  view_count,
  created_at,
  author:users!posts_author_id_fkey (
    id,
    nickname
  ),
  board:boards!posts_board_id_fkey (
    id,
    slug,
    name
  )
`;

type SupabasePostDetailRow = {
  id: string;
  board_id: string;
  author_id: string;
  title: string;
  content: string;
  is_notice: boolean;
  is_anonymous: boolean;
  up_count: number | null;
  down_count: number | null;
  view_count: number | null;
  created_at: string;
  updated_at: string | null;
  author: { id: string; nickname: string; role: "user" | "admin"; avatar_url: string | null; created_at: string; updated_at: string | null } | { id: string; nickname: string; role: "user" | "admin"; avatar_url: string | null; created_at: string; updated_at: string | null }[] | null;
  board:
    | { id: string; slug: string; name: string; description: string | null; created_at: string }
    | { id: string; slug: string; name: string; description: string | null; created_at: string }[]
    | null;
};

const postDetailSelect = `
  id,
  board_id,
  author_id,
  title,
  content,
  is_notice,
  is_anonymous,
  up_count,
  down_count,
  view_count,
  created_at,
  updated_at,
  author:users!posts_author_id_fkey (
    id,
    nickname,
    role,
    avatar_url,
    created_at,
    updated_at
  ),
  board:boards!posts_board_id_fkey (
    id,
    slug,
    name,
    description,
    created_at
  )
`;

function toPost(record: SupabasePostDetailRow): Post {
  const author = unwrapRelation(record.author);
  const board = unwrapRelation(record.board);

  return {
    id: record.id,
    board_id: record.board_id,
    author_id: record.author_id,
    title: record.title,
    content: record.content,
    is_notice: record.is_notice,
    is_anonymous: record.is_anonymous,
    up_count: record.up_count ?? 0,
    down_count: record.down_count ?? 0,
    view_count: record.view_count ?? 0,
    created_at: record.created_at,
    updated_at: record.updated_at,
    author: author
      ? {
          id: author.id,
          nickname: author.nickname,
          role: author.role,
          avatar_url: author.avatar_url,
          created_at: author.created_at,
          updated_at: author.updated_at,
        }
      : undefined,
    board: board
      ? {
          id: board.id,
          slug: board.slug,
          name: board.name,
          description: board.description,
          created_at: board.created_at,
        }
      : undefined,
  };
}

let mockPosts: Post[] = [
  {
    id: "post-1",
    board_id: "board-general",
    author_id: "user-demo",
    title: "BLACKPEARLS 구조를 App Router 기준으로 어떻게 나누면 좋을까",
    content:
      "루트 app 기준으로 auth, boards, posts, api를 나누고 컴포넌트와 lib 계층을 맞추면 이후 기능 추가가 수월합니다.",
    is_notice: true,
    is_anonymous: false,
    up_count: 18,
    down_count: 2,
    view_count: 128,
    created_at: "2026-03-09T12:00:00.000Z",
    updated_at: null,
    board: bySlug("general"),
    author: authors["user-demo"],
    comment_count: 3,
  },
  {
    id: "post-2",
    board_id: "board-dev",
    author_id: "user-luma",
    title: "Supabase 클라이언트는 env 없을 때도 안전하게 반환하는 편이 낫다",
    content:
      "로컬 스캐폴드 단계에서는 환경변수가 비어 있어도 렌더가 깨지지 않아야 하므로 null 반환 래퍼가 실용적입니다.",
    is_notice: false,
    is_anonymous: false,
    up_count: 27,
    down_count: 4,
    view_count: 224,
    created_at: "2026-03-09T13:30:00.000Z",
    updated_at: null,
    board: bySlug("dev"),
    author: authors["user-luma"],
    comment_count: 5,
  },
  {
    id: "post-3",
    board_id: "board-design",
    author_id: "user-pixel",
    title: "게시판 초기 UI는 카드와 밀도 낮은 타이포가 읽기 편하다",
    content:
      "보드 목록과 글 목록을 카드 레이아웃으로 분리하면 정보 구조가 분명해지고 모바일 대응도 쉬워집니다.",
    is_notice: false,
    is_anonymous: false,
    up_count: 15,
    down_count: 1,
    view_count: 97,
    created_at: "2026-03-09T14:10:00.000Z",
    updated_at: null,
    board: bySlug("design"),
    author: authors["user-pixel"],
    comment_count: 2,
  },
  {
    id: "post-4",
    board_id: "board-dev",
    author_id: "user-demo",
    title: "votes/comments/view API 라우트는 처음부터 분리해 두는 편이 좋다",
    content:
      "상호작용 단위별로 route.ts를 분리하면 나중에 서버 액션과 혼합해도 경계가 선명하게 유지됩니다.",
    is_notice: false,
    is_anonymous: false,
    up_count: 11,
    down_count: 0,
    view_count: 81,
    created_at: "2026-03-09T15:00:00.000Z",
    updated_at: null,
    board: bySlug("dev"),
    author: authors["user-demo"],
    comment_count: 1,
  },
];

export async function getFeaturedPosts() {
  return mockPosts.filter((post) => !post.is_notice).slice(0, 3);
}

export async function getNoticePosts() {
  return mockPosts.filter((post) => post.is_notice).slice(0, 5);
}

export async function getPopularPosts(options: PopularPostsOptions = {}) {
  const resolvedOptions = {
    limit: normalizePopularLimit(options.limit),
    days: normalizePopularDays(options.days),
  };
  const supabase = await createSupabaseServer();

  if (!supabase) {
    return getMockPopularPosts(resolvedOptions);
  }

  const cutoff = getPopularPostsCutoff(resolvedOptions.days);
  const { data, error } = await supabase
    .from("posts")
    .select(boardPostFeedSelect)
    .eq("is_notice", false)
    .gte("created_at", cutoff)
    .order("up_count", { ascending: false })
    .order("view_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(resolvedOptions.limit);

  if (error || !data) {
    return [];
  }

  return (data as SupabasePostFeedRow[]).map(toPostListItem);
}

export async function getHotPosts(options: PopularPostsOptions = {}) {
  return getPopularPosts(options);
}

export async function getPostsByBoardSlug(slug: string) {
  return mockPosts.filter((post) => post.board?.slug === slug && !post.is_notice);
}

export async function getNoticePostsByBoardSlug(slug: string) {
  return mockPosts.filter((post) => post.board?.slug === slug && post.is_notice);
}

export async function getBoardPostFeedBySlug(
  board: Board,
  options: PostFeedOptions = {},
) {
  const resolvedOptions = {
    page: normalizePage(options.page),
    pageSize: normalizePageSize(options.pageSize),
    noticeLimit: normalizePageSize(options.noticeLimit ?? DEFAULT_NOTICE_LIMIT),
    query: normalizeSearchQuery(options.query),
  };
  const supabase = await createSupabaseServer();

  if (!supabase) {
    return getMockBoardFeed(board, resolvedOptions);
  }

  const from = (resolvedOptions.page - 1) * resolvedOptions.pageSize;
  const to = from + resolvedOptions.pageSize - 1;

  const noticeQuery = supabase
    .from("posts")
    .select(boardPostFeedSelect)
    .eq("board_id", board.id)
    .eq("is_notice", true)
    .order("created_at", { ascending: false })
    .limit(resolvedOptions.noticeLimit);

  const postsQuery = supabase
    .from("posts")
    .select(boardPostFeedSelect, { count: "exact" })
    .eq("board_id", board.id)
    .eq("is_notice", false)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (resolvedOptions.query) {
    const queryFilter = `title.ilike.%${resolvedOptions.query}%,content.ilike.%${resolvedOptions.query}%`;

    noticeQuery.or(queryFilter);
    postsQuery.or(queryFilter);
  }

  const [noticeResponse, postsResponse] = await Promise.all([noticeQuery, postsQuery]);

  if (
    noticeResponse.error ||
    postsResponse.error
  ) {
    return {
      board,
      notices: [],
      posts: createPaginatedList([], resolvedOptions.page, resolvedOptions.pageSize, 0),
    };
  }

  if (!noticeResponse.data || !postsResponse.data) {
    return {
      board,
      notices: [],
      posts: createPaginatedList([], resolvedOptions.page, resolvedOptions.pageSize, 0),
    };
  }

  return {
    board,
    notices: (noticeResponse.data as SupabasePostFeedRow[]).map(toPostListItem),
    posts: createPaginatedList(
      (postsResponse.data as SupabasePostFeedRow[]).map(toPostListItem),
      resolvedOptions.page,
      resolvedOptions.pageSize,
      postsResponse.count ?? 0,
    ),
  };
}

export async function getPostById(id: string) {
  const supabase = await createSupabaseServer();

  if (!supabase) {
    return mockPosts.find((post) => post.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from("posts")
    .select(postDetailSelect)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return toPost(data as SupabasePostDetailRow);
}

export async function incrementViewCount(postId: string) {
  const post = mockPosts.find((item) => item.id === postId);

  if (!post) {
    throw new Error("Post not found");
  }

  post.view_count += 1;

  return post.view_count;
}

export async function createPost({
  boardId,
  title,
  content,
  isNotice = false,
  isAnonymous = false,
  authorId,
}: {
  boardId: string;
  title: string;
  content: string;
  isNotice?: boolean;
  isAnonymous?: boolean;
  authorId?: string;
}) {
  const supabase = await createSupabaseServer();

  if (supabase && authorId) {
    const insertPayload = {
      board_id: boardId,
      author_id: authorId,
      title: title.trim(),
      content: content.trim(),
      is_notice: isNotice,
      is_anonymous: isAnonymous,
    };

    const { data, error } = await supabase
      .from("posts")
      .insert(insertPayload as never)
      .select(postDetailSelect)
      .single();

    if (error || !data) {
      throw new Error("Failed to create post");
    }

    return toPost(data as SupabasePostDetailRow);
  }

  const board = mockBoards.find((item) => item.id === boardId);

  if (!board) {
    throw new Error("Board not found");
  }

  const post: Post = {
    id: `post-${mockPosts.length + 1}`,
    board_id: boardId,
    author_id: "user-demo",
    title: title.trim(),
    content: content.trim(),
    is_notice: isNotice,
    is_anonymous: isAnonymous,
    up_count: 0,
    down_count: 0,
    view_count: 0,
    created_at: new Date().toISOString(),
    updated_at: null,
    board,
    author: authors["user-demo"],
    comment_count: 0,
  };

  mockPosts = [post, ...mockPosts];

  return post;
}

export async function updatePost(
  id: string,
  {
    boardId,
    title,
    content,
    isNotice,
    isAnonymous,
    authorId,
  }: {
    boardId?: string;
    title?: string;
    content?: string;
    isNotice?: boolean;
    isAnonymous?: boolean;
    authorId?: string;
  },
) {
  const supabase = await createSupabaseServer();

  if (supabase && authorId) {
    const payload: {
      board_id?: string;
      title?: string;
      content?: string;
      is_notice?: boolean;
      is_anonymous?: boolean;
    } = {};

    if (boardId) {
      payload.board_id = boardId;
    }

    if (typeof title === "string") {
      payload.title = title.trim();
    }

    if (typeof content === "string") {
      payload.content = content.trim();
    }

    if (typeof isNotice === "boolean") {
      payload.is_notice = isNotice;
    }

    if (typeof isAnonymous === "boolean") {
      payload.is_anonymous = isAnonymous;
    }

    const { data, error } = await supabase
      .from("posts")
      .update(payload as never)
      .eq("id", id)
      .eq("author_id", authorId)
      .select(postDetailSelect)
      .single();

    if (error || !data) {
      throw new Error("Failed to update post");
    }

    return toPost(data as SupabasePostDetailRow);
  }

  const post = mockPosts.find((item) => item.id === id);

  if (!post) {
    throw new Error("Post not found");
  }

  if (boardId) {
    const board = mockBoards.find((item) => item.id === boardId);

    if (!board) {
      throw new Error("Board not found");
    }

    post.board_id = boardId;
    post.board = board;
  }

  if (typeof title === "string") {
    post.title = title.trim();
  }

  if (typeof content === "string") {
    post.content = content.trim();
  }

  if (typeof isNotice === "boolean") {
    post.is_notice = isNotice;
  }

  if (typeof isAnonymous === "boolean") {
    post.is_anonymous = isAnonymous;
  }

  post.updated_at = new Date().toISOString();

  return post;
}

export async function deletePost(id: string, authorId?: string) {
  const supabase = await createSupabaseServer();

  if (supabase && authorId) {
    const { data, error } = await supabase
      .from("posts")
      .delete()
      .eq("id", id)
      .eq("author_id", authorId)
      .select(postDetailSelect)
      .single();

    if (error || !data) {
      throw new Error("Failed to delete post");
    }

    return toPost(data as SupabasePostDetailRow);
  }

  const existing = mockPosts.find((item) => item.id === id);

  if (!existing) {
    throw new Error("Post not found");
  }

  mockPosts = mockPosts.filter((item) => item.id !== id);

  return existing;
}
