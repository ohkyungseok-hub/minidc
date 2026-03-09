import { NextResponse } from "next/server";

import { createSupabaseServer } from "@/lib/supabase/server";
import { recordPostVote } from "@/lib/votes";
import type { VoteDirection } from "@/types";

type VoteRequestBody = {
  postId?: string;
  direction?: VoteDirection;
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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "로그인 후 추천/비추천할 수 있습니다." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as VoteRequestBody;

    if (!body.postId || (body.direction !== 1 && body.direction !== -1)) {
      return NextResponse.json(
        { ok: false, message: "유효한 투표 요청이 아닙니다." },
        { status: 400 },
      );
    }

    const result = await recordPostVote(body.postId, body.direction);

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "요청을 처리하지 못했습니다.",
      },
      { status: 400 },
    );
  }
}
