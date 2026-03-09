type SearchFormProps = {
  action: string;
  placeholder: string;
  defaultValue?: string;
  className?: string;
  submitLabel?: string;
};

export default function SearchForm({
  action,
  placeholder,
  defaultValue,
  className,
  submitLabel = "검색",
}: SearchFormProps) {
  return (
    <form action={action} className={className}>
      <div className="flex w-full items-center overflow-hidden rounded-md border border-[#bcc7da] bg-white">
        <input
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="h-10 min-w-0 flex-1 px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
        />
        <button
          type="submit"
          className="h-10 shrink-0 border-l border-[#bcc7da] bg-[#2f5ea9] px-4 text-sm font-semibold text-white transition hover:bg-[#244a85]"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
