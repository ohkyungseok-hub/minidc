import Link from "next/link";

import type { Board } from "@/types";

type BoardTabsProps = {
  boards: Board[];
  currentSlug?: string;
};

export default function BoardTabs({ boards, currentSlug }: BoardTabsProps) {
  return (
    <div className="overflow-hidden rounded-md border border-[var(--line)] bg-white">
      <div className="flex min-w-max items-center overflow-x-auto gap-1 px-2 py-1.5">
        <Link
          href="/boards"
          className={`rounded-lg border px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition ${
            currentSlug
              ? "border-transparent bg-transparent text-slate-600 hover:border-[var(--primary)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary-ink)]"
              : "border-[var(--primary-strong)] bg-[var(--primary)] text-[var(--primary-ink)]"
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
              className={`rounded-lg border px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition ${
              active
                  ? "border-[var(--primary-strong)] bg-[var(--primary)] text-[var(--primary-ink)]"
                  : "border-transparent bg-transparent text-slate-600 hover:border-[var(--primary)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary-ink)]"
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
