"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/auth";
import { createSupabaseServer } from "@/lib/supabase/server";

function encodeMessage(message: string) {
  return encodeURIComponent(message);
}

function buildRedirect(target: string, messageType: "error" | "message", message: string) {
  const separator = target.includes("?") ? "&" : "?";

  return `${target}${separator}${messageType}=${encodeMessage(message)}`;
}

async function getAdminContext(target: string) {
  const admin = await requireAdminUser(`/login?next=${encodeURIComponent(target)}`);
  const supabase = await createSupabaseServer();

  if (!supabase) {
    redirect(buildRedirect(target, "error", "Supabase 환경변수가 설정되지 않았습니다."));
  }

  return { admin, supabase };
}

function revalidateAdminPaths(paths: string[] = []) {
  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/admin/posts");
  revalidatePath("/admin/comments");
  revalidatePath("/admin/reports");
  revalidatePath("/");
  revalidatePath("/boards");
  revalidatePath("/hot");

  paths.forEach((path) => revalidatePath(path));
}

function parseInteger(value: FormDataEntryValue | null, fallback: number) {
  const parsed = Number.parseInt(String(value ?? ""), 10);

  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return parsed;
}

export async function updateUserRoleAction(formData: FormData) {
  const target = String(formData.get("redirectTo") ?? "/admin/users");
  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "");
  const { admin, supabase } = await getAdminContext(target);

  if (!userId || !["user", "admin"].includes(role)) {
    redirect(buildRedirect(target, "error", "잘못된 사용자 role 요청입니다."));
  }

  if (admin.id === userId && role !== "admin") {
    redirect(buildRedirect(target, "error", "자기 자신을 일반 사용자로 내릴 수 없습니다."));
  }

  const { error } = await supabase
    .from("users")
    .update({ role } as never)
    .eq("id", userId);

  if (error) {
    redirect(buildRedirect(target, "error", "회원 role을 변경하지 못했습니다."));
  }

  revalidateAdminPaths();
  redirect(buildRedirect(target, "message", "회원 role을 변경했습니다."));
}

export async function updateUserLevelAction(formData: FormData) {
  const target = String(formData.get("redirectTo") ?? "/admin/users");
  const userId = String(formData.get("userId") ?? "");
  const level = parseInteger(formData.get("level"), 1);
  const { supabase } = await getAdminContext(target);

  if (!userId || level < 1 || level > 9) {
    redirect(buildRedirect(target, "error", "잘못된 등급 값입니다."));
  }

  const { error } = await supabase
    .from("users")
    .update({ level } as never)
    .eq("id", userId);

  if (error) {
    redirect(buildRedirect(target, "error", "회원 등급을 변경하지 못했습니다."));
  }

  revalidateAdminPaths();
  redirect(buildRedirect(target, "message", "회원 등급을 변경했습니다."));
}

export async function incrementUserWarningAction(formData: FormData) {
  const target = String(formData.get("redirectTo") ?? "/admin/users");
  const userId = String(formData.get("userId") ?? "");
  const { admin, supabase } = await getAdminContext(target);

  if (!userId) {
    redirect(buildRedirect(target, "error", "경고를 줄 사용자를 찾지 못했습니다."));
  }

  if (admin.id === userId) {
    redirect(buildRedirect(target, "error", "자기 자신에게 경고를 줄 수 없습니다."));
  }

  const { data, error: fetchError } = await supabase
    .from("users")
    .select("warning_count")
    .eq("id", userId)
    .maybeSingle();

  if (fetchError || !data) {
    redirect(buildRedirect(target, "error", "회원 정보를 찾지 못했습니다."));
  }

  const currentWarningCount = Number(
    ((data as { warning_count?: number } | null)?.warning_count ?? 0),
  );

  const { error } = await supabase
    .from("users")
    .update({ warning_count: currentWarningCount + 1 } as never)
    .eq("id", userId);

  if (error) {
    redirect(buildRedirect(target, "error", "경고를 추가하지 못했습니다."));
  }

  revalidateAdminPaths();
  redirect(buildRedirect(target, "message", "경고를 1회 추가했습니다."));
}

export async function toggleUserSuspensionAction(formData: FormData) {
  const target = String(formData.get("redirectTo") ?? "/admin/users");
  const userId = String(formData.get("userId") ?? "");
  const mode = String(formData.get("mode") ?? "suspend");
  const { admin, supabase } = await getAdminContext(target);

  if (!userId) {
    redirect(buildRedirect(target, "error", "대상 사용자를 찾지 못했습니다."));
  }

  if (admin.id === userId) {
    redirect(buildRedirect(target, "error", "자기 자신을 정지할 수 없습니다."));
  }

  const payload =
    mode === "release"
      ? {
          is_suspended: false,
          suspended_until: null,
        }
      : {
          is_suspended: true,
          suspended_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };

  const { error } = await supabase
    .from("users")
    .update(payload as never)
    .eq("id", userId);

  if (error) {
    redirect(buildRedirect(target, "error", "정지 상태를 변경하지 못했습니다."));
  }

  revalidateAdminPaths();
  redirect(
    buildRedirect(
      target,
      "message",
      mode === "release" ? "회원 정지를 해제했습니다." : "회원을 7일 정지했습니다.",
    ),
  );
}

export async function togglePostHiddenAction(formData: FormData) {
  const target = String(formData.get("redirectTo") ?? "/admin/posts");
  const postId = String(formData.get("postId") ?? "");
  const mode = String(formData.get("mode") ?? "hide");
  const { supabase } = await getAdminContext(target);

  if (!postId) {
    redirect(buildRedirect(target, "error", "게시글을 찾지 못했습니다."));
  }

  const { error } = await supabase
    .from("posts")
    .update({
      is_hidden: mode !== "show",
      hidden_reason: mode === "show" ? null : "관리자 숨김 처리",
    } as never)
    .eq("id", postId);

  if (error) {
    redirect(buildRedirect(target, "error", "게시글 숨김 상태를 변경하지 못했습니다."));
  }

  revalidateAdminPaths();
  redirect(
    buildRedirect(
      target,
      "message",
      mode === "show" ? "게시글 숨김을 해제했습니다." : "게시글을 숨김 처리했습니다.",
    ),
  );
}

export async function togglePostNoticeAction(formData: FormData) {
  const target = String(formData.get("redirectTo") ?? "/admin/posts");
  const postId = String(formData.get("postId") ?? "");
  const mode = String(formData.get("mode") ?? "notice");
  const { supabase } = await getAdminContext(target);

  if (!postId) {
    redirect(buildRedirect(target, "error", "게시글을 찾지 못했습니다."));
  }

  const { error } = await supabase
    .from("posts")
    .update({ is_notice: mode === "notice" } as never)
    .eq("id", postId);

  if (error) {
    redirect(buildRedirect(target, "error", "공지 상태를 변경하지 못했습니다."));
  }

  revalidateAdminPaths();
  redirect(
    buildRedirect(
      target,
      "message",
      mode === "notice" ? "공지글로 지정했습니다." : "공지글 지정을 해제했습니다.",
    ),
  );
}

export async function deleteAdminPostAction(formData: FormData) {
  const target = String(formData.get("redirectTo") ?? "/admin/posts");
  const postId = String(formData.get("postId") ?? "");
  const { supabase } = await getAdminContext(target);

  if (!postId) {
    redirect(buildRedirect(target, "error", "삭제할 게시글을 찾지 못했습니다."));
  }

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId);

  if (error) {
    redirect(buildRedirect(target, "error", "게시글을 삭제하지 못했습니다."));
  }

  revalidateAdminPaths();
  redirect(buildRedirect(target, "message", "게시글을 삭제했습니다."));
}

export async function toggleCommentHiddenAction(formData: FormData) {
  const target = String(formData.get("redirectTo") ?? "/admin/comments");
  const commentId = String(formData.get("commentId") ?? "");
  const mode = String(formData.get("mode") ?? "hide");
  const { supabase } = await getAdminContext(target);

  if (!commentId) {
    redirect(buildRedirect(target, "error", "댓글을 찾지 못했습니다."));
  }

  const { error } = await supabase
    .from("comments")
    .update({
      is_hidden: mode !== "show",
      hidden_reason: mode === "show" ? null : "관리자 숨김 처리",
    } as never)
    .eq("id", commentId);

  if (error) {
    redirect(buildRedirect(target, "error", "댓글 숨김 상태를 변경하지 못했습니다."));
  }

  revalidateAdminPaths();
  redirect(
    buildRedirect(
      target,
      "message",
      mode === "show" ? "댓글 숨김을 해제했습니다." : "댓글을 숨김 처리했습니다.",
    ),
  );
}

export async function deleteAdminCommentAction(formData: FormData) {
  const target = String(formData.get("redirectTo") ?? "/admin/comments");
  const commentId = String(formData.get("commentId") ?? "");
  const { supabase } = await getAdminContext(target);

  if (!commentId) {
    redirect(buildRedirect(target, "error", "삭제할 댓글을 찾지 못했습니다."));
  }

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    redirect(buildRedirect(target, "error", "댓글을 삭제하지 못했습니다."));
  }

  revalidateAdminPaths();
  redirect(buildRedirect(target, "message", "댓글을 삭제했습니다."));
}

export async function updateReportStatusAction(formData: FormData) {
  const target = String(formData.get("redirectTo") ?? "/admin/reports");
  const reportId = String(formData.get("reportId") ?? "");
  const status = String(formData.get("status") ?? "resolved");
  const { admin, supabase } = await getAdminContext(target);

  if (!reportId || !["pending", "resolved", "dismissed"].includes(status)) {
    redirect(buildRedirect(target, "error", "신고 상태 요청이 잘못되었습니다."));
  }

  const { error } = await supabase
    .from("reports")
    .update({
      status,
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
    } as never)
    .eq("id", reportId);

  if (error) {
    redirect(buildRedirect(target, "error", "신고 상태를 변경하지 못했습니다."));
  }

  revalidateAdminPaths();
  redirect(buildRedirect(target, "message", "신고 상태를 변경했습니다."));
}

export async function deleteReportTargetAction(formData: FormData) {
  const target = String(formData.get("redirectTo") ?? "/admin/reports");
  const reportId = String(formData.get("reportId") ?? "");
  const targetType = String(formData.get("targetType") ?? "");
  const targetId = String(formData.get("targetId") ?? "");
  const { admin, supabase } = await getAdminContext(target);

  if (!reportId || !targetId || !["post", "comment"].includes(targetType)) {
    redirect(buildRedirect(target, "error", "신고 대상을 삭제할 수 없습니다."));
  }

  if (targetType === "post") {
    const { error } = await supabase.from("posts").delete().eq("id", targetId);

    if (error) {
      redirect(buildRedirect(target, "error", "신고된 게시글을 삭제하지 못했습니다."));
    }
  } else {
    const { error } = await supabase.from("comments").delete().eq("id", targetId);

    if (error) {
      redirect(buildRedirect(target, "error", "신고된 댓글을 삭제하지 못했습니다."));
    }
  }

  await supabase
    .from("reports")
    .update({
      status: "resolved",
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
    } as never)
    .eq("id", reportId);

  revalidateAdminPaths();
  redirect(buildRedirect(target, "message", "신고 대상을 삭제하고 신고를 처리완료로 변경했습니다."));
}

export async function suspendReportAuthorAction(formData: FormData) {
  const target = String(formData.get("redirectTo") ?? "/admin/reports");
  const reportId = String(formData.get("reportId") ?? "");
  const authorId = String(formData.get("authorId") ?? "");
  const { admin, supabase } = await getAdminContext(target);

  if (!reportId || !authorId) {
    redirect(buildRedirect(target, "error", "정지할 작성자를 찾지 못했습니다."));
  }

  if (admin.id === authorId) {
    redirect(buildRedirect(target, "error", "자기 자신을 정지할 수 없습니다."));
  }

  const { error } = await supabase
    .from("users")
    .update({
      is_suspended: true,
      suspended_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    } as never)
    .eq("id", authorId);

  if (error) {
    redirect(buildRedirect(target, "error", "작성자 정지 처리에 실패했습니다."));
  }

  await supabase
    .from("reports")
    .update({
      status: "resolved",
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
    } as never)
    .eq("id", reportId);

  revalidateAdminPaths();
  redirect(buildRedirect(target, "message", "작성자를 7일 정지하고 신고를 처리완료로 변경했습니다."));
}
