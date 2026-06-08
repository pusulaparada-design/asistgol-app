"use client";
import { useState } from "react";
import { MapPin, Edit2, CheckCircle, Plus } from "lucide-react";
import { PageContent, PageHeader, Card, TableHeader, StatusBadge, LiveBadge, ActionButton } from "@/components/ui/PageShell";

const matches = [
  { id: 1, group: "Grup B", home: "Fırtına FC", away: "Şimşek SK", homeScore: null, awayScore: null, date: "2026-06-08", time: "18:00", venue: "Bosphorus S.2", status: "live", homeGoals: [], awayGoals: [] },
  { id: 2, group: "Grup A", home: "Aslan FC", away: "Kaplan SK", homeScore: null, awayScore: null, date: "2026-06-08", time: "19:00", venue: "Bosphorus S.1", status: "scheduled", homeGoals: [], awayGoals: [] },
  { id: 3, group: "Grup A", home: "Kaplan SK", away: "Çınar FC", homeScore: null, awayScore: null, date: "2026-06-08", time: "21:00", venue: "Bosphorus S.1", status: "scheduled", homeGoals: [], awayGoals: [] },
  { id: 4, group: "Grup A", home: "Aslan FC", away: "Çınar FC", homeScore: 1, awayScore: 1, date: "2026-05-28", time: "18:00", venue: "Bosphorus S.1", status: "played", homeGoals: ["Emre (34')"], awayGoals: ["Baran (56')"] },
  { id: 5, group: "Grup A", home: "Aslan FC", away: "Kaplan SK", homeScore: 3, awayScore: 1, date: "2026-05-25", time: "18:00", venue: "Bosphorus S.1", status: "played", homeGoals: ["Emre (12')", "Murat (34')", "Emre (67')"], awayGoals: ["Serdar (45')"] },
];

export default function MatchesPage({ params }: { params: { id: string } }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);

  return (
    <PageContent>
      <PageHeader
        title="Maçlar & Skor Girişi"
        subtitle="Ramazan Kupası 2026"
        actions={<ActionButton variant="secondary" size="sm" icon={Plus}>Maç Ekle</ActionButton>}
      />

      {/* Live matches alert */}
      <div className="flex items-center gap-3 p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl">
        <div className="w-2 h-2 bg-[#EF4444] rounded-full animate-pulse" />
        <span className="text-sm font-medium text-[#DC2626]">1 canlı maç devam ediyor</span>
        <span className="text-sm text-[#9CA3AF]">Fırtına FC - Şimşek SK · Grup B</span>
      </div>

      <Card>
        <table className="w-full">
          <TableHeader columns={["Grup", "Ev Sahibi", "Skor", "Misafir", "Tarih", "Saha", "Durum", "İşlem"]} />
          <tbody className="divide-y divide-[#F3F4F6]">
            {matches.map((m) => (
              <tr key={m.id} className={`hover:bg-[#FAFAFA] transition-colors ${m.status === "live" ? "bg-[#FEF2F2]/20" : ""}`}>
                <td className="px-4 py-3">
                  <span className="text-xs bg-[#F4F6F9] text-[#6B7280] px-2 py-1 rounded-md font-medium">{m.group}</span>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-[#111827]">{m.home}</td>
                <td className="px-4 py-3 text-center">
                  {m.status === "live"
                    ? <LiveBadge />
                    : m.homeScore !== null
                    ? <span className="font-mono font-bold text-sm">{m.homeScore} - {m.awayScore}</span>
                    : <span className="text-xs text-[#D1D5DB]">— vs —</span>
                  }
                </td>
                <td className="px-4 py-3 text-sm font-medium text-[#111827]">{m.away}</td>
                <td className="px-4 py-3">
                  <div className="text-xs text-[#374151]">{m.date}</div>
                  <div className="text-xs text-[#9CA3AF]">{m.time}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                    <MapPin size={11} /> {m.venue}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {m.status === "live"
                    ? <LiveBadge />
                    : <StatusBadge label={m.status === "played" ? "Oynandı" : "Planlandı"} variant={m.status === "played" ? "gray" : "blue"} />
                  }
                </td>
                <td className="px-4 py-3">
                  {(m.status === "scheduled" || m.status === "live") && (
                    <button
                      onClick={() => { setSelectedMatch(m.id); setModalOpen(true); }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#FEF3C7] text-[#D97706] text-xs font-semibold rounded-md hover:bg-[#FDE68A] transition-colors"
                    >
                      <Edit2 size={11} /> Skor Gir
                    </button>
                  )}
                  {m.status === "played" && (
                    <button className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#F4F6F9] text-[#6B7280] text-xs font-medium rounded-md hover:bg-[#E5E7EB] transition-colors">
                      <Edit2 size={11} /> Düzenle
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Score Entry Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold text-[#111827] mb-5">Maç Sonucu Gir</h3>

            <div className="grid grid-cols-3 items-center gap-4 mb-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-[#EFF6FF] rounded-xl mx-auto mb-2 flex items-center justify-center">
                  <span className="text-lg font-bold text-[#3B82F6]">A</span>
                </div>
                <div className="text-sm font-semibold text-[#111827]">Aslan FC</div>
              </div>
              <div className="flex items-center justify-center gap-2">
                <input type="number" min="0" max="99" className="w-12 h-12 text-center text-xl font-bold border-2 border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F59E0B]" defaultValue="0" />
                <span className="text-[#9CA3AF] font-bold">-</span>
                <input type="number" min="0" max="99" className="w-12 h-12 text-center text-xl font-bold border-2 border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#F59E0B]" defaultValue="0" />
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-[#FEF3C7] rounded-xl mx-auto mb-2 flex items-center justify-center">
                  <span className="text-lg font-bold text-[#D97706]">K</span>
                </div>
                <div className="text-sm font-semibold text-[#111827]">Kaplan SK</div>
              </div>
            </div>

            {/* Goalscorers */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-2">Aslan FC Gol Atanlar</label>
                <div className="space-y-1.5">
                  {["", ""].map((_, i) => (
                    <input key={i} placeholder="Oyuncu adı + dakika" className="w-full px-2.5 py-1.5 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F59E0B]" />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-2">Kaplan SK Gol Atanlar</label>
                <div className="space-y-1.5">
                  {["", ""].map((_, i) => (
                    <input key={i} placeholder="Oyuncu adı + dakika" className="w-full px-2.5 py-1.5 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F59E0B]" />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 text-sm font-medium text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F4F6F9] transition-colors">
                İptal
              </button>
              <button onClick={() => setModalOpen(false)} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-[#0F1F47] text-white rounded-lg hover:bg-[#1A2F5A] transition-colors">
                <CheckCircle size={15} /> Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContent>
  );
}
