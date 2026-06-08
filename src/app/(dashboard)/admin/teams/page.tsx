import { Search, Trophy, Users } from "lucide-react";
import { PageContent, PageHeader, Card, TableHeader, StatusBadge } from "@/components/ui/PageShell";

const teams = [
  { id: 1, name: "Aslan FC", captain: "Murat Arslan", city: "İstanbul", players: 12, tournaments: 4, wins: 18, losses: 6, goals: 52, status: "active" },
  { id: 2, name: "Kaplan SK", captain: "Serdar Öz", city: "Ankara", players: 11, tournaments: 3, wins: 14, losses: 8, goals: 41, status: "active" },
  { id: 3, name: "Çınar FC", captain: "Baran Kurt", city: "İstanbul", players: 13, tournaments: 2, wins: 9, losses: 5, goals: 28, status: "active" },
  { id: 4, name: "Rüzgar Spor", captain: "Tolga Ak", city: "İzmir", players: 10, tournaments: 5, wins: 22, losses: 10, goals: 67, status: "active" },
  { id: 5, name: "Ateş FC", captain: "Özgür Can", city: "Bursa", players: 11, tournaments: 1, wins: 5, losses: 4, goals: 19, status: "active" },
  { id: 6, name: "Demir SK", captain: "Emre Yol", city: "Adana", players: 9, tournaments: 2, wins: 7, losses: 9, goals: 22, status: "active" },
];

export default function AdminTeamsPage() {
  return (
    <PageContent>
      <PageHeader title="Tüm Takımlar" subtitle={`${teams.length} takım kayıtlı`} />

      <Card>
        <div className="p-4 border-b border-[#E5E7EB]">
          <div className="relative max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input placeholder="Takım ara..." className="w-full pl-8 pr-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" />
          </div>
        </div>

        <table className="w-full">
          <TableHeader columns={["Takım", "Şehir", "Oyuncu", "Turnuva", "G / M", "Gol", "Durum"]} />
          <tbody className="divide-y divide-[#F3F4F6]">
            {teams.map((t) => (
              <tr key={t.id} className="hover:bg-[#FAFAFA] transition-colors">
                <td className="px-4 py-3">
                  <div className="text-sm font-semibold text-[#111827]">{t.name}</div>
                  <div className="text-xs text-[#9CA3AF]">Kpt: {t.captain}</div>
                </td>
                <td className="px-4 py-3 text-sm text-[#6B7280]">{t.city}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-sm text-[#374151]">
                    <Users size={13} className="text-[#9CA3AF]" /> {t.players}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-sm text-[#374151]">
                    <Trophy size={13} className="text-[#9CA3AF]" /> {t.tournaments}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5 text-sm">
                    <span className="text-[#10B981] font-semibold">{t.wins}G</span>
                    <span className="text-[#9CA3AF]">/</span>
                    <span className="text-[#EF4444] font-semibold">{t.losses}M</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-[#111827]">{t.goals}</td>
                <td className="px-4 py-3">
                  <StatusBadge label="Aktif" variant="green" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </PageContent>
  );
}
