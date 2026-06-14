"use client";

import { useState } from "react";
import { ProgressBar } from "@/components/ui/PageShell";
import RegisterTournamentModal from "@/components/tournament/RegisterTournamentModal";
import type { getOpenTournaments } from "@/lib/actions/tournament";
import type { getMyTeams } from "@/lib/actions/team";

type Tournament = Awaited<ReturnType<typeof getOpenTournaments>>[0];
type Team = Awaited<ReturnType<typeof getMyTeams>>[0];

export default function OpenTournamentsCard({
  tournaments,
  myTeams,
}: {
  tournaments: Tournament[];
  myTeams: Team[];
}) {
  const [modal, setModal] = useState<Tournament | null>(null);

  return (
    <>
      {tournaments.length === 0 ? (
        <div className="py-8 text-center text-sm text-[#9CA3AF]">Şu an açık turnuva yok</div>
      ) : (
        <div className="divide-y divide-[#F3F4F6]">
          {tournaments.slice(0, 4).map((t) => {
            const approvedCount = t.registrations.length;
            const isFull = approvedCount >= t.maxTeams;
            return (
              <div key={t.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="text-sm font-semibold text-[#111827]">{t.name}</div>
                  {isFull ? (
                    <span className="text-xs bg-[#FEF2F2] text-[#EF4444] px-2 py-0.5 rounded-full font-medium shrink-0">Dolu</span>
                  ) : (
                    <span className="text-xs bg-[#ECFDF5] text-[#059669] px-2 py-0.5 rounded-full font-medium shrink-0">
                      {t.maxTeams - approvedCount} yer
                    </span>
                  )}
                </div>
                <div className="text-xs text-[#9CA3AF] mb-2">{t.organizer.name} · {t.city}</div>
                <ProgressBar value={approvedCount} max={t.maxTeams} color="gold" />
                {!isFull && (
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={() => setModal(t)}
                      className="text-xs font-semibold text-[#F59E0B] hover:text-[#D97706] transition-colors"
                    >
                      Kayıt Ol →
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <RegisterTournamentModal tournament={modal} myTeams={myTeams} onClose={() => setModal(null)} />
      )}
    </>
  );
}
