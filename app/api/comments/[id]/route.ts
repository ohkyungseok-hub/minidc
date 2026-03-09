import { NextResponse } from "next/server";

import { deleteComment } from "@/lib/comments";
import { createSupabaseServer } from "@/lib/supabase/server";

type CommentDeleteRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(
  _request: Request,
  { params }: CommentDeleteRouteProps,
) {
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
        { ok: false, message: "로그인한 사용자만 댓글을 삭제할 수 있습니다." },
        { status: 401 },
      );
    }

    const { id } = await params;
    const comment = await deleteComment(id, user.id);

    return NextResponse.json({ ok: true, comment });
  } catch {
    return NextResponse.json(
      { ok: false, message: "댓글을 삭제하지 못했습니다." },
      { status: 404 },
    );
  }
}
