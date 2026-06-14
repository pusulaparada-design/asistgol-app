"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, X } from "lucide-react";
import { ProgressBar } from "@/components/ui/PageShell";
import { registerTeamToTournament } from "@/lib/actions/team";
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
  const [modal, setModal]               = useState<Tournament | null>(null);
  const [step, setStep]                 = useState<"rules" | "success">("rules");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [error, setError]               = useState("");
  const [pending, startTransition]      = useTransition();

  const openModal = (t: Tournament) => {
    const eligible = myTeams.filter(tm =>
      !tm.registrations.some(r => r.tournament.id === t.id)
    );
    setModal(t);
    setStep("rules");
    setError("");
    setSelectedTeamId(eligible[0]?.id ?? "");
  };

  const closeModal = () => { setModal(null); setStep("rules"); setError(""); };

  const handleSubmit = () => {
    if (!modal || !selectedTeamId) return;
    startTransition(async () => {
      try {
        await registerTeamToTournament(selectedTeamId, modal.id);
        setStep("success");
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Bir hata oluştu.");
      }
    });
  };

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
                      onClick={() => openModal(t)}
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

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

            {step === "rules" ? (
              <>
                {/* Başlık */}
                <div className="flex items-start justify-between p-5 border-b border-[#F3F4F6]">
                  <div>
                    <div className="text-base font-bold text-[#111827]">{modal.name}</div>
                    <div className="text-xs text-[#9CA3AF] mt-0.5">{modal.organizer.name} · {modal.city}</div>
                  </div>
                  <button onClick={closeModal} className="text-[#9CA3AF] hover:text-[#374151] transition-colors ml-3 shrink-0 mt-0.5">
                    <X size={18} />
                  </button>
                </div>

                {/* İçerik */}
                <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                  {/* Katılım şartları */}
                  <div>
                    <div className="text-xs font-bold text-[#374151] uppercase tracking-wide mb-2">Katılım Şartları</div>
                    {modal.rules ? (
                      <p className="text-sm text-[#374151] leading-relaxed whitespace-pre-line">{modal.rules}</p>
                    ) : (
                      <p className="text-sm text-[#9CA3AF] italic">Bu turnuva için özel katılım şartı belirtilmemiştir.</p>
                    )}
                  </div>

                  {/* Takım seçimi */}
                  {(() => {
                    if (myTeams.length === 0) {
                      return (
                        <div className="text-sm text-[#EF4444] bg-[#FEF2F2] px-3 py-2.5 rounded-lg">
                          Başvuru yapabilmek için önce bir takım oluşturmanız gerekiyor.
                        </div>
                      );
                    }
                    const eligible = myTeams.filter(tm =>
                      !tm.registrations.some(r => r.tournament.id === modal.id)
                    );
                    if (eligible.length === 0) {
                      return (
                        <div className="text-sm text-[#9CA3AF] bg-[#F4F6F9] px-3 py-2.5 rounded-lg">
                          Tüm takımlarınız bu turnuvaya zaten kayıt yaptırmış.
                        </div>
                      );
                    }
                    return (
                      <div>
                        <div className="text-xs font-bold text-[#374151] uppercase tracking-wide mb-2">Başvuracak Takım</div>
                        {eligible.length === 1 ? (
                          <div className="text-sm font-semibold text-[#111827] bg-[#F4F6F9] px-3 py-2.5 rounded-lg">
                            {eligible[0].name}
                          </div>
                        ) : (
                          <select
                            value={selectedTeamId}
                            onChange={e => setSelectedTeamId(e.target.value)}
                            className="w-full text-sm border border-[#E5E7EB] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] bg-white"
                          >
                            {eligible.map(tm => (
                              <option key={tm.id} value={tm.id}>{tm.name}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    );
                  })()}

                  {error && <p className="text-sm text-[#EF4444]">{error}</p>}
                </div>

                {/* Butonlar */}
                <div className="flex gap-3 px-5 py-4 border-t border-[#F3F4F6]">
                  <button
                    onClick={closeModal}
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
                  onClick={closeModal}
                  className="px-8 py-2.5 text-sm font-semibold rounded-xl bg-[#059669] text-white hover:bg-[#047857] transition-colors"
                >
                  Tamam
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
