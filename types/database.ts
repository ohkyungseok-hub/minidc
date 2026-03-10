export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type TableShape<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      users: TableShape<{
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
      }>;
      page_views: TableShape<{
        id: string;
        user_id: string | null;
        created_at: string;
      }>;
      boards: TableShape<{
        id: string;
        slug: string;
        name: string;
        description: string | null;
        created_at: string;
      }>;
      posts: TableShape<{
        id: string;
        board_id: string;
        author_id: string;
        title: string;
        content: string;
        is_notice: boolean;
        is_anonymous: boolean;
        is_hidden: boolean;
        hidden_reason: string | null;
        up_count: number;
        down_count: number;
        view_count: number;
        images: string[];
        topic: "work" | "relationship" | "family" | "anxiety" | "loneliness" | "money" | null;
        created_at: string;
        updated_at: string | null;
      }>;
      comments: TableShape<{
        id: string;
        post_id: string;
        author_id: string;
        body: string;
        is_deleted: boolean;
        is_hidden: boolean;
        hidden_reason: string | null;
        upvotes: number;
        downvotes: number;
        created_at: string;
        updated_at: string | null;
      }>;
      reports: TableShape<{
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
      }>;
      votes: TableShape<{
        id: string;
        user_id: string;
        target_id: string;
        target_type: "post" | "comment";
        direction: 1 | -1;
        created_at: string;
      }>;
      post_votes: TableShape<{
        post_id: string;
        user_id: string;
        vote_value: 1 | -1;
        created_at: string;
        updated_at: string | null;
      }>;
    };
    Functions: {
      admin_list_users: {
        Args: {
          p_query: string | null;
        };
        Returns: {
          id: string;
          nickname: string;
          email: string | null;
          role: "user" | "admin";
          level: number;
          warning_count: number;
          is_suspended: boolean;
          suspended_until: string | null;
          created_at: string;
        }[];
      };
      handle_post_vote: {
        Args: {
          p_post_id: string;
          p_next_vote: 1 | -1;
        };
        Returns: {
          up_count: number;
          down_count: number;
          current_vote: -1 | 0 | 1;
        }[];
      };
    };
  };
};
