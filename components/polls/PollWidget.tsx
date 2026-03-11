"use client";

import { useEffect, useState } from "react";

type PollOption = {
  id: string;
  label: string;
  voteCount: number;
  percent: number;
};

type Poll = {
  id: string;
  question: string;
  totalVotes: number;
  options: PollOption[];
};

function getVoterKey(): string {
  const storageKey = "bp_voter_key";
  let key = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;

  if (!key) {
    key = crypto.randomUUID();
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, key);
    }
  }

  return key;
}

function getVotedPolls(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem("bp_voted_polls") ?? "{}");
  } catch {
    return {};
  }
}

function setVotedPoll(pollId: string, optionId: string) {
  const voted = getVotedPolls();
  voted[pollId] = optionId;
  localStorage.setItem("bp_voted_polls", JSON.stringify(voted));
}

function clearVotedPoll(pollId: string) {
  const voted = getVotedPolls();
  delete voted[pollId];
  localStorage.setItem("bp_voted_polls", JSON.stringify(voted));
}

export default function PollWidget() {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [votedOptionId, setVotedOptionId] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [isRevoting, setIsRevoting] = useState(false);

  useEffect(() => {
    fetch("/api/polls")
      .then((r) => r.json())
      .then((data: { ok: boolean; poll: Poll | null }) => {
        if (data.ok && data.poll) {
          setPoll(data.poll);
          const voted = getVotedPolls();
          if (voted[data.poll.id]) {
            setVotedOptionId(voted[data.poll.id]);
          }
        }
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const submitVote = async (optionId: string, isChange: boolean) => {
    if (!poll || isPending) return;

    setIsPending(true);

    try {
      const voterKey = getVoterKey();
      const response = await fetch("/api/polls/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId: poll.id, optionId, voterKey, isChange }),
      });

      const data = (await response.json()) as {
        ok: boolean;
        alreadyVoted?: boolean;
        totalVotes?: number;
        options?: { id: string; voteCount: number; percent: number }[];
      };

      if (data.ok && data.options) {
        setVotedOptionId(optionId);
        setVotedPoll(poll.id, optionId);
        setIsRevoting(false);
        setShowDone(true);
        setPoll((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            totalVotes: data.totalVotes ?? prev.totalVotes,
            options: prev.options.map((o) => {
              const updated = data.options!.find((u) => u.id === o.id);
              return updated ? { ...o, voteCount: updated.voteCount, percent: updated.percent } : o;
            }),
          };
        });
      }
    } catch {
      // silent fail
    } finally {
      setIsPending(false);
    }
  };

  const handleVote = (optionId: string) => {
    if (votedOptionId && !isRevoting) return;
    submitVote(optionId, isRevoting);
  };

  const handleRevote = () => {
    if (!poll) return;
    clearVotedPoll(poll.id);
    setShowDone(false);
    setIsRevoting(true);
    setVotedOptionId(null);
  };

  if (loading || !poll) return null;

  const hasVoted = Boolean(votedOptionId) && !isRevoting;

  return (
    <section className="rounded-md border border-[var(--line)] bg-white p-5 space-y-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">익명 투표</p>
        <p className="mt-1 text-base font-bold text-slate-900">{poll.question}</p>
      </div>

      {showDone && !isRevoting && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-700">
          ✓ 투표 참여가 완료되었습니다
        </div>
      )}

      <ul className="space-y-2">
        {poll.options.map((option) => {
          const isSelected = votedOptionId === option.id;

          return (
            <li key={option.id}>
              {hasVoted ? (
                <div
                  className={`relative overflow-hidden rounded-xl border px-4 py-2.5 ${
                    isSelected
                      ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  {/* fill bar */}
                  <div
                    className={`absolute inset-y-0 left-0 transition-all duration-700 ease-out ${
                      isSelected ? "bg-[var(--primary)]/20" : "bg-slate-200/60"
                    }`}
                    style={{ width: `${option.percent}%` }}
                  />
                  {/* content */}
                  <div className="relative flex items-center justify-between gap-2">
                    <span className={`text-sm font-semibold ${isSelected ? "text-[var(--primary-ink)]" : "text-slate-700"}`}>
                      {isSelected && "✓ "}{option.label}
                    </span>
                    <span className={`shrink-0 text-sm font-bold tabular-nums ${isSelected ? "text-[var(--primary-ink)]" : "text-slate-500"}`}>
                      {option.percent}%
                    </span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleVote(option.id)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:border-[var(--primary)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary-ink)] disabled:opacity-60"
                >
                  {option.label}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">총 {poll.totalVotes.toLocaleString()}명 참여 · 익명 투표</p>
        {hasVoted && (
          <button
            type="button"
            onClick={handleRevote}
            className="text-xs font-semibold text-slate-400 underline underline-offset-2 hover:text-slate-600"
          >
            재투표
          </button>
        )}
      </div>
    </section>
  );
}
