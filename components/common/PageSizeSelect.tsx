"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const PAGE_SIZE_OPTIONS = [20, 50, 100] as const;

type PageSizeSelectProps = {
  value: number;
};

export default function PageSizeSelect({ value }: PageSizeSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pageSize", e.target.value);
    params.set("page", "1"); // 페이지 수 변경 시 1페이지로 리셋
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="page-size-select" className="text-sm text-slate-500 whitespace-nowrap">
        페이지당
      </label>
      <select
        id="page-size-select"
        value={value}
        onChange={handleChange}
        className="h-9 rounded-md border border-[var(--line)] bg-white px-2 text-sm font-semibold text-slate-700 outline-none transition hover:border-[var(--primary)] focus:border-[var(--primary-strong)]"
      >
        {PAGE_SIZE_OPTIONS.map((n) => (
          <option key={n} value={n}>
            {n}개
          </option>
        ))}
      </select>
    </div>
  );
}
