import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTableCard from "@/components/admin/AdminTableCard";
import FormStatusButton from "@/components/common/FormStatusButton";
import { createPollAction, togglePollActiveAction, deletePollAction } from "@/app/admin/actions";
import { createSupabaseServer } from "@/lib/supabase/server";
import { requireAdminUser } from "@/lib/auth";

type AdminPollsPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

type PollOption = {
  id: string;
  label: string;
  vote_count: number;
  sort_order: number;
};

type Poll = {
  id: string;
  question: string;
  is_active: boolean;
  created_at: string;
  poll_options: PollOption[];
};

async function getPolls(): Promise<Poll[]> {
  const supabase = await createSupabaseServer();
  if (!supabase) return [];

  const { data } = await supabase
    .from("polls" as never)
    .select("id, question, is_active, created_at, poll_options(id, label, vote_count, sort_order)")
    .order("created_at", { ascending: false });

  return (data as Poll[] | null) ?? [];
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export default async function AdminPollsPage({ searchParams }: AdminPollsPageProps) {
  await requireAdminUser("/login?next=/admin/polls");
  const params = await searchParams;
  const polls = await getPolls();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="투표 관리"
        description="익명 투표를 생성하고 메인 화면에 표시합니다. 활성 투표가 메인 화면에 노출됩니다."
        error={params.error}
        message={params.message}
      />

      {/* 투표 생성 폼 */}
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-bold text-slate-900">새 투표 만들기</h2>
        <form action={createPollAction} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              투표 질문
            </label>
            <input
              type="text"
              name="question"
              required
              placeholder="예: 요즘 가장 힘든 고민은 무엇인가요?"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#2f5ea9]"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-600">
              선택지 (최소 2개, 최대 6개)
            </label>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <input
                key={i}
                type="text"
                name={`option_${i}`}
                placeholder={`선택지 ${i + 1}${i < 2 ? " (필수)" : " (선택)"}`}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#2f5ea9]"
              />
            ))}
          </div>
          <FormStatusButton
            label="투표 생성"
            pendingLabel="생성 중..."
            className="rounded-2xl bg-[#2f5ea9] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#244a85]"
          />
        </form>
      </section>

      {/* 투표 목록 */}
      <AdminTableCard>
        <div className="overflow-x-auto">
          <table className="min-w-[900px] divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-4 py-3">질문</th>
                <th className="px-4 py-3">선택지 / 투표 수</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">생성일</th>
                <th className="px-4 py-3">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!polls.length ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                    생성된 투표가 없습니다.
                  </td>
                </tr>
              ) : null}
              {polls.map((poll) => {
                const sortedOptions = [...poll.poll_options].sort(
                  (a, b) => a.sort_order - b.sort_order,
                );
                const totalVotes = sortedOptions.reduce((s, o) => s + o.vote_count, 0);

                return (
                  <tr key={poll.id} className="align-top">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-950">{poll.question}</p>
                    </td>
                    <td className="px-4 py-4">
                      <ul className="space-y-1 text-xs text-slate-600">
                        {sortedOptions.map((o) => (
                          <li key={o.id} className="flex items-center gap-2">
                            <span className="truncate max-w-[160px]">{o.label}</span>
                            <span className="shrink-0 font-semibold text-slate-800">
                              {o.vote_count}표
                              {totalVotes > 0
                                ? ` (${Math.round((o.vote_count / totalVotes) * 100)}%)`
                                : ""}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-1.5 text-xs text-slate-400">총 {totalVotes}명 참여</p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          poll.is_active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {poll.is_active ? "활성" : "비활성"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{formatDate(poll.created_at)}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2">
                        <form action={togglePollActiveAction}>
                          <input type="hidden" name="pollId" value={poll.id} />
                          <input
                            type="hidden"
                            name="isActive"
                            value={String(poll.is_active)}
                          />
                          <FormStatusButton
                            label={poll.is_active ? "비활성화" : "활성화"}
                            pendingLabel="처리 중..."
                            className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                              poll.is_active
                                ? "border border-slate-200 text-slate-600"
                                : "border border-emerald-200 text-emerald-700"
                            }`}
                          />
                        </form>
                        <form action={deletePollAction}>
                          <input type="hidden" name="pollId" value={poll.id} />
                          <FormStatusButton
                            label="삭제"
                            pendingLabel="삭제 중..."
                            className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600"
                          />
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </AdminTableCard>
    </div>
  );
}
