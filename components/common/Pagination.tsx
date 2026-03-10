import Link from "next/link";

type PaginationProps = {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
};

export default function Pagination({ page, totalPages, buildHref }: PaginationProps) {
  if (totalPages <= 1) return null;

  // Show at most 5 page numbers centered around current page
  const delta = 2;
  const start = Math.max(1, page - delta);
  const end = Math.min(totalPages, page + delta);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <nav aria-label="페이지 네비게이션" className="flex items-center justify-center gap-1 flex-wrap">
      <Link
        href={buildHref(1)}
        aria-label="첫 페이지"
        className={`rounded-md border px-2.5 py-2 text-sm font-semibold transition ${
          page === 1
            ? "pointer-events-none border-slate-100 bg-slate-50 text-slate-300"
            : "border-[var(--line)] bg-white text-slate-500 hover:bg-[var(--primary-soft)]"
        }`}
      >
        «
      </Link>
      <Link
        href={buildHref(Math.max(1, page - 1))}
        aria-label="이전 페이지"
        className={`rounded-md border px-2.5 py-2 text-sm font-semibold transition ${
          page === 1
            ? "pointer-events-none border-slate-100 bg-slate-50 text-slate-300"
            : "border-[var(--line)] bg-white text-slate-500 hover:bg-[var(--primary-soft)]"
        }`}
      >
        ‹
      </Link>

      {start > 1 ? (
        <span className="px-1 text-sm text-slate-400">…</span>
      ) : null}

      {pages.map((p) => (
        <Link
          key={p}
          href={buildHref(p)}
          aria-current={p === page ? "page" : undefined}
          className={`min-w-[36px] rounded-md border px-2.5 py-2 text-center text-sm font-semibold transition ${
            p === page
              ? "border-[var(--primary-strong)] bg-[var(--primary)] text-[var(--primary-ink)]"
              : "border-[var(--line)] bg-white text-slate-700 hover:bg-[var(--primary-soft)]"
          }`}
        >
          {p}
        </Link>
      ))}

      {end < totalPages ? (
        <span className="px-1 text-sm text-slate-400">…</span>
      ) : null}

      <Link
        href={buildHref(Math.min(totalPages, page + 1))}
        aria-label="다음 페이지"
        className={`rounded-md border px-2.5 py-2 text-sm font-semibold transition ${
          page === totalPages
            ? "pointer-events-none border-slate-100 bg-slate-50 text-slate-300"
            : "border-[var(--line)] bg-white text-slate-500 hover:bg-[var(--primary-soft)]"
        }`}
      >
        ›
      </Link>
      <Link
        href={buildHref(totalPages)}
        aria-label="마지막 페이지"
        className={`rounded-md border px-2.5 py-2 text-sm font-semibold transition ${
          page === totalPages
            ? "pointer-events-none border-slate-100 bg-slate-50 text-slate-300"
            : "border-[var(--line)] bg-white text-slate-500 hover:bg-[var(--primary-soft)]"
        }`}
      >
        »
      </Link>
    </nav>
  );
}
