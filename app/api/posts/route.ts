import { NextResponse } from "next/server";

import { isAdminUser } from "@/lib/auth";
import { createPost } from "@/lib/posts";
import { createSupabaseServer } from "@/lib/supabase/server";

type PostRequestBody = {
  boardId?: string;
  title?: string;
  content?: string;
  isNotice?: boolean;
  isAnonymous?: boolean;
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
        { ok: false, message: "로그인한 사용자만 글을 작성할 수 있습니다." },
        { status: 401 },
      );
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const payload = (await request.json()) as PostRequestBody;

    if (!payload.boardId || !payload.title?.trim() || !payload.content?.trim()) {
      return NextResponse.json(
        { ok: false, message: "게시판, 제목, 본문이 필요합니다." },
        { status: 400 },
      );
    }

    if (payload.isNotice && !isAdminUser(profile)) {
      return NextResponse.json(
        { ok: false, message: "공지글은 관리자만 작성할 수 있습니다." },
        { status: 403 },
      );
    }

    const post = await createPost({
      boardId: payload.boardId,
      title: payload.title,
      content: payload.content,
      isNotice: isAdminUser(profile) ? payload.isNotice : false,
      isAnonymous: payload.isAnonymous,
      authorId: user.id,
    });

    return NextResponse.json({ ok: true, post }, { status: 201 });
  } catch {
    return NextResponse.json(
      { ok: false, message: "게시글을 저장하지 못했습니다." },
      { status: 400 },
    );
  }
}
