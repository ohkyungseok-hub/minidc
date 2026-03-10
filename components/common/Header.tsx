import Link from "next/link";

import { signOut } from "@/app/(auth)/actions";
import { getSessionUser } from "@/lib/auth";

import Nav from "./Nav";
import SearchForm from "./SearchForm";

function UserAvatar({ avatarUrl, nickname, size }: { avatarUrl: string | null; nickname: string; size: "sm" | "md" }) {
  const cls = size === "sm" ? "h-5 w-5 text-[9px]" : "h-6 w-6 text-[10px]";

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={avatarUrl} alt={nickname} className={`${cls} rounded-full object-cover`} />
    );
  }

  return (
    <span className={`grid ${cls} place-items-center rounded-full bg-[var(--primary-ink)] font-black text-white`}>
      {nickname[0]?.toUpperCase()}
    </span>
  );
}

export default async function Header() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-30 -mx-3 border-b border-[var(--line)] bg-[rgba(255,255,255,0.92)] shadow-[0_1px_0_rgba(53,81,107,0.06)] backdrop-blur sm:-mx-5 lg:-mx-6">
      <div className="border-t-4 border-[var(--primary)] px-3 py-3 sm:px-5 lg:px-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center justify-between gap-4">
              <Link href="/" className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-md border border-[var(--primary-strong)] bg-[var(--primary)] text-sm font-black uppercase tracking-[0.18em] text-[var(--primary-ink)]">
                  BP
                </span>
                <div>
                  <p className="text-xl font-black tracking-tight text-slate-950">
                    BLACKPEARLS
                  </p>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--primary-ink)]">
                    bless you
                  </p>
                </div>
              </Link>
              {user ? (
                <div className="flex items-center gap-2 xl:hidden">
                  <Link
                    href="/profile"
                    className="flex items-center gap-1.5 rounded-md border border-[var(--primary)] bg-[var(--primary-soft)] px-2 py-1.5 text-xs font-semibold text-[var(--primary-ink)] hover:bg-[var(--primary)]"
                  >
                    <UserAvatar avatarUrl={user.avatar_url} nickname={user.nickname} size="sm" />
                    {user.nickname}
                  </Link>
                  {user.role === "admin" ? (
                    <Link
                      href="/admin"
                      className="rounded-md border border-[var(--accent)] bg-white px-3 py-2 text-xs font-semibold text-[var(--primary-ink)]"
                    >
                      관리자
                    </Link>
                  ) : null}
                  <Link
                    href="/posts/new"
                    className="rounded-md bg-[var(--primary)] px-3 py-2 text-xs font-semibold text-[var(--primary-ink)]"
                  >
                    글쓰기
                  </Link>
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                    >
                      로그아웃
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex items-center gap-2 xl:hidden">
                  <Link
                    href="/login"
                    className="rounded-md border border-[#c8d1df] bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                  >
                    로그인
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-md bg-[var(--primary)] px-3 py-2 text-xs font-semibold text-[var(--primary-ink)]"
                  >
                    회원가입
                  </Link>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
              <SearchForm
                action="/boards"
                placeholder="고백, 위로, 해결책 게시판 검색"
                className="w-full min-w-0 xl:w-[360px]"
              />
              {user ? (
                <div className="hidden items-center gap-2 xl:flex">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 rounded-md border border-[var(--primary)] bg-[var(--primary-soft)] px-3 py-2 text-sm font-semibold text-[var(--primary-ink)] hover:bg-[var(--primary)]"
                  >
                    <UserAvatar avatarUrl={user.avatar_url} nickname={user.nickname} size="md" />
                    {user.nickname}
                    {user.role === "admin" ? " · 관리자" : ""}
                  </Link>
                  {user.role === "admin" ? (
                    <Link
                      href="/admin"
                      className="rounded-md border border-[var(--accent)] bg-white px-4 py-2 text-sm font-semibold text-[var(--primary-ink)] transition hover:border-[var(--accent-strong)] hover:bg-[var(--accent-soft)]"
                    >
                      관리자
                    </Link>
                  ) : null}
                  <Link
                    href="/posts/new"
                    className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-ink)] transition hover:bg-[var(--primary-strong)]"
                  >
                    글쓰기
                  </Link>
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="rounded-md border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--sub-strong)] hover:bg-[var(--sub-soft)] hover:text-slate-900"
                    >
                      로그아웃
                    </button>
                  </form>
                </div>
              ) : (
                <div className="hidden items-center gap-2 xl:flex">
                  <Link
                    href="/login"
                    className="rounded-md border border-[#c8d1df] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#9eacc3] hover:text-slate-900"
                  >
                    로그인
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-ink)] transition hover:bg-[var(--primary-strong)]"
                  >
                    회원가입
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-[var(--line)] bg-[var(--surface-strong)] px-2 pt-2">
            <Nav />
          </div>
        </div>
      </div>
    </header>
  );
}
