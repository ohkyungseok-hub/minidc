import { redirect } from "next/navigation";

import AvatarUploader from "@/components/common/AvatarUploader";
import SectionTitle from "@/components/common/SectionTitle";
import { requireUser } from "@/lib/auth";

const LEVEL_NAMES: Record<number, string> = {
  1: "새싹회원",
  2: "일반회원",
  3: "인증회원",
  4: "우수회원",
  9: "관리자",
};

export default async function ProfilePage() {
  const user = await requireUser("/login?next=/profile");

  if (!user) {
    redirect("/login?next=/profile");
  }

  const levelName = LEVEL_NAMES[user.level] ?? `Lv.${user.level}`;
  const joinedAt = new Date(user.created_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <SectionTitle
        eyebrow="My Page"
        title="내 프로필"
        description="프로필 사진을 변경하고 활동 정보를 확인하세요."
      />

      <section className="space-y-6 rounded-[2rem] border border-black/10 bg-white/90 p-8 shadow-sm">
        <AvatarUploader
          userId={user.id}
          nickname={user.nickname}
          currentAvatarUrl={user.avatar_url}
        />

        <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-6">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              등급
            </p>
            <p className="mt-1 text-lg font-black text-slate-900">{levelName}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              역할
            </p>
            <p className="mt-1 text-lg font-black text-slate-900">
              {user.role === "admin" ? "관리자" : "일반"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              경고 횟수
            </p>
            <p className="mt-1 text-lg font-black text-slate-900">
              {user.warning_count}회
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              가입일
            </p>
            <p className="mt-1 text-sm font-bold text-slate-900">{joinedAt}</p>
          </div>
        </div>

        {user.is_suspended && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            이 계정은 현재 정지 상태입니다.
            {user.suspended_until
              ? ` 해제 예정: ${new Date(user.suspended_until).toLocaleDateString("ko-KR")}`
              : " (기간 미정)"}
          </div>
        )}
      </section>
    </div>
  );
}
