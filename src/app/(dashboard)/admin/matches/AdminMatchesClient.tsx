"use client";

import { useState } from "react";
import { Search, Pencil } from "lucide-react";
import { PageContent, PageHeader, Card, ScrollTable, StatusBadge, LiveBadge, ScoreBox } from "@/components/ui/PageShell";
import AdminMatchModal, { type AdminMatch } from "./AdminMatchModal";

const statusMap: Record<string, { label: string; variant: "red" | "blue" | "gray" | "orange" }> = {
  LIVE: { label: "CANLI", variant: "red" },
  SCHEDULED: { label: "Planlandı", variant: "blue" },
  PLAYED: { label: "Oynandı", variant: "gray" },
  POSTPONED: { label: "Ertelendi", variant: "orange" },
};

function fmtDate(d: Date | string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function AdminMatchesClient({ matches }: { matches: AdminMatch[] }) {
  const [search, setSearch] = useState("");
  const [editMatch, setEditMatch] = useState<AdminMatch | null>(null);

  const filtered = matches.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      m.homeTeam.name.toLowerCase().includes(q) ||
      m.awayTeam.name.toLowerCase().includes(q) ||
      m.tournament.name.toLowerCase().includes(q)
    );
  });

  return (
    <PageContent>
      <PageHeader title="Tüm Maçlar" subtitle="Platform genelindeki tüm maçlar" />

      <Card>
        <div className="p-4 border-b border-[#E5E7EB] flex gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Maç ara..."
              className="w-full pl-8 pr-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]"
            />
          </div>
        </div>

        <ScrollTable>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB]">
                {(["Turnuva / Aşama", "Ev Sahibi", "Skor", "Misafir", "Tarih", "Durum", "İşlem"] as const).map((col, i) => (
                  <th key={i} className={`px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap ${
                    col === "Skor" || col === "İşlem" ? "text-center" : col === "Ev Sahibi" ? "text-right" : "text-left"
                  }`}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {filtered.map((m) => {
                const s = statusMap[m.status] ?? { label: m.status, variant: "gray" as const };
                const phase = m.group?.name ?? m.round ?? "—";
                return (
                  <tr key={m.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-xs font-semibold text-[#374151]">{m.tournament.name}</div>
                      <div className="text-[10px] text-[#9CA3AF]">{phase}</div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-[#111827] text-right">{m.homeTeam.name}</td>
                    <td className="px-4 py-3 text-center">
                      {m.status === "LIVE" ? <LiveBadge /> : <ScoreBox home={m.homeScore} away={m.awayScore} status={m.status.toLowerCase()} />}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-[#111827]">{m.awayTeam.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-xs text-[#374151]">{fmtDate(m.date)}</div>
                      {m.time && <div className="text-xs text-[#9CA3AF]">{m.time}</div>}
                    </td>
                    <td className="px-4 py-3">
                      {m.status === "LIVE" ? <LiveBadge /> : <StatusBadge label={s.label} variant={s.variant} />}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setEditMatch(m)}
                        title="Düzenle"
                        className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-10 text-center text-sm text-[#9CA3AF]">
                  {matches.length === 0 ? "Henüz maç yok" : "Maç bulunamadı."}
                </td></tr>
              )}
            </tbody>
          </table>
        </ScrollTable>
      </Card>

      {editMatch && <AdminMatchModal match={editMatch} onClose={() => setEditMatch(null)} />}
    </PageContent>
  );
}
