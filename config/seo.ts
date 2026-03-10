import type { Metadata } from "next";

export const SITE_NAME = "블랙펄즈";
export const SITE_NAME_EN = "BLACKPEARLS";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://blackpearls.kr";

export const SITE_DESCRIPTION =
  "블랙펄즈는 남에게 말 못한 고민과 치부를 익명으로 털어놓고, 타인의 이야기에서 위로와 공감을 얻는 익명 커뮤니티입니다. 고백을 소비하지 않고 함께 견디며 때로는 해결책까지 모아가는 공간입니다.";

// Next.js가 app/opengraph-image.tsx를 /opengraph-image로 자동 서빙하지만
// 외부 OG 크롤러를 위해 정적 경로도 함께 지정
export const OG_IMAGE = `${SITE_URL}/opengraph-image`;

/** page-level metadata 생성 헬퍼 */
export function buildMetadata({
  title,
  description,
  path = "",
  noindex = false,
}: {
  title: string;
  description: string;
  path?: string;
  noindex?: boolean;
}): Metadata {
  const url = `${SITE_URL}${path}`;

  return {
    title,
    description,
    ...(noindex && { robots: { index: false, follow: false } }),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "ko_KR",
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE],
    },
  };
}

/** 게시글 상세 metadata 생성 헬퍼 */
export function buildPostMetadata({
  postId,
  title,
  content,
  topicLabel,
}: {
  postId: string;
  title: string;
  content: string;
  topicLabel?: string;
}): Metadata {
  const metaTitle = topicLabel
    ? `${title} | ${topicLabel} 익명 고백 | ${SITE_NAME}`
    : `${title} | ${SITE_NAME}`;

  // content 앞 120자를 description으로 사용
  const snippet = content.replace(/\s+/g, " ").trim().slice(0, 120);
  const description = `${snippet}… 블랙펄즈에서 비슷한 고민과 공감, 위로의 이야기를 함께 볼 수 있습니다.`;

  return buildMetadata({
    title: metaTitle,
    description,
    path: `/posts/${postId}`,
  });
}
