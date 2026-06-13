"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { markAllAsRead } from "@/lib/actions/notification";

export function MarkAllReadButton() {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={pending}
      onClick={() => start(async () => { await markAllAsRead(); router.refresh(); })}
      className="text-xs font-semibold text-[#6B7280] hover:text-[#111827] transition-colors disabled:opacity-40"
    >
      {pending ? "İşleniyor…" : "Tümünü okundu işaretle"}
    </button>
  );
}
