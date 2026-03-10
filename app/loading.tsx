import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function Loading() {
  return (
    <div className="rounded-[1.75rem] border border-[var(--line)] bg-white/88 px-6 shadow-[0_18px_50px_rgba(53,81,107,0.08)]">
      <LoadingSpinner
        label="Now Loading"
        message="조금만 기다리면 새로운 이야기가 열립니다."
      />
    </div>
  );
}
