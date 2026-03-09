import Link from "next/link";

import AdminSidebar from "@/components/admin/AdminSidebar";
import { requireAdminUser } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const admin = await requireAdminUser("/login?next=/admin");

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
        <section className="rounded-[1.75rem] border border-[#d7e1f0] bg-[#f6f9ff] p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#2f5ea9]">
            Admin Console
          </p>
          <div className="mt-3 space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-slate-950">
              {admin.nickname}
            </h1>
            <p className="text-sm leading-6 text-slate-600">
              관리자 전용 대시보드입니다. 회원, 게시글, 댓글, 신고 데이터를 여기서만 조작합니다.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#244a85]">
            <span className="rounded-full bg-[#dbe8ff] px-2.5 py-1">role: {admin.role}</span>
            <span className="rounded-full bg-white px-2.5 py-1">level: {admin.level}</span>
          </div>
          <Link
            href="/"
            className="mt-5 inline-flex rounded-full border border-[#c8d7f0] bg-white px-4 py-2 text-sm font-semibold text-[#244a85] transition hover:border-[#2f5ea9]"
          >
            커뮤니티로 돌아가기
          </Link>
        </section>
        <AdminSidebar />
      </aside>
      <div className="min-w-0 space-y-6">{children}</div>
    </div>
  );
}
