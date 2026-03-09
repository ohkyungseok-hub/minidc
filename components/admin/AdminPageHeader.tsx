import SectionTitle from "@/components/common/SectionTitle";

type AdminPageHeaderProps = {
  title: string;
  description: string;
  error?: string;
  message?: string;
};

export default function AdminPageHeader({
  title,
  description,
  error,
  message,
}: AdminPageHeaderProps) {
  return (
    <div className="space-y-4">
      <SectionTitle
        eyebrow="Admin"
        title={title}
        description={description}
      />
      {error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}
    </div>
  );
}
