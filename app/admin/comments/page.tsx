import {
  deleteAdminCommentAction,
  toggleCommentHiddenAction,
} from "@/app/admin/actions";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTableCard from "@/components/admin/AdminTableCard";
import FormStatusButton from "@/components/common/FormStatusButton";
import { getAdminComments } from "@/lib/admin";

type AdminCommentsPageProps = {
  searchParams: Promise<{
    q?: string;
    error?: string;
    message?: string;
  }>;
};

function buildCurrentPath(query?: string) {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  const serialized = params.toString();

  return serialized ? `/admin/comments?${serialized}` : "/admin/comments";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export default async function AdminCommentsPage({
  searchParams,
}: AdminCommentsPageProps) {
  const params = await searchParams;
  const comments = await getAdminComments({ query: params.q });
  const currentPath = buildCurrentPath(params.q);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="댓글 관리"
        description="댓글 내용을 검색하고 삭제 또는 숨김 처리합니다."
        error={params.error}
        message={params.message}
      />

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
        <form className="grid gap-3 md:grid-cols-[minmax(0,1fr)_140px]">
          <input
            type="text"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="댓글 내용, 작성자, 글 제목 검색"
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#2f5ea9]"
          />
          <button
            type="submit"
            className="rounded-2xl bg-[#2f5ea9] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#244a85]"
          >
            검색
          </button>
        </form>
      </section>

      <AdminTableCard>
        <div className="overflow-x-auto">
          <table className="min-w-[1080px] divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-4 py-3">댓글</th>
                <th className="px-4 py-3">원문 글</th>
                <th className="px-4 py-3">작성자</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">신고</th>
                <th className="px-4 py-3">작성일</th>
                <th className="px-4 py-3">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!comments.length ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                    조건에 맞는 댓글이 없습니다.
                  </td>
                </tr>
              ) : null}
              {comments.map((comment) => (
                <tr key={comment.id} className="align-top">
                  <td className="px-4 py-4">
                    <p className="line-clamp-2 text-slate-700">{comment.body}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-700">{comment.post?.title ?? "-"}</td>
                  <td className="px-4 py-4 text-slate-700">{comment.author?.nickname ?? "-"}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {comment.is_deleted ? (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          삭제됨
                        </span>
                      ) : null}
                      {comment.is_hidden ? (
                        <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
                          숨김
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    {comment.pending_report_count ? `${comment.pending_report_count}건 대기` : `${comment.report_count ?? 0}건`}
                  </td>
                  <td className="px-4 py-4 text-slate-600">{formatDate(comment.created_at)}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <form action={toggleCommentHiddenAction}>
                        <input type="hidden" name="commentId" value={comment.id} />
                        <input type="hidden" name="redirectTo" value={currentPath} />
                        <input type="hidden" name="mode" value={comment.is_hidden ? "show" : "hide"} />
                        <FormStatusButton
                          label={comment.is_hidden ? "숨김 해제" : "숨김"}
                          pendingLabel="처리 중..."
                          className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
                        />
                      </form>
                      <form action={deleteAdminCommentAction}>
                        <input type="hidden" name="commentId" value={comment.id} />
                        <input type="hidden" name="redirectTo" value={currentPath} />
                        <FormStatusButton
                          label="삭제"
                          pendingLabel="삭제 중..."
                          className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700"
                        />
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminTableCard>
    </div>
  );
}
