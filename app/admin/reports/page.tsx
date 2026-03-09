import {
  deleteReportTargetAction,
  suspendReportAuthorAction,
  updateReportStatusAction,
} from "@/app/admin/actions";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTableCard from "@/components/admin/AdminTableCard";
import FormStatusButton from "@/components/common/FormStatusButton";
import { getAdminReports } from "@/lib/admin";

type AdminReportsPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: "all" | "pending" | "resolved" | "dismissed";
    targetType?: "all" | "post" | "comment";
    error?: string;
    message?: string;
  }>;
};

function buildCurrentPath(params: {
  q?: string;
  status?: string;
  targetType?: string;
}) {
  const searchParams = new URLSearchParams();

  if (params.q) {
    searchParams.set("q", params.q);
  }

  if (params.status && params.status !== "all") {
    searchParams.set("status", params.status);
  }

  if (params.targetType && params.targetType !== "all") {
    searchParams.set("targetType", params.targetType);
  }

  const serialized = searchParams.toString();

  return serialized ? `/admin/reports?${serialized}` : "/admin/reports";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function AdminReportsPage({
  searchParams,
}: AdminReportsPageProps) {
  const params = await searchParams;
  const reports = await getAdminReports({
    query: params.q,
    status: params.status ?? "all",
    targetType: params.targetType ?? "all",
  });
  const currentPath = buildCurrentPath(params);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="신고 관리"
        description="신고 사유를 보고 처리완료, 대상 삭제, 작성자 정지를 처리합니다."
        error={params.error}
        message={params.message}
      />

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
        <form className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_180px_180px_120px]">
          <input
            type="text"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="사유, 상세 내용, 신고자, 대상 내용 검색"
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#2f5ea9]"
          />
          <select
            name="status"
            defaultValue={params.status ?? "all"}
            className="rounded-2xl border border-slate-200 px-4 py-3"
          >
            <option value="all">상태 전체</option>
            <option value="pending">대기</option>
            <option value="resolved">처리완료</option>
            <option value="dismissed">기각</option>
          </select>
          <select
            name="targetType"
            defaultValue={params.targetType ?? "all"}
            className="rounded-2xl border border-slate-200 px-4 py-3"
          >
            <option value="all">대상 전체</option>
            <option value="post">게시글</option>
            <option value="comment">댓글</option>
          </select>
          <button
            type="submit"
            className="rounded-2xl bg-[#2f5ea9] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#244a85]"
          >
            필터 적용
          </button>
        </form>
      </section>

      <AdminTableCard>
        <div className="overflow-x-auto">
          <table className="min-w-[1240px] divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-4 py-3">신고</th>
                <th className="px-4 py-3">대상</th>
                <th className="px-4 py-3">신고자</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">접수일</th>
                <th className="px-4 py-3">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!reports.length ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                    조건에 맞는 신고가 없습니다.
                  </td>
                </tr>
              ) : null}
              {reports.map((report) => {
                const targetAuthorId =
                  report.target_type === "post"
                    ? report.target_post?.author_id
                    : report.target_comment?.author_id;
                const targetId =
                  report.target_type === "post"
                    ? report.target_post?.id
                    : report.target_comment?.id;

                return (
                  <tr key={report.id} className="align-top">
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {report.target_type === "post" ? "게시글" : "댓글"}
                        </span>
                        <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
                          {report.reason}
                        </span>
                      </div>
                      {report.detail ? (
                        <p className="mt-2 text-slate-600">{report.detail}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {report.target_type === "post"
                        ? report.target_post?.title ?? "삭제되었거나 찾을 수 없는 게시글"
                        : report.target_comment?.body ?? "삭제되었거나 찾을 수 없는 댓글"}
                    </td>
                    <td className="px-4 py-4 text-slate-700">{report.reporter?.nickname ?? "-"}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        report.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : report.status === "resolved"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-700"
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{formatDate(report.created_at)}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <form action={updateReportStatusAction}>
                          <input type="hidden" name="reportId" value={report.id} />
                          <input type="hidden" name="redirectTo" value={currentPath} />
                          <input type="hidden" name="status" value="resolved" />
                          <FormStatusButton
                            label="처리완료"
                            pendingLabel="처리 중..."
                            className="rounded-xl border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700"
                          />
                        </form>
                        <form action={updateReportStatusAction}>
                          <input type="hidden" name="reportId" value={report.id} />
                          <input type="hidden" name="redirectTo" value={currentPath} />
                          <input type="hidden" name="status" value="dismissed" />
                          <FormStatusButton
                            label="기각"
                            pendingLabel="처리 중..."
                            className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
                          />
                        </form>
                        {targetId ? (
                          <form action={deleteReportTargetAction}>
                            <input type="hidden" name="reportId" value={report.id} />
                            <input type="hidden" name="redirectTo" value={currentPath} />
                            <input type="hidden" name="targetType" value={report.target_type} />
                            <input type="hidden" name="targetId" value={targetId} />
                            <FormStatusButton
                              label="대상 삭제"
                              pendingLabel="삭제 중..."
                              className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700"
                            />
                          </form>
                        ) : null}
                        {targetAuthorId ? (
                          <form action={suspendReportAuthorAction}>
                            <input type="hidden" name="reportId" value={report.id} />
                            <input type="hidden" name="redirectTo" value={currentPath} />
                            <input type="hidden" name="authorId" value={targetAuthorId} />
                            <FormStatusButton
                              label="작성자 7일 정지"
                              pendingLabel="처리 중..."
                              className="rounded-xl border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-700"
                            />
                          </form>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </AdminTableCard>
    </div>
  );
}
