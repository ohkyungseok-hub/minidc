"use client";

import { useRef, useState } from "react";

import { uploadPostImage } from "@/lib/storage";

type UploadedImage = {
  url: string;
  localPreview: string; // blob URL for newly uploaded, or original URL for existing
};

type ImageUploaderProps = {
  userId: string;
  defaultImages?: string[];
  maxImages?: number;
};

export default function ImageUploader({
  userId,
  defaultImages = [],
  maxImages = 5,
}: ImageUploaderProps) {
  const [images, setImages] = useState<UploadedImage[]>(
    defaultImages.map((url) => ({ url, localPreview: url })),
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const remaining = maxImages - images.length;

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    setError(null);

    try {
      const results = await Promise.all(
        toUpload.map((file) => uploadPostImage(file, userId)),
      );

      setImages((prev) => [
        ...prev,
        ...results.map((result, i) => ({
          url: result.url,
          localPreview: URL.createObjectURL(toUpload[i]),
        })),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드에 실패했습니다.");
    } finally {
      setUploading(false);
      // Reset file input so the same file can be re-selected after removal
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">이미지 첨부</span>
        <span className="text-xs text-slate-400">
          {images.length} / {maxImages}
        </span>
      </div>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((img, i) => (
            <div key={i} className="relative">
              {/* Hidden input carries the URL into the server action via FormData */}
              <input type="hidden" name="images" value={img.url} />
              <div className="h-24 w-24 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.localPreview}
                  alt={`첨부 이미지 ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-slate-700 text-[10px] font-bold text-white hover:bg-rose-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {remaining > 0 && (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-500 transition hover:border-[var(--primary-strong)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary-ink)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
              업로드 중...
            </>
          ) : (
            `+ 이미지 추가 (최대 ${remaining}개 남음)`
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
}
