import { Search, MapPin } from "lucide-react";
import { PageContent, PageHeader, Card, TableHeader, StatusBadge, LiveBadge, ScoreBox } from "@/components/ui/PageShell";

const matches = [
  { id: 1, tournament: "Ramazan Kupası 2026", phase: "Grup A", home: "Aslan FC", away: "Kaplan SK", homeScore: 3, awayScore: 1, date: "2026-06-08", time: "19:00", venue: "Bosphorus Halı Saha", status: "live" },
  { id: 2, tournament: "Yaz Ligi 2026", phase: "4. Hafta", home: "Rüzgar Spor", away: "Çınar FC", homeScore: 2, awayScore: 2, date: "2026-06-08", time: "20:00", venue: "Yıldız Arena", status: "live" },
  { id: 3, tournament: "Ramazan Kupası 2026", phase: "Grup B", home: "Ateş FC", away: "Demir SK", homeScore: null, awayScore: null, date: "2026-06-08", time: "21:00", venue: "Bosphorus Halı Saha", status: "scheduled" },
  { id: 4, tournament: "Gençlik Turnuvası", phase: "Grup A", home: "Fırtına FC", away: "Şimşek SK", homeScore: 1, awayScore: 0, date: "2026-06-07", time: "18:00", venue: "Anadolu Saha", status: "played" },
  { id: 5, tournament: "Yaz Ligi 2026", phase: "3. Hafta", home: "Aslan FC", away: "Rüzgar Spor", homeScore: 0, awayScore: 2, date: "2026-06-06", time: "19:00", venue: "Yıldız Arena", status: "played" },
  { id: 6, tournament: "Ramazan Kupası 2026", phase: "Grup A", home: "Çınar FC", away: "Ateş FC", homeScore: 4, awayScore: 1, date: "2026-06-05", time: "18:00", venue: "Bosphorus Halı Saha", status: "played" },
];

const statusMap = {
  live: { label: "CANLI", variant: "red" as const },
  scheduled: { label: "Planlandı", variant: "blue" as const },
  played: { label: "Oynandı", variant: "gray" as const },
};

export default function AdminMatchesPage() {
  return (
    <PageContent>
      <PageHeader title="Tüm Maçlar" subtitle="Platform genelindeki tüm maçlar" />

      <Card>
        <div className="p-4 border-b border-[#E5E7EB] flex gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input placeholder="Maç ara..." className="w-full pl-8 pr-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" />
          </div>
          <select className="px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none">
            <option>Tüm Turnuvalar</option>
            <option>Ramazan Kupası 2026</option>
            <option>Yaz Ligi 2026</option>
          </select>
        </div>

        <table className="w-full">
          <TableHeader columns={["Turnuva / Aşama", "Ev Sahibi", "Skor", "Misafir", "Tarih / Saat", "Saha", "Durum"]} />
          <tbody className="divide-y divide-[#F3F4F6]">
            {matches.map((m) => (
              <tr key={m.id} className="hover:bg-[#FAFAFA] transition-colors">
                <td className="px-4 py-3">
                  <div className="text-xs font-semibold text-[#374151]">{m.tournament}</div>
                  <div className="text-[10px] text-[#9CA3AF]">{m.phase}</div>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-[#111827]">{m.home}</td>
                <td className="px-4 py-3 text-center">
                  {m.status === "live" ? (
                    <LiveBadge />
                  ) : (
                    <ScoreBox home={m.homeScore} away={m.awayScore} status={m.status} />
                  )}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-[#111827]">{m.away}</td>
                <td className="px-4 py-3">
                  <div className="text-xs text-[#374151]">{m.date}</div>
                  <div className="text-xs text-[#9CA3AF]">{m.time}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                    <MapPin size={11} /> {m.venue}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {m.status === "live"
                    ? <LiveBadge />
                    : <StatusBadge label={statusMap[m.status as keyof typeof statusMap].label} variant={statusMap[m.status as keyof typeof statusMap].variant} />
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </PageContent>
  );
}
