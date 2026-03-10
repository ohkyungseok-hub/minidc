import { getBoards } from "@/lib/boards";
import { createSupabaseServer } from "@/lib/supabase/server";
import type {
  AdminCommentListItem,
  AdminDashboardStats,
  AdminPostListItem,
  AdminReportListItem,
  AdminUserListItem,
  Board,
} from "@/types";

const ADMIN_LIST_LIMIT = 100;
const DASHBOARD_REPORT_LIMIT = 5;

function unwrapRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

type DashboardReportRow = {
  id: string;
  reporter_id: string;
  target_type: "post" | "comment";
  post_id: string | null;
  comment_id: string | null;
  reason: string;
  detail: string | null;
  status: "pending" | "resolved" | "dismissed";
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  reporter: { id: string; nickname: string } | { id: string; nickname: string }[] | null;
  target_post:
    | { id: string; title: string; author_id: string }
    | { id: string; title: string; author_id: string }[]
    | null;
  target_comment:
    | { id: string; body: string; author_id: string; post_id: string }
    | { id: string; body: string; author_id: string; post_id: string }[]
    | null;
};

type AdminPostRow = {
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
  author:
    | { id: string; nickname: string; role: "user" | "admin" }
    | { id: string; nickname: string; role: "user" | "admin" }[]
    | null;
  board:
    | { id: string; slug: string; name: string }
    | { id: string; slug: string; name: string }[]
    | null;
  reports:
    | { id: string; status: "pending" | "resolved" | "dismissed" }[]
    | null;
};

type AdminCommentRow = {
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
    | { id: string; nickname: string; role: "user" | "admin" }
    | { id: string; nickname: string; role: "user" | "admin" }[]
    | null;
  post:
    | { id: string; title: string }
    | { id: string; title: string }[]
    | null;
  reports:
    | { id: string; status: "pending" | "resolved" | "dismissed" }[]
    | null;
};

type AdminListOptions = {
  query?: string;
};

type AdminPostListOptions = AdminListOptions & {
  boardId?: string;
  notice?: "all" | "notice" | "normal";
  reported?: "all" | "reported" | "clean";
};

type AdminReportListOptions = AdminListOptions & {
  status?: "all" | "pending" | "resolved" | "dismissed";
  targetType?: "all" | "post" | "comment";
};

const adminReportSelect = `
  id,
  reporter_id,
  target_type,
  post_id,
  comment_id,
  reason,
  detail,
  status,
  reviewed_by,
  reviewed_at,
  created_at,
  reporter:users!reports_reporter_id_fkey (
    id,
    nickname
  ),
  target_post:posts!reports_post_id_fkey (
    id,
    title,
    author_id
  ),
  target_comment:comments!reports_comment_id_fkey (
    id,
    body,
    author_id,
    post_id
  )
`;

const adminPostSelect = `
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
  created_at,
  updated_at,
  author:users!posts_author_id_fkey (
    id,
    nickname,
    role
  ),
  board:boards!posts_board_id_fkey (
    id,
    slug,
    name
  ),
  reports:reports!reports_post_id_fkey (
    id,
    status
  )
`;

const adminCommentSelect = `
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
    role
  ),
  post:posts!comments_post_id_fkey (
    id,
    title
  ),
  reports:reports!reports_comment_id_fkey (
    id,
    status
  )
`;

function normalizeQuery(query?: string) {
  return query?.trim().toLowerCase() ?? "";
}

function toAdminReportItem(row: DashboardReportRow): AdminReportListItem {
  const reporter = unwrapRelation(row.reporter);
  const targetPost = unwrapRelation(row.target_post);
  const targetComment = unwrapRelation(row.target_comment);

  return {
    id: row.id,
    reporter_id: row.reporter_id,
    target_type: row.target_type,
    post_id: row.post_id,
    comment_id: row.comment_id,
    reason: row.reason,
    detail: row.detail,
    status: row.status,
    reviewed_by: row.reviewed_by,
    reviewed_at: row.reviewed_at,
    created_at: row.created_at,
    reporter: reporter
      ? {
          id: reporter.id,
          nickname: reporter.nickname,
        }
      : null,
    target_post: targetPost
      ? {
          id: targetPost.id,
          title: targetPost.title,
          author_id: targetPost.author_id,
        }
      : null,
    target_comment: targetComment
      ? {
          id: targetComment.id,
          body: targetComment.body,
          author_id: targetComment.author_id,
          post_id: targetComment.post_id,
        }
      : null,
  };
}

function toAdminPostItem(row: AdminPostRow): AdminPostListItem {
  const author = unwrapRelation(row.author);
  const board = unwrapRelation(row.board);
  const reports = row.reports ?? [];
  const pendingCount = reports.filter((report) => report.status === "pending").length;

  return {
    id: row.id,
    board_id: row.board_id,
    author_id: row.author_id,
    title: row.title,
    content: row.content,
    is_notice: row.is_notice,
    is_anonymous: row.is_anonymous,
    is_hidden: row.is_hidden,
    hidden_reason: row.hidden_reason,
    up_count: row.up_count ?? 0,
    down_count: row.down_count ?? 0,
    view_count: row.view_count ?? 0,
    images: row.images ?? [],
    created_at: row.created_at,
    updated_at: row.updated_at,
    author: author
      ? {
          id: author.id,
          nickname: author.nickname,
          role: author.role,
        }
      : undefined,
    board: board
      ? {
          id: board.id,
          slug: board.slug,
          name: board.name,
        }
      : undefined,
    report_count: reports.length,
    pending_report_count: pendingCount,
  };
}

function toAdminCommentItem(row: AdminCommentRow): AdminCommentListItem {
  const author = unwrapRelation(row.author);
  const post = unwrapRelation(row.post);
  const reports = row.reports ?? [];
  const pendingCount = reports.filter((report) => report.status === "pending").length;

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
        }
      : undefined,
    post: post
      ? {
          id: post.id,
          title: post.title,
        }
      : undefined,
    report_count: reports.length,
    pending_report_count: pendingCount,
  };
}

function filterAdminPosts(items: AdminPostListItem[], options: AdminPostListOptions) {
  const query = normalizeQuery(options.query);

  return items.filter((item) => {
    if (options.boardId && item.board_id !== options.boardId) {
      return false;
    }

    if (options.notice === "notice" && !item.is_notice) {
      return false;
    }

    if (options.notice === "normal" && item.is_notice) {
      return false;
    }

    const hasReports = (item.report_count ?? 0) > 0;

    if (options.reported === "reported" && !hasReports) {
      return false;
    }

    if (options.reported === "clean" && hasReports) {
      return false;
    }

    if (!query) {
      return true;
    }

    const haystack = [
      item.title,
      item.content,
      item.author?.nickname ?? "",
      item.board?.name ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

function filterAdminComments(items: AdminCommentListItem[], options: AdminListOptions) {
  const query = normalizeQuery(options.query);

  if (!query) {
    return items;
  }

  return items.filter((item) =>
    [item.body, item.author?.nickname ?? "", item.post?.title ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(query),
  );
}

function filterAdminReports(items: AdminReportListItem[], options: AdminReportListOptions) {
  const query = normalizeQuery(options.query);

  return items.filter((item) => {
    if (options.status && options.status !== "all" && item.status !== options.status) {
      return false;
    }

    if (options.targetType && options.targetType !== "all" && item.target_type !== options.targetType) {
      return false;
    }

    if (!query) {
      return true;
    }

    const haystack = [
      item.reason,
      item.detail ?? "",
      item.reporter?.nickname ?? "",
      item.target_post?.title ?? "",
      item.target_comment?.body ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

export async function getAdminBoards() {
  return getBoards();
}

export async function getAdminDashboardData(): Promise<{
  stats: AdminDashboardStats;
  recentReports: AdminReportListItem[];
}> {
  const supabase = await createSupabaseServer();

  if (!supabase) {
    return {
      stats: {
        totalUsers: 0,
        totalPosts: 0,
        totalComments: 0,
        pendingReports: 0,
        todayVisitors: 0,
        todayNewUsers: 0,
      },
      recentReports: [],
    };
  }

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const todayStartISO = todayStart.toISOString();

  const [
    usersResponse,
    postsResponse,
    commentsResponse,
    reportsResponse,
    recentReportsResponse,
    todayVisitorsResponse,
    todayNewUsersResponse,
  ] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("posts").select("id", { count: "exact", head: true }),
    supabase.from("comments").select("id", { count: "exact", head: true }),
    supabase
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("reports")
      .select(adminReportSelect)
      .order("created_at", { ascending: false })
      .limit(DASHBOARD_REPORT_LIMIT),
    supabase
      .from("page_views")
      .select("id", { count: "exact", head: true })
      .gte("created_at", todayStartISO),
    supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .gte("created_at", todayStartISO),
  ]);

  return {
    stats: {
      totalUsers: usersResponse.count ?? 0,
      totalPosts: postsResponse.count ?? 0,
      totalComments: commentsResponse.count ?? 0,
      pendingReports: reportsResponse.count ?? 0,
      todayVisitors: todayVisitorsResponse.count ?? 0,
      todayNewUsers: todayNewUsersResponse.count ?? 0,
    },
    recentReports: (recentReportsResponse.data as DashboardReportRow[] | null)?.map(
      toAdminReportItem,
    ) ?? [],
  };
}

export async function getAdminUsers(query?: string) {
  const supabase = await createSupabaseServer();

  if (!supabase) {
    return [] as AdminUserListItem[];
  }

  const { data, error } = await supabase.rpc("admin_list_users", {
    p_query: query?.trim() ? query.trim() : null,
  } as never);

  if (error || !data) {
    return [] as AdminUserListItem[];
  }

  return data as AdminUserListItem[];
}

export async function getAdminPosts(options: AdminPostListOptions = {}) {
  const supabase = await createSupabaseServer();

  if (!supabase) {
    return [] as AdminPostListItem[];
  }

  const { data, error } = await supabase
    .from("posts")
    .select(adminPostSelect)
    .order("created_at", { ascending: false })
    .limit(ADMIN_LIST_LIMIT);

  if (error || !data) {
    return [] as AdminPostListItem[];
  }

  return filterAdminPosts(
    (data as AdminPostRow[]).map(toAdminPostItem),
    options,
  );
}

export async function getAdminComments(options: AdminListOptions = {}) {
  const supabase = await createSupabaseServer();

  if (!supabase) {
    return [] as AdminCommentListItem[];
  }

  const { data, error } = await supabase
    .from("comments")
    .select(adminCommentSelect)
    .order("created_at", { ascending: false })
    .limit(ADMIN_LIST_LIMIT);

  if (error || !data) {
    return [] as AdminCommentListItem[];
  }

  return filterAdminComments(
    (data as AdminCommentRow[]).map(toAdminCommentItem),
    options,
  );
}

export async function getAdminReports(options: AdminReportListOptions = {}) {
  const supabase = await createSupabaseServer();

  if (!supabase) {
    return [] as AdminReportListItem[];
  }

  const { data, error } = await supabase
    .from("reports")
    .select(adminReportSelect)
    .order("created_at", { ascending: false })
    .limit(ADMIN_LIST_LIMIT);

  if (error || !data) {
    return [] as AdminReportListItem[];
  }

  return filterAdminReports(
    (data as DashboardReportRow[]).map(toAdminReportItem),
    options,
  );
}

export async function getAdminBoardOptions(): Promise<Board[]> {
  return getBoards();
}
