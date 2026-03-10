"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "홈" },
  { href: "/boards", label: "게시판" },
  { href: "/hot", label: "인기" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="overflow-x-auto">
      <div className="flex min-w-max items-center gap-1 pb-0.5">
      {items.map((item) => {
        const active =
          item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-t-lg border px-4 py-2.5 text-sm font-semibold transition ${
              active
                ? "border-[var(--primary-strong)] bg-[var(--primary)] text-[var(--primary-ink)] shadow-[inset_0_-2px_0_rgba(53,81,107,0.08)]"
                : "border-transparent bg-transparent text-slate-600 hover:border-[var(--primary)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary-ink)]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
      </div>
    </nav>
  );
}
