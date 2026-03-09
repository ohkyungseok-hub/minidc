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
};

export type Database = {
  public: {
    Tables: {
      users: TableShape<{
        id: string;
        nickname: string;
        role: "user" | "admin";
        avatar_url: string | null;
        created_at: string;
        updated_at: string | null;
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
        up_count: number;
        down_count: number;
        view_count: number;
        created_at: string;
        updated_at: string | null;
      }>;
      comments: TableShape<{
        id: string;
        post_id: string;
        author_id: string;
        body: string;
        is_deleted: boolean;
        upvotes: number;
        downvotes: number;
        created_at: string;
        updated_at: string | null;
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
