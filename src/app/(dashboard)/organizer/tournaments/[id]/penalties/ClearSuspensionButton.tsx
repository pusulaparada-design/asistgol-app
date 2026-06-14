"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { clearPlayerSuspension } from "@/lib/actions/team";

export function ClearSuspensionButton({ playerId, tournamentId }: { playerId: string; tournamentId: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button
      disabled={pending}
      onClick={() => start(async () => {
        await clearPlayerSuspension(playerId, tournamentId);
        router.refresh();
      })}
      className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#ECFDF5] text-[#059669] hover:bg-[#D1FAE5] disabled:opacity-40 transition-colors"
    >
      {pending ? "..." : "Cezayı Kaldır"}
    </button>
  );
}
