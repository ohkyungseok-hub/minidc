import { deleteCommentAction } from "@/app/comments/actions";
import FormStatusButton from "@/components/common/FormStatusButton";
import type { Comment } from "@/types";

type CommentListProps = {
  comments: Comment[];
  currentUserId?: string;
};

function formatCommentDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function CommentList({
  comments,
  currentUserId,
}: CommentListProps) {
  return (
    <section id="comments" className="space-y-4">
      <h2 className="text-2xl font-black tracking-tight text-slate-950">
        댓글 {comments.length}
      </h2>
      {!comments.length ? (
        <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/60 p-8 text-sm text-slate-500">
          첫 댓글을 남겨 보세요.
        </div>
      ) : null}
      {comments.map((comment) => {
        const isMasked = comment.is_deleted || comment.is_hidden;
        const canDelete = currentUserId === comment.author_id && !isMasked;

        return (
          <article
            key={comment.id}
            className={`rounded-[1.5rem] border p-5 shadow-sm ${
              isMasked
                ? "border-slate-200 bg-slate-50/90"
                : "border-black/10 bg-white/90"
            }`}
          >
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
              <span>{comment.is_anonymous ? "익명" : (comment.author?.nickname ?? "guest")}</span>
              <span>•</span>
              <span>{formatCommentDate(comment.created_at)}</span>
            </div>
            <p
              className={`mt-3 whitespace-pre-wrap text-sm leading-7 ${
                isMasked ? "italic text-slate-400" : "text-slate-700"
              }`}
            >
              {comment.is_deleted
                ? "삭제된 댓글입니다"
                : comment.is_hidden
                  ? "숨김 처리된 댓글입니다"
                  : comment.body}
            </p>
            {!isMasked && canDelete ? (
              <div className="mt-4 flex justify-end">
                <form
                  action={deleteCommentAction.bind(
                    null,
                    comment.post_id,
                    comment.id,
                  )}
                >
                  <FormStatusButton
                    label="삭제"
                    pendingLabel="삭제 중..."
                    className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </form>
              </div>
            ) : null}
          </article>
        );
      })}
    </section>
  );
}
