import Link from "next/link";

import type { Board } from "@/types";

type BoardTabsProps = {
  boards: Board[];
  currentSlug?: string;
};

export default function BoardTabs({ boards, currentSlug }: BoardTabsProps) {
  return (
    <div className="overflow-hidden rounded-md border border-[#d5dce7] bg-white">
      <div className="flex min-w-max items-center overflow-x-auto px-2">
        <Link
          href="/boards"
          className={`border-b-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition ${
            currentSlug
              ? "border-transparent text-slate-600 hover:text-slate-900"
              : "border-[#2f5ea9] text-[#244a85]"
          }`}
        >
          전체
        </Link>
        {boards.map((board) => {
          const active = board.slug === currentSlug;

          return (
            <Link
              key={board.id}
              href={`/boards/${board.slug}`}
              className={`border-b-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition ${
                active
                  ? "border-[#2f5ea9] bg-[#f7faff] text-[#244a85]"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {board.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
