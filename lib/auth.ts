import { cache } from "react";

import { redirect } from "next/navigation";

import { createSupabaseServer } from "@/lib/supabase/server";
import type { UserProfile } from "@/types";

function buildFallbackProfile(authUser: {
  id: string;
  created_at?: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}): UserProfile {
  const nickname =
    typeof authUser.user_metadata?.nickname === "string" &&
    authUser.user_metadata.nickname.trim().length
      ? authUser.user_metadata.nickname.trim()
      : authUser.email?.split("@")[0] ?? "user";

  return {
    id: authUser.id,
    nickname,
    role: "user",
    avatar_url: null,
    created_at: authUser.created_at ?? new Date().toISOString(),
    updated_at: authUser.created_at ?? null,
  };
}

export const getSessionUser = cache(async () => {
  const supabase = await createSupabaseServer();

  if (!supabase) {
    return null;
  }

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return null;
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id, nickname, role, avatar_url, created_at, updated_at")
    .eq("id", authUser.id)
    .maybeSingle();

  if (profile) {
    return profile satisfies UserProfile;
  }

  return buildFallbackProfile(authUser);
});

export function isAdminUser(
  user?: Pick<UserProfile, "role"> | null,
) {
  return user?.role === "admin";
}

export async function requireUser(redirectTo = "/login") {
  const user = await getSessionUser();

  if (!user) {
    redirect(redirectTo);
  }

  return user;
}
