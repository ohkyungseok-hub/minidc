"use server";

import { redirect } from "next/navigation";

import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin-client";

function normalizeNextPath(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "/";

  if (!next.startsWith("/")) {
    return "/";
  }

  return next;
}

function toQueryString(params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);

  return searchParams.toString();
}

function authRedirect(
  path: string,
  params: Record<string, string>,
): never {
  const query = toQueryString(params);

  redirect(query ? `${path}?${query}` : path);
}

export async function signUp(formData: FormData) {
  const nickname = String(formData.get("nickname") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = normalizeNextPath(formData.get("next"));

  if (!nickname || !email || !password) {
    authRedirect("/signup", {
      error: "닉네임, 이메일, 비밀번호를 모두 입력하세요.",
      next,
    });
  }

  if (nickname.length < 2 || nickname.length > 24) {
    authRedirect("/signup", {
      error: "닉네임은 2자 이상 24자 이하여야 합니다.",
      next,
    });
  }

  if (password.length < 6) {
    authRedirect("/signup", {
      error: "비밀번호는 6자 이상이어야 합니다.",
      next,
    });
  }

  const supabase = await createSupabaseServer();

  if (!supabase) {
    authRedirect("/signup", {
      error: "Supabase 환경변수가 설정되지 않았습니다.",
      next,
    });
  }

  const { data: existingNickname } = await supabase
    .from("users")
    .select("id")
    .eq("nickname", nickname)
    .maybeSingle();

  if (existingNickname) {
    authRedirect("/signup", {
      error: "이미 사용 중인 닉네임입니다.",
      next,
    });
  }

  // admin client로 이메일 인증 없이 바로 계정 생성
  const admin = createSupabaseAdmin();
  if (!admin) {
    authRedirect("/signup", {
      error: "서버 설정 오류가 발생했습니다.",
      next,
    });
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nickname },
  });

  if (createError) {
    authRedirect("/signup", {
      error: createError.message,
      next,
    });
  }

  if (!created.user) {
    authRedirect("/signup", {
      error: "회원가입 중 오류가 발생했습니다.",
      next,
    });
  }

  // users 테이블에 nickname 저장 (트리거가 없는 경우 대비)
  await admin.from("users" as never).upsert({
    id: created.user.id,
    nickname,
  } as never, { onConflict: "id", ignoreDuplicates: true });

  // 생성 즉시 로그인
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

  if (signInError) {
    authRedirect("/login", {
      message: "회원가입이 완료되었습니다. 로그인해주세요.",
      next,
    });
  }

  redirect(next);
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = normalizeNextPath(formData.get("next"));

  if (!email || !password) {
    authRedirect("/login", {
      error: "이메일과 비밀번호를 모두 입력하세요.",
      next,
    });
  }

  const supabase = await createSupabaseServer();

  if (!supabase) {
    authRedirect("/login", {
      error: "Supabase 환경변수가 설정되지 않았습니다.",
      next,
    });
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    authRedirect("/login", {
      error: error.message,
      next,
    });
  }

  redirect(next);
}

export async function signOut() {
  const supabase = await createSupabaseServer();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/");
}
