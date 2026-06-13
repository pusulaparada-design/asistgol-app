export const dynamic = "force-dynamic";
import { Search, MapPin } from "lucide-react";
import { PageContent, PageHeader, Card, TableHeader, ScrollTable, StatusBadge, LiveBadge, ScoreBox } from "@/components/ui/PageShell";
import { getAllMatchesAdmin } from "@/lib/actions/admin";

const statusMap: Record<string, { label: string; variant: "red" | "blue" | "gray" | "orange" }> = {
  LIVE: { label: "CANLI", variant: "red" },
  SCHEDULED: { label: "Planlandı", variant: "blue" },
  PLAYED: { label: "Oynandı", variant: "gray" },
  POSTPONED: { label: "Ertelendi", variant: "orange" },
};

function fmtDate(d: Date | null) {
  if (!d) return "—";
  return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default async function AdminMatchesPage() {
  const matches = await getAllMatchesAdmin().catch(() => []);

  return (
    <PageContent>
      <PageHeader title="Tüm Maçlar" subtitle="Platform genelindeki tüm maçlar" />

      <Card>
        <div className="p-4 border-b border-[#E5E7EB] flex gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input placeholder="Maç ara..." className="w-full pl-8 pr-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" />
          </div>
        </div>

        <ScrollTable>
        <table className="w-full">
          <TableHeader columns={["Turnuva / Aşama", "Ev Sahibi", "Skor", "Misafir", "Tarih", "Saha", "Durum"]} />
          <tbody className="divide-y divide-[#F3F4F6]">
            {matches.map((m) => {
              const s = statusMap[m.status] ?? { label: m.status, variant: "gray" as const };
              const phase = m.group?.name ?? m.round ?? "—";
              return (
                <tr key={m.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-xs font-semibold text-[#374151]">{m.tournament.name}</div>
                    <div className="text-[10px] text-[#9CA3AF]">{phase}</div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-[#111827]">{m.homeTeam.name}</td>
                  <td className="px-4 py-3 text-center">
                    {m.status === "LIVE" ? (
                      <LiveBadge />
                    ) : (
                      <ScoreBox home={m.homeScore} away={m.awayScore} status={m.status.toLowerCase()} />
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-[#111827]">{m.awayTeam.name}</td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-[#374151]">{fmtDate(m.date)}</div>
                    {m.time && <div className="text-xs text-[#9CA3AF]">{m.time}</div>}
                  </td>
                  <td className="px-4 py-3">
                    {m.venue ? (
                      <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                        <MapPin size={11} /> {m.venue}
                      </div>
                    ) : (
                      <span className="text-xs text-[#D1D5DB]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {m.status === "LIVE" ? <LiveBadge /> : <StatusBadge label={s.label} variant={s.variant} />}
                  </td>
                </tr>
              );
            })}
            {matches.length === 0 && (
              <tr><td colSpan={7} className="py-10 text-center text-sm text-[#9CA3AF]">Henüz maç yok</td></tr>
            )}
          </tbody>
        </table>
        </ScrollTable>
      </Card>
    </PageContent>
  );
}
