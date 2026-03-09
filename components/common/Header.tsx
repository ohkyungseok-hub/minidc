import Link from "next/link";

import { signOut } from "@/app/(auth)/actions";
import { getSessionUser } from "@/lib/auth";

import Nav from "./Nav";
import SearchForm from "./SearchForm";

export default async function Header() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-30 -mx-3 border-b border-[#ccd5e3] bg-white/95 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur sm:-mx-5 lg:-mx-6">
      <div className="border-t-4 border-[#2f5ea9] px-3 py-3 sm:px-5 lg:px-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center justify-between gap-4">
              <Link href="/" className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-md border border-[#244a85] bg-[#2f5ea9] text-sm font-black uppercase tracking-[0.18em] text-white">
                  dc
                </span>
                <div>
                  <p className="text-xl font-black tracking-tight text-slate-950">
                    mini-dc
                  </p>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2f5ea9]">
                    community board
                  </p>
                </div>
              </Link>
              {user ? (
                <div className="flex items-center gap-2 xl:hidden">
                  <div className="rounded-md border border-[#d7e1f0] bg-[#f3f7ff] px-2.5 py-2 text-xs font-semibold text-[#244a85]">
                    {user.nickname}
                  </div>
                  <Link
                    href="/posts/new"
                    className="rounded-md bg-[#2f5ea9] px-3 py-2 text-xs font-semibold text-white"
                  >
                    글쓰기
                  </Link>
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="rounded-md border border-[#c8d1df] bg-white px-3 py-2 text-xs font-semibold text-slate-700"
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
                    className="rounded-md bg-[#2f5ea9] px-3 py-2 text-xs font-semibold text-white"
                  >
                    회원가입
                  </Link>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
              <SearchForm
                action="/boards"
                placeholder="게시판 이름이나 설명 검색"
                className="w-full min-w-0 xl:w-[360px]"
              />
              {user ? (
                <div className="hidden items-center gap-2 xl:flex">
                  <div className="rounded-md border border-[#d7e1f0] bg-[#f3f7ff] px-3 py-2 text-sm font-semibold text-[#244a85]">
                    {user.nickname}
                    {user.role === "admin" ? " · 관리자" : ""}
                  </div>
                  <Link
                    href="/posts/new"
                    className="rounded-md bg-[#2f5ea9] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#244a85]"
                  >
                    글쓰기
                  </Link>
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="rounded-md border border-[#c8d1df] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#9eacc3] hover:text-slate-900"
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
                    className="rounded-md bg-[#2f5ea9] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#244a85]"
                  >
                    회원가입
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-[#d5dce7] bg-[#f8fafc] px-2 pt-2">
            <Nav />
          </div>
        </div>
      </div>
    </header>
  );
}
