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
        description="제목, 본문, 익명 여부를 입력한 뒤 저장하면 상세 페이지로 이동합니다."
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
