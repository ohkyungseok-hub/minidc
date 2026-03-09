import { NextResponse } from "next/server";

import { isAdminUser } from "@/lib/auth";
import { deletePost, updatePost } from "@/lib/posts";
import { createSupabaseServer } from "@/lib/supabase/server";

type PostRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

type PostUpdateBody = {
  boardId?: string;
  title?: string;
  content?: string;
  isNotice?: boolean;
  isAnonymous?: boolean;
};

export async function PATCH(request: Request, { params }: PostRouteProps) {
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
        { ok: false, message: "로그인한 사용자만 글을 수정할 수 있습니다." },
        { status: 401 },
      );
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const { id } = await params;
    const payload = (await request.json()) as PostUpdateBody;

    if (typeof payload.isNotice === "boolean" && !isAdminUser(profile)) {
      return NextResponse.json(
        { ok: false, message: "공지글 상태는 관리자만 변경할 수 있습니다." },
        { status: 403 },
      );
    }

    const post = await updatePost(id, {
      ...payload,
      authorId: user.id,
    });

    return NextResponse.json({ ok: true, post });
  } catch {
    return NextResponse.json(
      { ok: false, message: "게시글을 수정하지 못했습니다." },
      { status: 404 },
    );
  }
}

export async function DELETE(_request: Request, { params }: PostRouteProps) {
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
        { ok: false, message: "로그인한 사용자만 글을 삭제할 수 있습니다." },
        { status: 401 },
      );
    }

    const { id } = await params;
    const post = await deletePost(id, user.id);

    return NextResponse.json({ ok: true, post });
  } catch {
    return NextResponse.json(
      { ok: false, message: "게시글을 삭제하지 못했습니다." },
      { status: 404 },
    );
  }
}
