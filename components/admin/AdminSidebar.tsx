"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminNavItems = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/users", label: "회원 관리" },
  { href: "/admin/posts", label: "게시글 관리" },
  { href: "/admin/comments", label: "댓글 관리" },
  { href: "/admin/reports", label: "신고 관리" },
  { href: "/admin/polls", label: "투표 관리" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {adminNavItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
              isActive
                ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary-ink)]"
                : "border-slate-200 bg-white text-slate-700 hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-slate-950"
            }`}
          >
            <span>{item.label}</span>
            <span className="text-xs uppercase tracking-[0.2em]">
              {item.href === "/admin" ? "home" : item.href.split("/").at(-1)}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
