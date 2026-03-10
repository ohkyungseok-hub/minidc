"use client";

import { useRef, useState } from "react";

import { updateAvatarUrl, uploadAvatar } from "@/lib/storage";

type AvatarUploaderProps = {
  userId: string;
  nickname: string;
  currentAvatarUrl?: string | null;
};

export default function AvatarUploader({
  userId,
  nickname,
  currentAvatarUrl,
}: AvatarUploaderProps) {
  const [preview, setPreview] = useState<string | null>(
    currentAvatarUrl ?? null,
  );
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await uploadAvatar(file, userId);
      await updateAvatarUrl(userId, result.url);
      setPreview(result.url);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "업로드에 실패했습니다.",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-5">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-[var(--primary)] bg-[var(--primary-soft)] transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
        title="클릭하여 프로필 사진 변경"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt={`${nickname} 프로필 사진`}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-2xl font-black text-[var(--primary-ink)]">
            {nickname[0]?.toUpperCase()}
          </span>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>
        )}
      </button>

      <div className="space-y-1.5">
        <p className="font-semibold text-slate-900">{nickname}</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-sm text-[var(--primary-ink)] underline underline-offset-2 hover:no-underline disabled:cursor-not-allowed disabled:opacity-60"
        >
          프로필 사진 변경
        </button>
        {success && (
          <p className="text-sm font-semibold text-emerald-600">
            저장됐습니다.
          </p>
        )}
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
