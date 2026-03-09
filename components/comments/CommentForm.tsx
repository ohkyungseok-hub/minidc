import Link from "next/link";

import { createCommentAction } from "@/app/comments/actions";
import FormStatusButton from "@/components/common/FormStatusButton";

type CommentFormProps = {
  postId: string;
  currentUserId?: string;
  errorMessage?: string;
};

export default function CommentForm({
  postId,
  currentUserId,
  errorMessage,
}: CommentFormProps) {
  if (!currentUserId) {
    return (
      <section className="rounded-[2rem] border border-black/10 bg-white/90 p-6 shadow-sm">
        <h2 className="text-2xl font-black tracking-tight text-slate-950">
          댓글 작성
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          댓글을 작성하려면 로그인해야 합니다.
        </p>
        <Link
          href={`/login?next=${encodeURIComponent(`/posts/${postId}`)}`}
          className="mt-4 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
        >
          로그인하고 댓글 쓰기
        </Link>
      </section>
    );
  }

  return (
    <section id="comment-form" className="rounded-[2rem] border border-black/10 bg-white/90 p-6 shadow-sm">
      <h2 className="text-2xl font-black tracking-tight text-slate-950">
        댓글 작성
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        작성한 댓글은 상세 페이지 하단 목록에 바로 반영됩니다.
      </p>
      <form action={createCommentAction.bind(null, postId)} className="mt-4 space-y-4">
        {errorMessage ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </p>
        ) : null}
        <textarea
          name="body"
          rows={5}
          placeholder="댓글을 입력하세요"
          className="w-full rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-amber-600"
        />
        <div className="flex justify-end">
          <FormStatusButton
            label="댓글 등록"
            pendingLabel="등록 중..."
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
      </form>
    </section>
  );
}
