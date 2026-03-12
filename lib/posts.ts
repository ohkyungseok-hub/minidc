import { unstable_noStore as noStore } from "next/cache";

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
  topic: "work" | "relationship" | "family" | "anxiety" | "loneliness" | "money" | null;
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
  topic,
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
    empathy_count: (record as { empathy_count?: number }).empathy_count ?? 0,
    view_count: record.view_count ?? 0,
    images: record.images ?? [],
    topic: record.topic ?? null,
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
    empathy_count: 0,
    view_count: 214,
    images: [],
    topic: null,
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
    empathy_count: 0,
    view_count: 318,
    images: [],
    topic: "anxiety",
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
    empathy_count: 0,
    view_count: 181,
    images: [],
    topic: "money",
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
    empathy_count: 0,
    view_count: 143,
    images: [],
    topic: "anxiety",
    created_at: "2026-03-09T15:00:00.000Z",
    updated_at: null,
    board: bySlug("confession"),
    author: authors["user-demo"],
    comment_count: 2,
  },
  {
    id: "post-5",
    board_id: "board-confession",
    author_id: "user-luma",
    title: "아무렇지 않은 척했지만 사실은 축하해주기 힘들었습니다",
    content:
      "친구가 원하던 회사에 합격했다는 말을 듣는 순간 웃으면서 축하했는데, 집에 돌아와서는 제 처지가 더 초라하게 느껴졌습니다. 그런 마음을 가진 제가 너무 작아 보여서 더 괴롭습니다.",
    is_notice: false,
    is_anonymous: false,
    is_hidden: false,
    hidden_reason: null,
    up_count: 16,
    down_count: 1,
    empathy_count: 0,
    view_count: 127,
    images: [],
    topic: "work",
    created_at: "2026-03-12T00:20:00.000Z",
    updated_at: null,
    board: bySlug("confession"),
    author: authors["user-luma"],
    comment_count: 1,
  },
  {
    id: "post-6",
    board_id: "board-confession",
    author_id: "user-pixel",
    title: "가족 단톡방 알림을 일부러 무시하고 있습니다",
    content:
      "별일 아닌 대화에도 괜히 숨이 막혀서 읽고도 답장을 못 한 채 며칠씩 지나갑니다. 연락을 피할수록 죄책감은 커지는데, 막상 답장을 하려면 다시 벅차집니다.",
    is_notice: false,
    is_anonymous: false,
    is_hidden: false,
    hidden_reason: null,
    up_count: 21,
    down_count: 0,
    empathy_count: 0,
    view_count: 166,
    images: [],
    topic: "family",
    created_at: "2026-03-12T01:40:00.000Z",
    updated_at: null,
    board: bySlug("confession"),
    author: authors["user-pixel"],
    comment_count: 1,
  },
  {
    id: "post-7",
    board_id: "board-confession",
    author_id: "user-demo",
    title: "퇴사한 동료가 부러운 마음을 숨기고 있습니다",
    content:
      "다들 불안하다고 말리는데도 회사를 그만두고 떠난 동료가 한편으로는 너무 부럽습니다. 저는 겁이 나서 못 하는 선택이라 더 씁쓸하고, 그 감정을 티 내고 싶지 않아 더 답답합니다.",
    is_notice: false,
    is_anonymous: false,
    is_hidden: false,
    hidden_reason: null,
    up_count: 14,
    down_count: 0,
    empathy_count: 0,
    view_count: 118,
    images: [],
    topic: "work",
    created_at: "2026-03-12T02:10:00.000Z",
    updated_at: null,
    board: bySlug("confession"),
    author: authors["user-demo"],
    comment_count: 1,
  },
  {
    id: "post-8",
    board_id: "board-comfort",
    author_id: "user-luma",
    title: "요즘은 아침에 눈뜨는 순간부터 피곤합니다",
    content:
      "충분히 잔 것 같은데도 아침마다 이미 하루를 다 쓴 사람처럼 몸이 무겁습니다. 해야 할 일은 그대로인데 시작할 힘이 없어서 자꾸 제 자신을 탓하게 됩니다.",
    is_notice: false,
    is_anonymous: false,
    is_hidden: false,
    hidden_reason: null,
    up_count: 28,
    down_count: 0,
    empathy_count: 0,
    view_count: 209,
    images: [],
    topic: "anxiety",
    created_at: "2026-03-12T03:25:00.000Z",
    updated_at: null,
    board: bySlug("comfort"),
    author: authors["user-luma"],
    comment_count: 1,
  },
  {
    id: "post-9",
    board_id: "board-comfort",
    author_id: "user-pixel",
    title: "사람들 사이에 있어도 계속 혼자인 느낌이 듭니다",
    content:
      "회사에서도 모임에서도 대화는 하는데, 이상하게 집에 돌아오면 하루 종일 아무와도 연결되지 못한 기분이 남습니다. 괜히 티 내면 더 이상한 사람처럼 보일까 봐 말도 못 하고 있습니다.",
    is_notice: false,
    is_anonymous: false,
    is_hidden: false,
    hidden_reason: null,
    up_count: 24,
    down_count: 1,
    empathy_count: 0,
    view_count: 191,
    images: [],
    topic: "loneliness",
    created_at: "2026-03-12T04:50:00.000Z",
    updated_at: null,
    board: bySlug("comfort"),
    author: authors["user-pixel"],
    comment_count: 1,
  },
  {
    id: "post-10",
    board_id: "board-comfort",
    author_id: "user-demo",
    title: "별일 아닌 말에도 자꾸 마음이 무너집니다",
    content:
      "예전에는 웃고 넘겼을 말인데 요즘은 작은 한마디에도 하루 종일 머릿속을 맴돕니다. 예민해진 제 상태를 설명하기도 어렵고, 누굴 탓할 수도 없어서 더 막막합니다.",
    is_notice: false,
    is_anonymous: false,
    is_hidden: false,
    hidden_reason: null,
    up_count: 31,
    down_count: 2,
    empathy_count: 0,
    view_count: 237,
    images: [],
    topic: "anxiety",
    created_at: "2026-03-12T06:05:00.000Z",
    updated_at: null,
    board: bySlug("comfort"),
    author: authors["user-demo"],
    comment_count: 1,
  },
  {
    id: "post-11",
    board_id: "board-solutions",
    author_id: "user-pixel",
    title: "월급이 들어오자마자 사라지는데 가계부부터 다시 써야 할까요",
    content:
      "큰 사치를 하는 것도 아닌데 카드값과 자동이체가 빠지고 나면 남는 돈이 거의 없습니다. 지금 상황을 제대로 보려면 어떤 항목부터 정리해야 할지 현실적인 기준이 필요합니다.",
    is_notice: false,
    is_anonymous: false,
    is_hidden: false,
    hidden_reason: null,
    up_count: 18,
    down_count: 0,
    empathy_count: 0,
    view_count: 154,
    images: [],
    topic: "money",
    created_at: "2026-03-12T07:30:00.000Z",
    updated_at: null,
    board: bySlug("solutions"),
    author: authors["user-pixel"],
    comment_count: 1,
  },
  {
    id: "post-12",
    board_id: "board-solutions",
    author_id: "user-luma",
    title: "부모님과 다시 대화하려면 첫 연락을 어떻게 시작해야 할까요",
    content:
      "크게 다툰 뒤로 몇 달째 연락을 끊고 있습니다. 먼저 손을 내밀고는 싶은데 또 같은 말다툼으로 번질까 봐 겁나서, 너무 무겁지 않게 시작할 방법이 있으면 듣고 싶습니다.",
    is_notice: false,
    is_anonymous: false,
    is_hidden: false,
    hidden_reason: null,
    up_count: 20,
    down_count: 0,
    empathy_count: 0,
    view_count: 169,
    images: [],
    topic: "family",
    created_at: "2026-03-12T08:45:00.000Z",
    updated_at: null,
    board: bySlug("solutions"),
    author: authors["user-luma"],
    comment_count: 1,
  },
  {
    id: "post-13",
    board_id: "board-solutions",
    author_id: "user-demo",
    title: "이직 준비를 들킨 뒤 회사에서 어떤 태도를 취해야 할지 고민입니다",
    content:
      "면접을 보고 다닌 사실을 팀장이 알게 된 뒤로 회사 분위기가 어색해졌습니다. 당장 퇴사할 수도 없는 상황이라 남아 있는 동안 어떤 선을 지키는 게 맞는지 조언이 필요합니다.",
    is_notice: false,
    is_anonymous: false,
    is_hidden: false,
    hidden_reason: null,
    up_count: 26,
    down_count: 1,
    empathy_count: 0,
    view_count: 214,
    images: [],
    topic: "work",
    created_at: "2026-03-12T10:15:00.000Z",
    updated_at: null,
    board: bySlug("solutions"),
    author: authors["user-demo"],
    comment_count: 1,
  },
  {
    id: "post-14",
    board_id: "board-solutions",
    author_id: "user-luma",
    title: "친구에게 빌려준 돈을 감정 상하지 않게 돌려받는 방법이 있을까요",
    content:
      "몇 번이나 기다려줬는데 계속 다음 달에 주겠다는 말만 반복되고 있습니다. 관계를 완전히 끊고 싶진 않지만, 더 미루면 제가 감당하기 어려워져서 어디까지 단호해야 할지 모르겠습니다.",
    is_notice: false,
    is_anonymous: false,
    is_hidden: false,
    hidden_reason: null,
    up_count: 17,
    down_count: 0,
    empathy_count: 0,
    view_count: 145,
    images: [],
    topic: "money",
    created_at: "2026-03-12T11:55:00.000Z",
    updated_at: null,
    board: bySlug("solutions"),
    author: authors["user-luma"],
    comment_count: 1,
  },
];

export async function getFeaturedPosts(): Promise<PostListItem[]> {
  noStore();
  const supabase = await createSupabaseServer();

  if (!supabase) {
    return mockPosts
      .filter((post) => !post.is_notice && !post.is_hidden)
      .sort((left, right) => right.created_at.localeCompare(left.created_at))
      .slice(0, 10)
      .map(getMockPostListItem);
  }

  const { data, error } = await supabase
    .from("posts")
    .select(boardPostFeedSelect)
    .eq("is_notice", false)
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error || !data) {
    return [];
  }

  return (data as SupabasePostFeedRow[]).map(toPostListItem);
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

export async function searchPosts(query: string, page = 1, pageSize = 20): Promise<PaginatedList<PostListItem>> {
  const supabase = await createSupabaseServer();
  const trimmed = query.trim();
  const empty = createPaginatedList([] as PostListItem[], page, pageSize, 0);

  if (!trimmed) return empty;

  if (!supabase) {
    const filtered = mockPosts
      .filter((p) =>
        !p.is_hidden &&
        (p.title.toLowerCase().includes(trimmed.toLowerCase()) ||
          p.content.toLowerCase().includes(trimmed.toLowerCase())),
      )
      .map(getMockPostListItem);

    const from = (page - 1) * pageSize;
    return createPaginatedList(filtered.slice(from, from + pageSize), page, pageSize, filtered.length);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const filter = `title.ilike.%${trimmed}%,content.ilike.%${trimmed}%`;

  const { data, count, error } = await supabase
    .from("posts")
    .select(boardPostFeedSelect, { count: "exact" })
    .eq("is_hidden", false)
    .eq("is_notice", false)
    .or(filter)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error || !data) return empty;

  return createPaginatedList(
    (data as SupabasePostFeedRow[]).map(toPostListItem),
    page,
    pageSize,
    count ?? 0,
  );
}

export async function getPostsByTopic(
  topic: string,
  options: { limit?: number; page?: number; pageSize?: number } = {},
): Promise<PaginatedList<PostListItem>> {
  const page = normalizePage(options.page ?? 1);
  const pageSize = normalizePageSize(options.pageSize ?? 20);
  const limit = options.limit ?? pageSize;
  const from = (page - 1) * pageSize;
  const to = from + limit - 1;

  const supabase = await createSupabaseServer();

  if (!supabase) {
    const items = mockPosts
      .filter((p) => !p.is_hidden && !p.is_notice)
      .slice(from, from + limit)
      .map(getMockPostListItem);
    return createPaginatedList(items, page, pageSize, mockPosts.length);
  }

  const { data, count, error } = await supabase
    .from("posts")
    .select(boardPostFeedSelect, { count: "exact" })
    .eq("topic", topic)
    .eq("is_hidden", false)
    .eq("is_notice", false)
    .order("up_count", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error || !data) {
    return createPaginatedList([], page, pageSize, 0);
  }

  return createPaginatedList(
    (data as SupabasePostFeedRow[]).map(toPostListItem),
    page,
    pageSize,
    count ?? 0,
  );
}

export async function getTodayPostCount() {
  const supabase = await createSupabaseServer();

  if (!supabase) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    return mockPosts.filter(
      (post) => !post.is_notice && !post.is_hidden && post.created_at >= todayStart.toISOString(),
    ).length;
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

export async function getAllPostsFeed(options: PostFeedOptions = {}) {
  const resolvedOptions = {
    page: normalizePage(options.page),
    pageSize: normalizePageSize(options.pageSize),
    query: normalizeSearchQuery(options.query),
  };
  const supabase = await createSupabaseServer();

  if (!supabase) {
    const all = mockPosts
      .filter((p) => !p.is_notice && !p.is_hidden)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
    const from = (resolvedOptions.page - 1) * resolvedOptions.pageSize;
    return createPaginatedList(
      all.slice(from, from + resolvedOptions.pageSize).map(getMockPostListItem),
      resolvedOptions.page,
      resolvedOptions.pageSize,
      all.length,
    );
  }

  const from = (resolvedOptions.page - 1) * resolvedOptions.pageSize;
  const to = from + resolvedOptions.pageSize - 1;

  let q = supabase
    .from("posts")
    .select(boardPostFeedSelect, { count: "exact" })
    .eq("is_notice", false)
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (resolvedOptions.query) {
    q = q.or(`title.ilike.%${resolvedOptions.query}%,content.ilike.%${resolvedOptions.query}%`);
  }

  const { data, error, count } = await q;

  if (error || !data) {
    return createPaginatedList([], resolvedOptions.page, resolvedOptions.pageSize, 0);
  }

  return createPaginatedList(
    (data as SupabasePostFeedRow[]).map(toPostListItem),
    resolvedOptions.page,
    resolvedOptions.pageSize,
    count ?? 0,
  );
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
  topic,
}: {
  boardId: string;
  title: string;
  content: string;
  isNotice?: boolean;
  isAnonymous?: boolean;
  authorId?: string;
  images?: string[];
  topic?: string | null;
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
      ...(topic ? { topic } : {}),
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
    empathy_count: 0,
    view_count: 0,
    images: images ?? [],
    topic: null,
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
    topic,
  }: {
    boardId?: string;
    title?: string;
    content?: string;
    isNotice?: boolean;
    isAnonymous?: boolean;
    authorId?: string;
    images?: string[];
    topic?: string | null;
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
      topic?: string | null;
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

    if (topic !== undefined) {
      payload.topic = topic ?? null;
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
