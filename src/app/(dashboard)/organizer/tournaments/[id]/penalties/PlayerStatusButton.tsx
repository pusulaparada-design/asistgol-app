"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePlayerStatus } from "@/lib/actions/team";

export function PlayerStatusButton({
  playerId,
  currentStatus,
  tournamentId,
}: {
  playerId: string;
  currentStatus: "ACTIVE" | "SUSPENDED";
  tournamentId: string;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const nextStatus = currentStatus === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";

  return (
    <button
      disabled={pending}
      onClick={() =>
        start(async () => {
          await updatePlayerStatus(playerId, nextStatus, tournamentId);
          router.refresh();
        })
      }
      className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 ${
        currentStatus === "SUSPENDED"
          ? "bg-[#ECFDF5] text-[#059669] hover:bg-[#D1FAE5]"
          : "bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2]"
      }`}
    >
      {pending ? "..." : currentStatus === "SUSPENDED" ? "Cezayı Kaldır" : "Askıya Al"}
    </button>
  );
}
