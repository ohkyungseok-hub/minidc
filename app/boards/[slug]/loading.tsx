import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function Loading() {
  return (
    <div className="rounded-[1.75rem] border border-[var(--line)] bg-white/88 px-6 shadow-[0_18px_50px_rgba(53,81,107,0.08)]">
      <LoadingSpinner
        label="Now Loading"
        message="게시판을 불러오고 있습니다."
      />
    </div>
  );
}
