"use client";

import { createSupabaseBrowser } from "@/lib/supabase/client";

export type UploadResult = {
  url: string;
  path: string;
};

function randomSuffix() {
  return Math.random().toString(36).slice(2, 8);
}

export async function uploadPostImage(
  file: File,
  userId: string,
): Promise<UploadResult> {
  const supabase = createSupabaseBrowser();

  if (!supabase) {
    throw new Error("Supabase client unavailable");
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${Date.now()}_${randomSuffix()}.${ext}`;

  const { error } = await supabase.storage
    .from("post-images")
    .upload(path, file, { upsert: false });

  if (error) {
    throw new Error(`이미지 업로드 실패: ${error.message}`);
  }

  const { data } = supabase.storage.from("post-images").getPublicUrl(path);

  return { url: data.publicUrl, path };
}

export async function uploadAvatar(
  file: File,
  userId: string,
): Promise<UploadResult> {
  const supabase = createSupabaseBrowser();

  if (!supabase) {
    throw new Error("Supabase client unavailable");
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  // Always overwrite same path so old avatar is replaced
  const path = `${userId}/avatar.${ext}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true });

  if (error) {
    throw new Error(`프로필 사진 업로드 실패: ${error.message}`);
  }

  // Add cache-bust so the browser picks up the new image immediately
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  const url = `${data.publicUrl}?t=${Date.now()}`;

  return { url, path };
}

export async function updateAvatarUrl(
  userId: string,
  url: string,
): Promise<void> {
  const supabase = createSupabaseBrowser();

  if (!supabase) {
    throw new Error("Supabase client unavailable");
  }

  const { error } = await supabase
    .from("users")
    .update({ avatar_url: url } as never)
    .eq("id", userId);

  if (error) {
    throw new Error(`프로필 사진 URL 저장 실패: ${error.message}`);
  }
}
