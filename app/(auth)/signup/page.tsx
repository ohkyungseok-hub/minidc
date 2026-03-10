import { redirect } from "next/navigation";
import Link from "next/link";

import { signUp } from "@/app/(auth)/actions";
import SectionTitle from "@/components/common/SectionTitle";
import { getSessionUser } from "@/lib/auth";

type SignupPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
    next?: string;
  }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const user = await getSessionUser();

  if (user) {
    redirect("/");
  }

  const params = await searchParams;
  const next = params.next?.startsWith("/") ? params.next : "/";

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <SectionTitle
        eyebrow="Auth"
        title="회원가입"
        description="회원가입 시 Supabase Auth 계정을 만들고 users 테이블에 nickname을 저장합니다."
      />
      <section className="rounded-[2rem] border border-black/10 bg-white/85 p-8 shadow-sm backdrop-blur">
        {params.error ? (
          <p className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {params.error}
          </p>
        ) : null}
        {params.message ? (
          <p className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {params.message}
          </p>
        ) : null}
        <form action={signUp} className="space-y-5">
          <input type="hidden" name="next" value={next} />
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">닉네임</span>
            <input
              name="nickname"
              type="text"
              required
              placeholder="blackpearls-user"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[var(--primary-strong)]"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">이메일</span>
            <input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[var(--primary-strong)]"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">비밀번호</span>
            <input
              name="password"
              type="password"
              required
              placeholder="8자 이상"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[var(--primary-strong)]"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-2xl bg-[var(--primary)] px-4 py-3 font-semibold text-[var(--primary-ink)]"
          >
            회원가입
          </button>
        </form>
        <p className="mt-5 text-sm text-slate-500">
          이미 계정이 있으면{" "}
          <Link
            href={`/login${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="font-semibold text-[var(--primary-ink)]"
          >
            로그인
          </Link>
          으로 이동하세요.
        </p>
      </section>
    </div>
  );
}
