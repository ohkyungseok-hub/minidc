"use client";

import { useDeferredValue, useState } from "react";
import { useFormStatus } from "react-dom";

import type { Board, PostFormValues } from "@/types";

type PostFormProps = {
  boards: Board[];
  formAction: (formData: FormData) => void | Promise<void>;
  defaultValues?: PostFormValues;
  submitLabel?: string;
  errorMessage?: string;
  canManageNotice?: boolean;
};

const emptyValues: PostFormValues = {
  boardId: "",
  title: "",
  content: "",
  isAnonymous: false,
  isNotice: false,
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "저장 중..." : label}
    </button>
  );
}

export default function PostForm({
  boards,
  formAction,
  defaultValues = emptyValues,
  submitLabel = "저장",
  errorMessage,
  canManageNotice = false,
}: PostFormProps) {
  const [values, setValues] = useState<PostFormValues>(defaultValues);
  const deferredContent = useDeferredValue(values.content);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <form action={formAction} className="space-y-5 rounded-[2rem] border border-black/10 bg-white/90 p-7 shadow-sm">
        {errorMessage ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </p>
        ) : null}
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">게시판</span>
          <select
            name="boardId"
            value={values.boardId}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                boardId: event.target.value,
              }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-amber-600"
          >
            <option value="">게시판을 선택하세요</option>
            {boards.map((board) => (
              <option key={board.id} value={board.id}>
                {board.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">제목</span>
          <input
            name="title"
            value={values.title}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
            placeholder="한 줄로 핵심을 드러내는 제목"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-amber-600"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">본문</span>
          <textarea
            name="content"
            value={values.content}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                content: event.target.value,
              }))
            }
            rows={12}
            placeholder="본문 내용을 입력하세요"
            className="w-full rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-amber-600"
          />
        </label>
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <input
            name="isAnonymous"
            type="checkbox"
            checked={values.isAnonymous}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                isAnonymous: event.target.checked,
              }))
            }
          />
          <span className="text-sm font-semibold text-slate-700">
            익명으로 작성
          </span>
        </label>
        {canManageNotice ? (
          <label className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <input
              name="isNotice"
              type="checkbox"
              checked={values.isNotice}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  isNotice: event.target.checked,
                }))
              }
            />
            <span className="text-sm font-semibold text-amber-900">
              공지글로 등록
            </span>
          </label>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            공지글은 `role = admin` 사용자만 작성할 수 있습니다.
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            로그인한 사용자의 글로 저장되며, 익명 체크 시 목록과 상세 화면에는
            작성자가 `익명`으로 표시됩니다.
          </p>
          <SubmitButton label={submitLabel} />
        </div>
      </form>

      <aside className="rounded-[2rem] border border-black/10 bg-slate-950 p-6 text-white shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">
          Live Preview
        </p>
        <h3 className="mt-4 text-2xl font-bold tracking-tight">
          {values.title || "제목 미리보기"}
        </h3>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-200">
          {deferredContent || "본문을 입력하면 이 영역에 미리보기가 표시됩니다."}
        </p>
        {values.isAnonymous ? (
          <div className="mt-4 inline-flex rounded-full bg-amber-300 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-slate-950">
            Anonymous
          </div>
        ) : null}
        {values.isNotice ? (
          <div className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-amber-700">
            Notice
          </div>
        ) : null}
      </aside>
    </div>
  );
}
