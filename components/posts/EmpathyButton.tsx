"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type EmpathyButtonProps = {
  postId: string;
  initialCount: number;
  initialHasEmpathized: boolean;
  isAuthenticated: boolean;
  loginHref?: string;
};

export default function EmpathyButton({
  postId,
  initialCount,
  initialHasEmpathized,
  isAuthenticated,
  loginHref = "/login",
}: EmpathyButtonProps) {
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [hasEmpathized, setHasEmpathized] = useState(initialHasEmpathized);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (!isAuthenticated) {
      setMessage("로그인 후 공감할 수 있습니다.");
      return;
    }

    startTransition(async () => {
      setMessage(null);

      const response = await fetch("/api/empathy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });

      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        message?: string;
        empathyCount?: number;
        hasEmpathized?: boolean;
      } | null;

      if (!response.ok) {
        setMessage(payload?.message ?? "공감 처리 실패");
        return;
      }

      setCount(payload?.empathyCount ?? count);
      setHasEmpathized(payload?.hasEmpathized ?? !hasEmpathized);
      router.refresh();
    });
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={isPending}
        onClick={handleClick}
        className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
          hasEmpathized
            ? "border-rose-300 bg-rose-50 text-rose-600"
            : "border-slate-200 bg-white text-slate-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
        }`}
      >
        <span className="text-base leading-none">{hasEmpathized ? "❤️" : "🤍"}</span>
        <span>공감 {count}</span>
      </button>
      {message ? (
        <div className="space-y-1">
          <p className="text-xs text-rose-600">{message}</p>
          {!isAuthenticated ? (
            <Link
              href={loginHref}
              className="text-xs font-semibold text-[var(--primary-ink)] underline underline-offset-2"
            >
              로그인하러 가기
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
