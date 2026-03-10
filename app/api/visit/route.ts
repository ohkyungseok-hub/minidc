import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseServer } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD (UTC)

  // 오늘 이미 기록됐으면 스킵
  if (request.cookies.get("bpv_d")?.value === today) {
    return NextResponse.json({ ok: true });
  }

  const supabase = await createSupabaseServer();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // PostgREST v12 타입 추론 제한으로 인한 캐스팅
    await supabase.from("page_views").insert({ user_id: user?.id ?? null } as never);
  }

  const response = NextResponse.json({ ok: true });

  const midnight = new Date();
  midnight.setUTCHours(23, 59, 59, 999);

  response.cookies.set("bpv_d", today, {
    expires: midnight,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return response;
}
