"use client";

import { useState, useTransition } from "react";

import { signOut } from "@/app/(auth)/actions";

type LogoutButtonProps = {
  size?: "sm" | "md";
};

export default function LogoutButton({ size = "md" }: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function handleClick() {
    setOpen(true);
  }

  function handleConfirm() {
    startTransition(async () => {
      await signOut();
    });
  }

  const btnClass =
    size === "sm"
      ? "rounded-md border border-[var(--line)] bg-white px-3 py-2 text-xs font-semibold text-slate-700"
      : "rounded-md border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--sub-strong)] hover:bg-[var(--sub-soft)] hover:text-slate-900";

  return (
    <>
      <button type="button" onClick={handleClick} className={btnClass}>
        로그아웃
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* panel */}
          <div className="relative w-full max-w-sm rounded-2xl border border-black/10 bg-white p-6 shadow-xl">
            <h2
              id="logout-dialog-title"
              className="text-base font-bold text-slate-900"
            >
              로그아웃 하시겠어요?
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              현재 세션이 종료됩니다.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                취소
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleConfirm}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
              >
                {isPending ? (
                  <svg
                    className="h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                ) : null}
                로그아웃
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
