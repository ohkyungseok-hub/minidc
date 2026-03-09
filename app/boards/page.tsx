import BoardList from "@/components/boards/BoardList";
import BoardTabs from "@/components/boards/BoardTabs";
import SearchForm from "@/components/common/SearchForm";
import SectionTitle from "@/components/common/SectionTitle";
import { getBoards } from "@/lib/boards";

type BoardsPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function BoardsPage({ searchParams }: BoardsPageProps) {
  const { q: rawQuery } = await searchParams;
  const query = rawQuery?.trim() ?? "";
  const boards = await getBoards();
  const filteredBoards = query
    ? boards.filter((board) => {
        const target = `${board.name} ${board.slug} ${board.description ?? ""}`.toLowerCase();

        return target.includes(query.toLowerCase());
      })
    : boards;

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Boards"
        title="전체 게시판"
        description={
          query
            ? `‘${query}’ 검색 결과 ${filteredBoards.length}개의 게시판을 찾았습니다.`
            : "게시판형 목록 레이아웃으로 전체 게시판을 빠르게 둘러볼 수 있습니다."
        }
        action={(
          <SearchForm
            action="/boards"
            placeholder="게시판 검색"
            defaultValue={query}
            className="w-full sm:w-[280px]"
          />
        )}
      />
      <BoardTabs boards={boards} />
      <BoardList boards={filteredBoards} />
    </div>
  );
}
