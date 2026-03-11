import { NextResponse } from "next/server";

import { createSupabaseAdmin } from "@/lib/supabase/admin-client";

type VoteBody = {
  pollId?: string;
  optionId?: string;
  voterKey?: string;
  isChange?: boolean;
};

type OptionRow = { id: string; vote_count: number; sort_order: number };
type VoteRow = { option_id: string };

async function getOptions(supabase: NonNullable<ReturnType<typeof createSupabaseAdmin>>, pollId: string) {
  const { data } = await supabase
    .from("poll_options" as never)
    .select("id, vote_count, sort_order")
    .eq("poll_id", pollId)
    .order("sort_order");
  return (data as OptionRow[] | null) ?? [];
}

function buildResult(options: OptionRow[], alreadyVoted: boolean) {
  const totalVotes = options.reduce((s, o) => s + o.vote_count, 0);
  return {
    ok: true,
    alreadyVoted,
    totalVotes,
    options: options.map((o) => ({
      id: o.id,
      voteCount: o.vote_count,
      percent: totalVotes > 0 ? Math.round((o.vote_count / totalVotes) * 100) : 0,
    })),
  };
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseAdmin();

    if (!supabase) {
      return NextResponse.json(
        { ok: false, message: "서버 설정이 올바르지 않습니다." },
        { status: 503 },
      );
    }

    const body = (await request.json()) as VoteBody;

    if (!body.pollId || !body.optionId || !body.voterKey) {
      return NextResponse.json(
        { ok: false, message: "투표 정보가 올바르지 않습니다." },
        { status: 400 },
      );
    }

    // Check existing vote
    const { data: existing } = await supabase
      .from("poll_votes" as never)
      .select("option_id")
      .eq("poll_id", body.pollId)
      .eq("voter_key", body.voterKey)
      .maybeSingle();

    const existingVote = existing as VoteRow | null;

    if (existingVote) {
      if (!body.isChange || existingVote.option_id === body.optionId) {
        // Already voted and not changing, or same option re-selected
        return NextResponse.json(buildResult(await getOptions(supabase, body.pollId), true));
      }

      // Re-vote: read current counts first
      const allOptions = await getOptions(supabase, body.pollId);
      const oldOpt = allOptions.find((o) => o.id === existingVote.option_id);
      const newOpt = allOptions.find((o) => o.id === body.optionId);

      if (oldOpt && newOpt) {
        await supabase
          .from("poll_options" as never)
          .update({ vote_count: Math.max(oldOpt.vote_count - 1, 0) } as never)
          .eq("id", oldOpt.id);
        await supabase
          .from("poll_options" as never)
          .update({ vote_count: newOpt.vote_count + 1 } as never)
          .eq("id", newOpt.id);
        await supabase
          .from("poll_votes" as never)
          .update({ option_id: body.optionId } as never)
          .eq("poll_id", body.pollId)
          .eq("voter_key", body.voterKey);
      }
    } else {
      // First vote: read current count then increment
      const allOptions = await getOptions(supabase, body.pollId);
      const targetOpt = allOptions.find((o) => o.id === body.optionId);

      await supabase
        .from("poll_votes" as never)
        .insert({ poll_id: body.pollId, option_id: body.optionId, voter_key: body.voterKey } as never);

      if (targetOpt) {
        await supabase
          .from("poll_options" as never)
          .update({ vote_count: targetOpt.vote_count + 1 } as never)
          .eq("id", body.optionId);
      }
    }

    return NextResponse.json(buildResult(await getOptions(supabase, body.pollId), false));
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "요청을 처리하지 못했습니다.",
      },
      { status: 400 },
    );
  }
}
