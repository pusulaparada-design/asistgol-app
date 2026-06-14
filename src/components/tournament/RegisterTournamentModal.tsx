"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";
import { registerTeamToTournament } from "@/lib/actions/team";

export type RegisterTournament = {
  id: string;
  name: string;
  city: string;
  organizer: { name: string };
  rules: string | null;
  description: string | null;
};

export type RegisterTeam = {
  id: string;
  name: string;
  registrations: { tournament: { id: string } }[];
};

export default function RegisterTournamentModal({
  tournament,
  myTeams,
  onClose,
}: {
  tournament: RegisterTournament;
  myTeams: RegisterTeam[];
  onClose: () => void;
}) {
  const eligible = myTeams.filter(
    (tm) => !tm.registrations.some((r) => r.tournament.id === tournament.id),
  );

  const router = useRouter();
  const [step, setStep] = useState<"rules" | "success">("rules");
  const [selectedTeamId, setSelectedTeamId] = useState(eligible[0]?.id ?? "");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const hasConditions = !!(tournament.description || tournament.rules);

  // Başarılı başvuru sonrası kapanışta listeyi tazele
  const handleClose = () => {
    if (step === "success") router.refresh();
    onClose();
  };

  const handleSubmit = () => {
    if (!selectedTeamId) return;
    startTransition(async () => {
      try {
        await registerTeamToTournament(selectedTeamId, tournament.id);
        setStep("success");
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Bir hata oluştu.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={handleClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        {step === "rules" ? (
          <>
            {/* Başlık */}
            <div className="flex items-start justify-between p-5 border-b border-[#F3F4F6]">
              <div>
                <div className="text-base font-bold text-[#111827]">{tournament.name}</div>
                <div className="text-xs text-[#9CA3AF] mt-0.5">{tournament.organizer.name} · {tournament.city}</div>
              </div>
              <button onClick={handleClose} className="text-[#9CA3AF] hover:text-[#374151] transition-colors ml-3 shrink-0 mt-0.5">
                <X size={18} />
              </button>
            </div>

            {/* İçerik */}
            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Katılım şartları */}
              <div>
                <div className="text-xs font-bold text-[#374151] uppercase tracking-wide mb-2">Bilgi & Katılım Şartları</div>
                {hasConditions ? (
                  <div className="space-y-3">
                    {tournament.description && (
                      <p className="text-sm text-[#374151] leading-relaxed whitespace-pre-line">{tournament.description}</p>
                    )}
                    {tournament.rules && (
                      <p className="text-sm text-[#374151] leading-relaxed whitespace-pre-line">{tournament.rules}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-[#9CA3AF] italic">Bu turnuva için özel katılım şartı belirtilmemiştir.</p>
                )}
              </div>

              {/* Takım seçimi */}
              {myTeams.length === 0 ? (
                <div className="text-sm text-[#EF4444] bg-[#FEF2F2] px-3 py-2.5 rounded-lg">
                  Başvuru yapabilmek için önce bir takım oluşturmanız gerekiyor.
                </div>
              ) : eligible.length === 0 ? (
                <div className="text-sm text-[#9CA3AF] bg-[#F4F6F9] px-3 py-2.5 rounded-lg">
                  Tüm takımlarınız bu turnuvaya zaten kayıt yaptırmış.
                </div>
              ) : (
                <div>
                  <div className="text-xs font-bold text-[#374151] uppercase tracking-wide mb-2">Başvuracak Takım</div>
                  {eligible.length === 1 ? (
                    <div className="text-sm font-semibold text-[#111827] bg-[#F4F6F9] px-3 py-2.5 rounded-lg">
                      {eligible[0].name}
                    </div>
                  ) : (
                    <select
                      value={selectedTeamId}
                      onChange={(e) => setSelectedTeamId(e.target.value)}
                      className="w-full text-sm border border-[#E5E7EB] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] bg-white"
                    >
                      {eligible.map((tm) => (
                        <option key={tm.id} value={tm.id}>{tm.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {error && <p className="text-sm text-[#EF4444]">{error}</p>}
            </div>

            {/* Butonlar */}
            <div className="flex gap-3 px-5 py-4 border-t border-[#F3F4F6]">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl border border-[#E5E7EB] text-[#374151] hover:bg-[#F4F6F9] transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleSubmit}
                disabled={pending || !selectedTeamId}
                className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl bg-[#0F1F47] text-white hover:bg-[#1a2f5e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pending ? "Gönderiliyor..." : "Başvuru Yap"}
              </button>
            </div>
          </>
        ) : (
          /* Başarı adımı */
          <div className="p-8 text-center">
            <CheckCircle2 size={52} className="text-[#059669] mx-auto mb-4" />
            <div className="text-lg font-bold text-[#111827] mb-2">Başvurunuz Alındı!</div>
            <p className="text-sm text-[#6B7280] leading-relaxed mb-6">
              Başvurunuz turnuva yöneticisine iletildi.<br />
              Yönetici tarafından onaylanınca bildirim alacaksınız.
            </p>
            <button
              onClick={handleClose}
              className="px-8 py-2.5 text-sm font-semibold rounded-xl bg-[#059669] text-white hover:bg-[#047857] transition-colors"
            >
              Tamam
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
