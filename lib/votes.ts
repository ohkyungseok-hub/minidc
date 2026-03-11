import { createSupabaseServer } from "@/lib/supabase/server";
import type { Post, PostVoteState, VoteDirection } from "@/types";

export type EmpathyState = {
  empathyCount: number;
  hasEmpathized: boolean;
};

export function getScore(
  entity: Pick<Post, "up_count" | "down_count"> | { up_count: number; down_count: number },
) {
  return entity.up_count - entity.down_count;
}

export async function getPostVoteState(
  postId: string,
  userId?: string,
): Promise<PostVoteState> {
  const supabase = await createSupabaseServer();

  if (!supabase) {
    return {
      currentVote: 0,
      upCount: 0,
      downCount: 0,
    };
  }

  const postQuery = supabase
    .from("posts")
    .select("up_count, down_count")
    .eq("id", postId)
    .maybeSingle();
  const { data } = await postQuery;
  const post = data as { up_count: number; down_count: number } | null;
  let currentVote: -1 | 0 | 1 = 0;

  if (userId) {
    const { data } = await supabase
      .from("post_votes")
      .select("vote_value")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .maybeSingle();

    currentVote = ((data as { vote_value: 1 | -1 } | null)?.vote_value ?? 0) as
      | -1
      | 0
      | 1;
  }

  return {
    currentVote,
    upCount: post?.up_count ?? 0,
    downCount: post?.down_count ?? 0,
  };
}

export async function getEmpathyState(
  postId: string,
  userId?: string,
): Promise<EmpathyState> {
  const supabase = await createSupabaseServer();

  if (!supabase) {
    return { empathyCount: 0, hasEmpathized: false };
  }

  const postQuery = supabase
    .from("posts")
    .select("empathy_count")
    .eq("id", postId)
    .maybeSingle();
  const { data: postData } = await postQuery;
  const empathyCount = (postData as { empathy_count?: number } | null)?.empathy_count ?? 0;
  let hasEmpathized = false;

  if (userId) {
    const { data } = await supabase
      .from("post_empathies" as never)
      .select("post_id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .maybeSingle();
    hasEmpathized = Boolean(data);
  }

  return { empathyCount, hasEmpathized };
}

export async function recordPostVote(postId: string, direction: VoteDirection) {
  const supabase = await createSupabaseServer();

  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const { data, error } = await supabase.rpc(
    "handle_post_vote" as never,
    {
      p_post_id: postId,
      p_next_vote: direction,
    } as never,
  );
  const resultRows = data as
    | { up_count: number; down_count: number; current_vote: -1 | 0 | 1 }[]
    | null;

  if (error) {
    throw new Error(error.message ?? "Failed to record vote");
  }

  if (!resultRows?.length) {
    throw new Error("Failed to record vote: no result returned");
  }

  const result = resultRows[0];

  return {
    upCount: result.up_count,
    downCount: result.down_count,
    currentVote: result.current_vote as -1 | 0 | 1,
  };
}
