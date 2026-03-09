import { NextResponse } from "next/server";

import { incrementViewCount } from "@/lib/posts";

type ViewRequestBody = {
  postId?: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ViewRequestBody;

    if (!payload.postId) {
      return NextResponse.json(
        { ok: false, message: "postId가 필요합니다." },
        { status: 400 },
      );
    }

    const viewCount = await incrementViewCount(payload.postId);

    return NextResponse.json({ ok: true, viewCount });
  } catch {
    return NextResponse.json(
      { ok: false, message: "조회수를 갱신하지 못했습니다." },
      { status: 400 },
    );
  }
}
