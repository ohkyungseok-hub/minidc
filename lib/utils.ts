/**
 * 한글·영문 혼합 텍스트를 URL 슬러그로 변환합니다.
 * 한글은 그대로 유지 (브라우저·검색엔진 모두 지원)
 */
export function slugify(text: string, maxLength = 50): string {
  return text
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^\w\uAC00-\uD7A3\s-]/g, "") // 영숫자·한글·공백·하이픈만 유지
    .replace(/\s+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, maxLength)
    .replace(/-$/, ""); // 잘린 후 끝 하이픈 제거
}

/**
 * UUID(36자) + 슬러그를 결합한 게시글 URL을 반환합니다.
 * 기존 /posts/[uuid] URL과 100% 하위 호환됩니다.
 *
 * 예: /posts/abc123...-요즘-아무-이유-없이
 */
export function getPostUrl(postId: string, title: string): string {
  const slug = slugify(title);
  return slug ? `/posts/${postId}-${slug}` : `/posts/${postId}`;
}

/**
 * pretty URL params.id 에서 UUID 36자를 추출합니다.
 * 기존 /posts/[uuid] 형식도 그대로 동작합니다.
 */
export function extractPostId(param: string): string {
  return param.substring(0, 36);
}
