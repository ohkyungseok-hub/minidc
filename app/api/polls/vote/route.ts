import { NextResponse } from "next/server";

import { createSupabaseServer } from "@/lib/supabase/server";

type VoteBody = {
  pollId?: string;
  optionId?: string;
  voterKey?: string;
};

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServer();

    if (!supabase) {
      return NextResponse.json(
        { ok: false, message: "Supabase 연결이 설정되지 않았습니다." },
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

    const { data, error } = await supabase.rpc(
      "cast_poll_vote" as never,
      {
        p_poll_id: body.pollId,
        p_option_id: body.optionId,
        p_voter_key: body.voterKey,
      } as never,
    );

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message ?? "투표에 실패했습니다." },
        { status: 400 },
      );
    }

    const rows = data as { option_id: string; vote_count: number; already_voted: boolean }[] | null;
    const alreadyVoted = rows?.[0]?.already_voted ?? false;
    const options = (rows ?? []).map((r) => ({
      id: r.option_id,
      voteCount: r.vote_count,
    }));
    const totalVotes = options.reduce((s, o) => s + o.voteCount, 0);

    return NextResponse.json({
      ok: true,
      alreadyVoted,
      totalVotes,
      options: options.map((o) => ({
        ...o,
        percent: totalVotes > 0 ? Math.round((o.voteCount / totalVotes) * 100) : 0,
      })),
    });
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
