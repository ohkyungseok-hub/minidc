import type { ReactNode } from "react";

type AdminTableCardProps = {
  children: ReactNode;
};

export default function AdminTableCard({ children }: AdminTableCardProps) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
      {children}
    </section>
  );
}
