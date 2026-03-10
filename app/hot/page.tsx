import type { Metadata } from "next";

import SectionTitle from "@/components/common/SectionTitle";
import PostFeedTable from "@/components/posts/PostFeedTable";
import { getPopularPosts } from "@/lib/posts";
import { buildMetadata } from "@/config/seo";

export const metadata: Metadata = buildMetadata({
  title: "지금 인기 있는 익명 고백",
  description:
    "블랙펄즈에서 지금 가장 많은 공감과 위로를 받고 있는 익명 이야기들입니다. 최근 3일 기준 추천수 순으로 정렬됩니다.",
  path: "/hot",
});

export default async function HotPage() {
  const posts = await getPopularPosts();

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Hot"
        title="인기 글"
        description="최근 3일 이내 글을 추천수 우선, 조회수 보조 기준으로 정렬합니다."
      />
      <PostFeedTable posts={posts} emptyMessage="표시할 인기 글이 없습니다." />
    </div>
  );
}
