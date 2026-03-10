import Link from "next/link";

import type { Board } from "@/types";

type BoardListProps = {
  boards: Board[];
};

export default function BoardList({ boards }: BoardListProps) {
  if (!boards.length) {
    return (
      <div className="rounded-md border border-dashed border-[#cbd5e1] bg-white p-10 text-center text-sm text-slate-500">
        표시할 게시판이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-[var(--line)] bg-white">
      <div className="hidden grid-cols-[70px_220px_minmax(0,1fr)_110px] gap-4 border-b border-[var(--line)] bg-[var(--surface-strong)] px-5 py-3 text-xs font-bold tracking-[0.18em] text-slate-500 md:grid">
        <span>번호</span>
        <span>게시판</span>
        <span>설명</span>
        <span className="text-right">바로가기</span>
      </div>
      <div className="divide-y divide-[var(--line)]">
        {boards.map((board, index) => (
          <Link
            key={board.id}
            href={`/boards/${board.slug}`}
            className="block transition hover:bg-[var(--primary-soft)]"
          >
            <div className="grid gap-2 px-4 py-4 md:grid-cols-[70px_220px_minmax(0,1fr)_110px] md:items-center md:gap-4 md:px-5">
              <div className="text-sm font-semibold text-slate-400 md:text-base">
                {index + 1}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: board.accent ?? "#94a3b8" }}
                  />
                  <span className="truncate text-base font-bold text-slate-900">
                    {board.name}
                  </span>
                </div>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--primary-ink)]">
                  {board.slug}
                </p>
              </div>
              <p className="text-sm leading-6 text-slate-600">
                {board.description ?? "게시판 설명이 아직 없습니다."}
              </p>
              <div className="text-sm font-semibold text-[var(--primary-ink)] md:text-right">
                입장하기
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
