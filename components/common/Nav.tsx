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
      <div className="flex min-w-max items-center gap-1">
      {items.map((item) => {
        const active =
          item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-t-md border border-b-0 px-4 py-2 text-sm font-semibold transition ${
              active
                ? "border-[#a9b9d5] bg-[#f7faff] text-[#244a85]"
                : "border-transparent text-slate-600 hover:bg-white hover:text-slate-900"
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
