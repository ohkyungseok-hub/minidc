type LoadingSpinnerProps = {
  label?: string;
  message?: string;
  compact?: boolean;
};

export default function LoadingSpinner({
  label = "Loading",
  message = "이야기를 불러오고 있어요.",
  compact = false,
}: LoadingSpinnerProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? "gap-3 py-8" : "gap-4 py-16 sm:py-24"
      }`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute inset-0 rounded-full border border-[var(--primary)]/50 bg-[var(--primary-soft)]/70" />
        <span className="absolute inset-[6px] rounded-full border-4 border-[var(--sub)] border-t-[var(--primary-strong)] border-r-[var(--accent-strong)] animate-spin" />
        <span className="absolute inset-[18px] rounded-full bg-white shadow-[0_0_0_1px_rgba(53,81,107,0.08)]" />
      </div>
      <div className="space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--primary-ink)]">
          {label}
        </p>
        <p className="text-sm text-slate-500">{message}</p>
      </div>
    </div>
  );
}
