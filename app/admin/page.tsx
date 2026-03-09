import Link from "next/link";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTableCard from "@/components/admin/AdminTableCard";
import { getAdminDashboardData } from "@/lib/admin";

type AdminDashboardPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function AdminDashboardPage({
  searchParams,
}: AdminDashboardPageProps) {
  const params = await searchParams;
  const { stats, recentReports } = await getAdminDashboardData();

  const statCards = [
    { label: "전체 회원 수", value: stats.totalUsers },
    { label: "전체 게시글 수", value: stats.totalPosts },
    { label: "전체 댓글 수", value: stats.totalComments },
    { label: "미처리 신고 수", value: stats.pendingReports },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="관리자 대시보드"
        description="서비스 전체 현황과 최근 신고 상태를 한 화면에서 확인합니다."
        error={params.error}
        message={params.message}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <article
            key={card.label}
            className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-semibold text-slate-500">{card.label}</p>
            <p className="mt-3 text-4xl font-black tracking-tight text-slate-950">
              {card.value.toLocaleString("ko-KR")}
            </p>
          </article>
        ))}
      </section>

      <AdminTableCard>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-black text-slate-950">최근 신고</h2>
            <p className="text-sm text-slate-500">
              최근 들어온 글/댓글 신고를 최신순으로 표시합니다.
            </p>
          </div>
          <Link
            href="/admin/reports"
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
          >
            신고 관리로 이동
          </Link>
        </div>
        {!recentReports.length ? (
          <div className="px-5 py-10 text-sm text-slate-500">
            아직 들어온 신고가 없습니다.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentReports.map((report) => (
              <article key={report.id} className="space-y-2 px-5 py-4">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
                    {report.target_type === "post" ? "게시글" : "댓글"}
                  </span>
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 font-semibold text-amber-700">
                    {report.reason}
                  </span>
                  <span className="text-slate-500">
                    신고자 {report.reporter?.nickname ?? "unknown"}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500">{formatDate(report.created_at)}</span>
                </div>
                <p className="text-sm leading-6 text-slate-700">
                  {report.target_type === "post"
                    ? report.target_post?.title ?? "삭제되었거나 찾을 수 없는 게시글"
                    : report.target_comment?.body ?? "삭제되었거나 찾을 수 없는 댓글"}
                </p>
                {report.detail ? (
                  <p className="text-sm text-slate-500">{report.detail}</p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </AdminTableCard>
    </div>
  );
}
