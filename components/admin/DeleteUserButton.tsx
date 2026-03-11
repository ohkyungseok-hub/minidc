"use client";

import { useTransition } from "react";

import { deleteUserAction } from "@/app/admin/actions";

type DeleteUserButtonProps = {
  userId: string;
  nickname: string;
  redirectTo: string;
};

export default function DeleteUserButton({
  userId,
  nickname,
  redirectTo,
}: DeleteUserButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(`"${nickname}" 회원을 탈퇴 처리하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    const formData = new FormData();
    formData.set("userId", userId);
    formData.set("redirectTo", redirectTo);

    startTransition(() => {
      deleteUserAction(formData);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="mt-2 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? "처리 중..." : "탈퇴 처리"}
    </button>
  );
}
