import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTableCard from "@/components/admin/AdminTableCard";
import FormStatusButton from "@/components/common/FormStatusButton";
import {
  incrementUserWarningAction,
  toggleUserSuspensionAction,
  updateUserLevelAction,
  updateUserRoleAction,
} from "@/app/admin/actions";
import { getAdminUsers } from "@/lib/admin";
import DeleteUserButton from "@/components/admin/DeleteUserButton";

type AdminUsersPageProps = {
  searchParams: Promise<{
    q?: string;
    error?: string;
    message?: string;
  }>;
};

function buildCurrentPath(query?: string) {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  const serialized = params.toString();

  return serialized ? `/admin/users?${serialized}` : "/admin/users";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const params = await searchParams;
  const users = await getAdminUsers(params.q);
  const currentPath = buildCurrentPath(params.q);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="회원 관리"
        description="닉네임 또는 이메일로 회원을 검색하고 등급, role, 경고, 정지 상태를 조작합니다."
        error={params.error}
        message={params.message}
      />

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
        <form className="grid gap-3 md:grid-cols-[minmax(0,1fr)_140px]">
          <input
            type="text"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="닉네임 또는 이메일 검색"
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#2f5ea9]"
          />
          <button
            type="submit"
            className="rounded-2xl bg-[#2f5ea9] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#244a85]"
          >
            검색
          </button>
        </form>
      </section>

      <AdminTableCard>
        <div className="overflow-x-auto">
          <table className="min-w-[1080px] divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-4 py-3">회원</th>
                <th className="px-4 py-3">role / level</th>
                <th className="px-4 py-3">경고</th>
                <th className="px-4 py-3">정지 상태</th>
                <th className="px-4 py-3">가입일</th>
                <th className="px-4 py-3">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!users.length ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              ) : null}
              {users.map((user) => (
                <tr key={user.id} className="align-top">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-950">{user.nickname}</p>
                    <p className="mt-1 text-slate-500">{user.email ?? "이메일 없음"}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-3">
                      <form action={updateUserRoleAction} className="flex items-center gap-2">
                        <input type="hidden" name="userId" value={user.id} />
                        <input type="hidden" name="redirectTo" value={currentPath} />
                        <select
                          name="role"
                          defaultValue={user.role}
                          className="rounded-xl border border-slate-200 px-3 py-2"
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                        <FormStatusButton
                          label="role 변경"
                          pendingLabel="변경 중..."
                          className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
                        />
                      </form>
                      <form action={updateUserLevelAction} className="flex items-center gap-2">
                        <input type="hidden" name="userId" value={user.id} />
                        <input type="hidden" name="redirectTo" value={currentPath} />
                        <input
                          type="number"
                          name="level"
                          min={1}
                          max={9}
                          defaultValue={user.level}
                          className="w-20 rounded-xl border border-slate-200 px-3 py-2"
                        />
                        <FormStatusButton
                          label="등급 변경"
                          pendingLabel="변경 중..."
                          className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
                        />
                      </form>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-950">{user.warning_count}회</p>
                    <form action={incrementUserWarningAction} className="mt-3">
                      <input type="hidden" name="userId" value={user.id} />
                      <input type="hidden" name="redirectTo" value={currentPath} />
                      <FormStatusButton
                        label="경고 +1"
                        pendingLabel="처리 중..."
                        className="rounded-xl border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-700"
                      />
                    </form>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-950">
                      {user.is_suspended ? "정지 중" : "정상"}
                    </p>
                    <p className="mt-1 text-slate-500">
                      {user.suspended_until ? formatDate(user.suspended_until) : "-"}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-4 py-4">
                    <form action={toggleUserSuspensionAction}>
                      <input type="hidden" name="userId" value={user.id} />
                      <input type="hidden" name="redirectTo" value={currentPath} />
                      <input
                        type="hidden"
                        name="mode"
                        value={user.is_suspended ? "release" : "suspend"}
                      />
                      <FormStatusButton
                        label={user.is_suspended ? "정지 해제" : "7일 정지"}
                        pendingLabel="처리 중..."
                        className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                          user.is_suspended
                            ? "border border-emerald-200 text-emerald-700"
                            : "border border-rose-200 text-rose-700"
                        }`}
                      />
                    </form>
                    <DeleteUserButton
                      userId={user.id}
                      nickname={user.nickname}
                      redirectTo={currentPath}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminTableCard>
    </div>
  );
}
