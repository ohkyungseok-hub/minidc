import { NextResponse } from "next/server";

import { createSupabaseServer } from "@/lib/supabase/server";

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
        { ok: false, message: "로그인 후 공감할 수 있습니다." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as { postId?: string };

    if (!body.postId) {
      return NextResponse.json(
        { ok: false, message: "게시글 ID가 필요합니다." },
        { status: 400 },
      );
    }

    const { data, error } = await supabase.rpc(
      "toggle_post_empathy" as never,
      { p_post_id: body.postId } as never,
    );

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message ?? "공감 처리에 실패했습니다." },
        { status: 400 },
      );
    }

    const rows = data as { empathy_count: number; has_empathized: boolean }[] | null;
    const result = rows?.[0];

    return NextResponse.json({
      ok: true,
      empathyCount: result?.empathy_count ?? 0,
      hasEmpathized: result?.has_empathized ?? false,
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
