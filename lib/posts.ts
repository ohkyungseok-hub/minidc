import { mockBoards } from "@/lib/boards";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { Board, PaginatedList, Post, PostListItem, UserProfile } from "@/types";

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
    .filter((post) => !post.is_notice && !post.is_hidden && post.created_at >= cutoff)
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
    .filter((post) => post.board?.slug === board.slug && post.is_notice && !post.is_hidden && matchesQuery(post))
    .slice(0, options.noticeLimit)
    .map(getMockPostListItem);

  const normalPosts = mockPosts
    .filter((post) => post.board?.slug === board.slug && !post.is_notice && !post.is_hidden && matchesQuery(post))
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
  images,
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
  is_hidden: boolean;
  hidden_reason: string | null;
  up_count: number | null;
  down_count: number | null;
  view_count: number | null;
  images: string[];
  created_at: string;
  updated_at: string | null;
  author: { id: string; nickname: string; role: "user" | "admin"; level: number; warning_count: number; is_suspended: boolean; suspended_until: string | null; avatar_url: string | null; created_at: string; updated_at: string | null } | { id: string; nickname: string; role: "user" | "admin"; level: number; warning_count: number; is_suspended: boolean; suspended_until: string | null; avatar_url: string | null; created_at: string; updated_at: string | null }[] | null;
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
  is_hidden,
  hidden_reason,
  up_count,
  down_count,
  view_count,
  images,
  created_at,
  updated_at,
  author:users!posts_author_id_fkey (
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
    is_hidden: record.is_hidden,
    hidden_reason: record.hidden_reason,
    up_count: record.up_count ?? 0,
    down_count: record.down_count ?? 0,
    view_count: record.view_count ?? 0,
    images: record.images ?? [],
    created_at: record.created_at,
    updated_at: record.updated_at,
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
    board_id: "board-confession",
    author_id: "user-demo",
    title: "이곳은 익명 고백과 위로를 위한 공간입니다",
    content:
      "누구에게도 말하지 못했던 부끄러운 마음이나 오래 묵은 죄책감을 익명으로 내려놓을 수 있는 곳입니다. 타인의 고백을 조롱하지 않고, 각자의 상처를 함부로 소비하지 않는 분위기를 함께 만들어 주세요.",
    is_notice: true,
    is_anonymous: false,
    is_hidden: false,
    hidden_reason: null,
    up_count: 31,
    down_count: 1,
    view_count: 214,
    images: [],
    created_at: "2026-03-09T12:00:00.000Z",
    updated_at: null,
    board: bySlug("confession"),
    author: authors["user-demo"],
    comment_count: 3,
  },
  {
    id: "post-2",
    board_id: "board-comfort",
    author_id: "user-luma",
    title: "요즘 아무 이유 없이 하루가 너무 버겁네요",
    content:
      "회사에서도 집에서도 크게 문제가 있는 건 아닌데 이상하게 계속 숨이 막히는 느낌이 듭니다. 별일 아닌 척 지내다가도 혼자 있을 때 갑자기 무너지는 기분이 들어서, 누가 괜찮다고 한 번만 말해주면 좋겠습니다.",
    is_notice: false,
    is_anonymous: false,
    is_hidden: false,
    hidden_reason: null,
    up_count: 47,
    down_count: 2,
    view_count: 318,
    images: [],
    created_at: "2026-03-09T13:30:00.000Z",
    updated_at: null,
    board: bySlug("comfort"),
    author: authors["user-luma"],
    comment_count: 5,
  },
  {
    id: "post-3",
    board_id: "board-solutions",
    author_id: "user-pixel",
    title: "가족에게 말 못한 빚 문제, 어디서부터 풀어야 할까요",
    content:
      "생활비를 메우려고 카드 돌려막기를 하다가 생각보다 커졌습니다. 아직 가족은 모르고 있고, 당장 무너지기 전에 순서를 정해서 정리하고 싶은데 무엇부터 시작해야 할지 조언을 듣고 싶습니다.",
    is_notice: false,
    is_anonymous: false,
    is_hidden: false,
    hidden_reason: null,
    up_count: 23,
    down_count: 1,
    view_count: 181,
    images: [],
    created_at: "2026-03-09T14:10:00.000Z",
    updated_at: null,
    board: bySlug("solutions"),
    author: authors["user-pixel"],
    comment_count: 3,
  },
  {
    id: "post-4",
    board_id: "board-confession",
    author_id: "user-demo",
    title: "좋은 사람인 척만 하고 사는 것 같아서 괴롭습니다",
    content:
      "주변에서는 늘 착하고 믿을 만한 사람이라고 보는데, 사실 저는 속으로 남을 많이 질투하고 계산합니다. 겉으로 보이는 모습과 속마음이 너무 달라서 언젠가 다 들킬 것 같은 불안이 있습니다.",
    is_notice: false,
    is_anonymous: false,
    is_hidden: false,
    hidden_reason: null,
    up_count: 19,
    down_count: 0,
    view_count: 143,
    images: [],
    created_at: "2026-03-09T15:00:00.000Z",
    updated_at: null,
    board: bySlug("confession"),
    author: authors["user-demo"],
    comment_count: 2,
  },
];

export async function getFeaturedPosts() {
  const supabase = await createSupabaseServer();

  if (!supabase) {
    return mockPosts.filter((post) => !post.is_notice && !post.is_hidden).slice(0, 3);
  }

  const { data, error } = await supabase
    .from("posts")
    .select(postDetailSelect)
    .eq("is_notice", false)
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .limit(3);

  if (error || !data) {
    return [];
  }

  return (data as SupabasePostDetailRow[]).map(toPost);
}

export async function getNoticePosts(): Promise<PostListItem[]> {
  const supabase = await createSupabaseServer();

  if (!supabase) {
    return mockPosts
      .filter((post) => post.is_notice && !post.is_hidden)
      .slice(0, 5)
      .map(getMockPostListItem);
  }

  const { data, error } = await supabase
    .from("posts")
    .select(boardPostFeedSelect)
    .eq("is_notice", true)
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error || !data) {
    return [];
  }

  return (data as SupabasePostFeedRow[]).map(toPostListItem);
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
    .eq("is_hidden", false)
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

export async function getTodayPostCount() {
  const supabase = await createSupabaseServer();

  if (!supabase) {
    return 0;
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("is_notice", false)
    .eq("is_hidden", false)
    .gte("created_at", todayStart.toISOString());

  if (error) {
    return 0;
  }

  return count ?? 0;
}

export async function getPostsByBoardSlug(slug: string) {
  return mockPosts.filter((post) => post.board?.slug === slug && !post.is_notice && !post.is_hidden);
}

export async function getNoticePostsByBoardSlug(slug: string) {
  return mockPosts.filter((post) => post.board?.slug === slug && post.is_notice && !post.is_hidden);
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
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .limit(resolvedOptions.noticeLimit);

  const postsQuery = supabase
    .from("posts")
    .select(boardPostFeedSelect, { count: "exact" })
    .eq("board_id", board.id)
    .eq("is_notice", false)
    .eq("is_hidden", false)
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
    return mockPosts.find((post) => post.id === id && !post.is_hidden) ?? null;
  }

  const { data, error } = await supabase
    .from("posts")
    .select(postDetailSelect)
    .eq("id", id)
    .eq("is_hidden", false)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return toPost(data as SupabasePostDetailRow);
}

export async function incrementViewCount(postId: string) {
  const supabase = await createSupabaseServer();

  if (supabase) {
    const { data, error } = await (supabase as ReturnType<typeof supabase.rpc> extends never ? never : typeof supabase)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .rpc("increment_post_view_count" as any, { p_post_id: postId } as any);

    if (error) {
      throw new Error("Failed to increment view count");
    }

    return data as number;
  }

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
  images = [],
}: {
  boardId: string;
  title: string;
  content: string;
  isNotice?: boolean;
  isAnonymous?: boolean;
  authorId?: string;
  images?: string[];
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
      images,
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
    is_hidden: false,
    hidden_reason: null,
    up_count: 0,
    down_count: 0,
    view_count: 0,
    images: images ?? [],
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
    images,
  }: {
    boardId?: string;
    title?: string;
    content?: string;
    isNotice?: boolean;
    isAnonymous?: boolean;
    authorId?: string;
    images?: string[];
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

    if (images !== undefined) {
      (payload as Record<string, unknown>).images = images;
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
