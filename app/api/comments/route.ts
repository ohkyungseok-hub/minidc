import { NextResponse } from "next/server";

import { createComment } from "@/lib/comments";
import { createSupabaseServer } from "@/lib/supabase/server";

type CommentRequestBody = {
  postId?: string;
  body?: string;
};

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServer();

    if (!supabase) {
      return NextResponse.json(
        { ok: false, message: "Supabase 환경변수가 설정되지 않았습니다." },
        { status: 500 },
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "로그인한 사용자만 댓글을 작성할 수 있습니다." },
        { status: 401 },
      );
    }

    const payload = (await request.json()) as CommentRequestBody;

    if (!payload.postId || !payload.body?.trim()) {
      return NextResponse.json(
        { ok: false, message: "댓글 본문이 필요합니다." },
        { status: 400 },
      );
    }

    const comment = await createComment({
      postId: payload.postId,
      body: payload.body,
      authorId: user.id,
    });

    return NextResponse.json({ ok: true, comment }, { status: 201 });
  } catch {
    return NextResponse.json(
      { ok: false, message: "댓글을 저장하지 못했습니다." },
      { status: 400 },
    );
  }
}
