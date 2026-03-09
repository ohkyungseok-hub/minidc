"use client";

import { useFormStatus } from "react-dom";

type FormStatusButtonProps = {
  className?: string;
  label: string;
  pendingLabel?: string;
};

export default function FormStatusButton({
  className,
  label,
  pendingLabel,
}: FormStatusButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingLabel ?? "처리 중..." : label}
    </button>
  );
}
