import { ImageResponse } from "next/og";

export const alt = "BLACKPEARLS 익명 고백";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Edge runtime: cookies() 불가 → Supabase REST API 직접 호출
export const runtime = "edge";

async function fetchPostTitle(postId: string): Promise<{ title: string; boardName: string } | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) return null;

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/posts?id=eq.${postId}&is_hidden=eq.false&select=title,board:boards(name)&limit=1`,
      {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
          Accept: "application/json",
        },
        next: { revalidate: 3600 },
      },
    );

    if (!res.ok) return null;

    const data = (await res.json()) as Array<{
      title: string;
      board: { name: string } | null;
    }>;

    const row = data[0];
    if (!row) return null;

    return {
      title: row.title,
      boardName: (row.board as { name: string } | null)?.name ?? "",
    };
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: { id: string } }) {
  const postId = params.id.substring(0, 36);
  const post = await fetchPostTitle(postId);

  const title = post?.title ?? "익명의 고백";
  const boardName = post?.boardName ?? "";

  // 긴 제목 truncate
  const displayTitle = title.length > 50 ? `${title.slice(0, 50)}…` : title;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#f0f4ff",
          padding: "60px",
          fontFamily: "sans-serif",
        }}
      >
        {/* 상단 브랜딩 */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: 56,
              height: 56,
              backgroundColor: "#c8d8f8",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: 900,
              color: "#2d4a6e",
              letterSpacing: "0.1em",
            }}
          >
            BP
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: "#1e3a5f", letterSpacing: "0.08em" }}>
              BLACKPEARLS
            </span>
            <span style={{ fontSize: 12, color: "#5a7fa8", letterSpacing: "0.2em" }}>
              bless you
            </span>
          </div>
          {boardName ? (
            <div
              style={{
                marginLeft: "auto",
                backgroundColor: "#dce8ff",
                color: "#2d4a6e",
                fontSize: 14,
                fontWeight: 700,
                padding: "6px 16px",
                borderRadius: 20,
              }}
            >
              {boardName}
            </div>
          ) : null}
        </div>

        {/* 메인 제목 */}
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            paddingTop: 40,
            paddingBottom: 40,
          }}
        >
          <p
            style={{
              fontSize: displayTitle.length > 30 ? 42 : 52,
              fontWeight: 900,
              color: "#1a2e45",
              lineHeight: 1.4,
              letterSpacing: "-0.02em",
              maxWidth: 900,
            }}
          >
            {displayTitle}
          </p>
        </div>

        {/* 하단 설명 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #b8ccee",
            paddingTop: 24,
          }}
        >
          <span style={{ fontSize: 16, color: "#4a6a92" }}>
            남에게 말 못한 이야기를 익명으로 털어놓는 공간
          </span>
          <span style={{ fontSize: 16, color: "#7a9fc0", fontWeight: 600 }}>
            blackpearls.kr
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
