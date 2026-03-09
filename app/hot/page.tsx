import SectionTitle from "@/components/common/SectionTitle";
import PostFeedTable from "@/components/posts/PostFeedTable";
import { getPopularPosts } from "@/lib/posts";

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
