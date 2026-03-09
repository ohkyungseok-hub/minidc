import Link from "next/link";

import {
  deleteAdminPostAction,
  togglePostHiddenAction,
  togglePostNoticeAction,
} from "@/app/admin/actions";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTableCard from "@/components/admin/AdminTableCard";
import FormStatusButton from "@/components/common/FormStatusButton";
import { getAdminBoardOptions, getAdminPosts } from "@/lib/admin";

type AdminPostsPageProps = {
  searchParams: Promise<{
    q?: string;
    boardId?: string;
    notice?: "all" | "notice" | "normal";
    reported?: "all" | "reported" | "clean";
    error?: string;
    message?: string;
  }>;
};

function buildCurrentPath(params: {
  q?: string;
  boardId?: string;
  notice?: string;
  reported?: string;
}) {
  const searchParams = new URLSearchParams();

  if (params.q) {
    searchParams.set("q", params.q);
  }

  if (params.boardId) {
    searchParams.set("boardId", params.boardId);
  }

  if (params.notice && params.notice !== "all") {
    searchParams.set("notice", params.notice);
  }

  if (params.reported && params.reported !== "all") {
    searchParams.set("reported", params.reported);
  }

  const serialized = searchParams.toString();

  return serialized ? `/admin/posts?${serialized}` : "/admin/posts";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export default async function AdminPostsPage({
  searchParams,
}: AdminPostsPageProps) {
  const params = await searchParams;
  const boards = await getAdminBoardOptions();
  const posts = await getAdminPosts({
    query: params.q,
    boardId: params.boardId,
    notice: params.notice ?? "all",
    reported: params.reported ?? "all",
  });
  const currentPath = buildCurrentPath(params);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="게시글 관리"
        description="제목, 내용, 작성자 기준으로 게시글을 검색하고 숨김, 삭제, 공지 상태를 조정합니다."
        error={params.error}
        message={params.message}
      />

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
        <form className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_180px_160px_160px_120px]">
          <input
            type="text"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="제목, 내용, 작성자 검색"
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#2f5ea9]"
          />
          <select
            name="boardId"
            defaultValue={params.boardId ?? ""}
            className="rounded-2xl border border-slate-200 px-4 py-3"
          >
            <option value="">전체 게시판</option>
            {boards.map((board) => (
              <option key={board.id} value={board.id}>
                {board.name}
              </option>
            ))}
          </select>
          <select
            name="notice"
            defaultValue={params.notice ?? "all"}
            className="rounded-2xl border border-slate-200 px-4 py-3"
          >
            <option value="all">공지 전체</option>
            <option value="notice">공지글만</option>
            <option value="normal">일반글만</option>
          </select>
          <select
            name="reported"
            defaultValue={params.reported ?? "all"}
            className="rounded-2xl border border-slate-200 px-4 py-3"
          >
            <option value="all">신고 전체</option>
            <option value="reported">신고 있음</option>
            <option value="clean">신고 없음</option>
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
          <table className="min-w-[1180px] divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-4 py-3">게시글</th>
                <th className="px-4 py-3">게시판</th>
                <th className="px-4 py-3">작성자</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">신고</th>
                <th className="px-4 py-3">작성일</th>
                <th className="px-4 py-3">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!posts.length ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                    조건에 맞는 게시글이 없습니다.
                  </td>
                </tr>
              ) : null}
              {posts.map((post) => (
                <tr key={post.id} className="align-top">
                  <td className="px-4 py-4">
                    <Link href={`/posts/${post.id}`} className="font-semibold text-slate-950 hover:text-[#2f5ea9]">
                      {post.title}
                    </Link>
                    <p className="mt-2 line-clamp-2 text-slate-500">{post.content}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-700">{post.board?.name ?? "-"}</td>
                  <td className="px-4 py-4 text-slate-700">{post.author?.nickname ?? "-"}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {post.is_notice ? (
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          공지
                        </span>
                      ) : null}
                      {post.is_anonymous ? (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          익명
                        </span>
                      ) : null}
                      {post.is_hidden ? (
                        <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
                          숨김
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    {post.pending_report_count ? `${post.pending_report_count}건 대기` : `${post.report_count ?? 0}건`}
                  </td>
                  <td className="px-4 py-4 text-slate-600">{formatDate(post.created_at)}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <form action={togglePostHiddenAction}>
                        <input type="hidden" name="postId" value={post.id} />
                        <input type="hidden" name="redirectTo" value={currentPath} />
                        <input type="hidden" name="mode" value={post.is_hidden ? "show" : "hide"} />
                        <FormStatusButton
                          label={post.is_hidden ? "숨김 해제" : "숨김"}
                          pendingLabel="처리 중..."
                          className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
                        />
                      </form>
                      <form action={togglePostNoticeAction}>
                        <input type="hidden" name="postId" value={post.id} />
                        <input type="hidden" name="redirectTo" value={currentPath} />
                        <input type="hidden" name="mode" value={post.is_notice ? "normal" : "notice"} />
                        <FormStatusButton
                          label={post.is_notice ? "공지 해제" : "공지 지정"}
                          pendingLabel="처리 중..."
                          className="rounded-xl border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-700"
                        />
                      </form>
                      <form action={deleteAdminPostAction}>
                        <input type="hidden" name="postId" value={post.id} />
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
