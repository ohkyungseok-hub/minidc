"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { VoteDirection } from "@/types";

type VoteButtonsProps = {
  postId: string;
  initialUpCount: number;
  initialDownCount: number;
  initialVote?: -1 | 0 | 1;
  isAuthenticated?: boolean;
  loginHref?: string;
};

export default function VoteButtons({
  postId,
  initialUpCount,
  initialDownCount,
  initialVote = 0,
  isAuthenticated = false,
  loginHref = "/login",
}: VoteButtonsProps) {
  const router = useRouter();
  const [upCount, setUpCount] = useState(initialUpCount);
  const [downCount, setDownCount] = useState(initialDownCount);
  const [currentVote, setCurrentVote] = useState<-1 | 0 | 1>(initialVote);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const score = upCount - downCount;

  const handleVote = (direction: VoteDirection) => {
    if (!isAuthenticated) {
      setMessage("로그인 후 추천/비추천할 수 있습니다.");
      return;
    }

    startTransition(async () => {
      setMessage(null);

      const response = await fetch("/api/votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          direction,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            ok?: boolean;
            message?: string;
            upCount?: number;
            downCount?: number;
            currentVote?: -1 | 0 | 1;
          }
        | null;

      if (!response.ok) {
        setMessage(payload?.message ?? "투표 저장 실패");
        return;
      }

      setUpCount(payload?.upCount ?? initialUpCount);
      setDownCount(payload?.downCount ?? initialDownCount);
      setCurrentVote(payload?.currentVote ?? initialVote);
      router.refresh();
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleVote(1)}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
            currentVote === 1
              ? "border-[var(--primary-strong)] bg-[var(--primary-soft)] text-[var(--primary-ink)]"
              : "border-slate-200 bg-white text-slate-700 hover:border-[var(--primary)] hover:text-[var(--primary-ink)]"
          }`}
        >
          추천 {upCount}
        </button>
        <span className="min-w-12 text-center text-sm font-bold text-slate-950">
          {score}
        </span>
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleVote(-1)}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
            currentVote === -1
              ? "border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]"
              : "border-slate-200 bg-white text-slate-700 hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
          }`}
        >
          비추천 {downCount}
        </button>
      </div>
      {message ? (
        <div className="space-y-2">
          <p className="text-xs text-rose-600">{message}</p>
          {!isAuthenticated ? (
            <Link href={loginHref} className="text-xs font-semibold text-[var(--primary-ink)] underline underline-offset-2">
              로그인하러 가기
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
