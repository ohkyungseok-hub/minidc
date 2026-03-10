import type { Database } from "./database";

export type UserProfile = Database["public"]["Tables"]["users"]["Row"];
type BoardRow = Database["public"]["Tables"]["boards"]["Row"];
export type Report = Database["public"]["Tables"]["reports"]["Row"];
export type AdminUserListItem =
  Database["public"]["Functions"]["admin_list_users"]["Returns"][number];

export type Board = Pick<
  BoardRow,
  "id" | "slug" | "name" | "description" | "created_at"
> & {
  accent?: string | null;
  post_count?: number;
};
export type Post = Database["public"]["Tables"]["posts"]["Row"] & {
  board?: Board;
  author?: UserProfile;
  comment_count?: number;
};
export type PostVoteState = {
  currentVote: -1 | 0 | 1;
  upCount: number;
  downCount: number;
};
export type PostListItem = {
  id: string;
  board_id: string;
  title: string;
  is_notice: boolean;
  is_anonymous: boolean;
  view_count: number;
  created_at: string;
  recommend_count: number;
  author: Pick<UserProfile, "id" | "nickname"> | null;
  board?: Pick<Board, "id" | "slug" | "name"> | null;
};
export type PaginatedList<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};
export type Comment = Database["public"]["Tables"]["comments"]["Row"] & {
  author?: UserProfile;
};
export type VoteDirection = 1 | -1;
export type AdminDashboardStats = {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  pendingReports: number;
};
export type AdminPostListItem = Omit<Post, "author" | "board"> & {
  author?: Pick<UserProfile, "id" | "nickname" | "role">;
  board?: Pick<Board, "id" | "slug" | "name">;
  report_count?: number;
  pending_report_count?: number;
};
export type AdminCommentListItem = Omit<Comment, "author"> & {
  author?: Pick<UserProfile, "id" | "nickname" | "role">;
  post?: Pick<Post, "id" | "title">;
  report_count?: number;
  pending_report_count?: number;
};
export type AdminReportListItem = Report & {
  reporter?: Pick<UserProfile, "id" | "nickname"> | null;
  target_post?: Pick<Post, "id" | "title" | "author_id"> | null;
  target_comment?: Pick<Comment, "id" | "body" | "author_id" | "post_id"> | null;
};
export type PostFormValues = {
  boardId: string;
  title: string;
  content: string;
  isAnonymous: boolean;
  isNotice: boolean;
  images: string[];
};
