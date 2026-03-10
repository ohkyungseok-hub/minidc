import { createPostAction } from "@/app/posts/actions";
import PostForm from "@/components/posts/PostForm";
import SectionTitle from "@/components/common/SectionTitle";
import { isAdminUser, requireUser } from "@/lib/auth";
import { getBoards } from "@/lib/boards";

type NewPostPageProps = {
  searchParams: Promise<{
    error?: string;
    boardId?: string;
  }>;
};

export default async function NewPostPage({ searchParams }: NewPostPageProps) {
  const user = await requireUser("/login?next=/posts/new");
  const { error, boardId } = await searchParams;
  const boards = await getBoards();
  const defaultBoardId = boards.some((board) => board.id === boardId) ? boardId : "";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <SectionTitle
        eyebrow="Write"
        title="새 글 작성"
        description="고백하고 싶은 일, 위로가 필요한 순간, 해결책이 필요한 고민을 익명으로 남길 수 있습니다."
      />
      <PostForm
        boards={boards}
        formAction={createPostAction}
        submitLabel="게시글 저장"
        errorMessage={error}
        canManageNotice={isAdminUser(user)}
        defaultValues={{
          boardId: defaultBoardId ?? "",
          title: "",
          content: "",
          isAnonymous: false,
          isNotice: false,
        }}
      />
    </div>
  );
}
