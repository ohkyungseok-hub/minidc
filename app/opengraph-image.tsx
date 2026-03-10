import { ImageResponse } from "next/og";

export const alt = "블랙펄즈 | 익명 고백 커뮤니티";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "edge";

export default function Image() {
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
        </div>

        {/* 메인 문구 */}
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            gap: "24px",
          }}
        >
          <p
            style={{
              fontSize: 60,
              fontWeight: 900,
              color: "#1a2e45",
              lineHeight: 1.3,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            남에게 말 못한 이야기를
            <br />
            익명으로 털어놓는 공간
          </p>
          <p
            style={{
              fontSize: 22,
              color: "#4a6a92",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            고백, 위로, 공감 — 블랙펄즈에서 함께합니다
          </p>
        </div>

        {/* 하단 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #b8ccee",
            paddingTop: 24,
          }}
        >
          <div style={{ display: "flex", gap: "24px" }}>
            {["직장 고민", "인간관계", "가족 이야기", "불안·우울", "외로움", "돈 걱정"].map(
              (label) => (
                <span
                  key={label}
                  style={{
                    backgroundColor: "#dce8ff",
                    color: "#2d4a6e",
                    fontSize: 13,
                    fontWeight: 700,
                    padding: "5px 14px",
                    borderRadius: 20,
                  }}
                >
                  {label}
                </span>
              ),
            )}
          </div>
          <span style={{ fontSize: 16, color: "#7a9fc0", fontWeight: 600 }}>
            blackpearls.kr
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
