export const dynamic = "force-dynamic";
import { Trophy, Users, Swords, TrendingUp } from "lucide-react";
import { PageContent, PageHeader, StatCard, Card, CardHeader } from "@/components/ui/PageShell";
import { getPlatformStats, getAllOrganizers, getPlatformTopScorers } from "@/lib/actions/admin";

const monthlyData = [
  { month: "Oca", matches: 12, teams: 8 },
  { month: "Şub", matches: 24, teams: 16 },
  { month: "Mar", matches: 36, teams: 24 },
  { month: "Nis", matches: 52, teams: 36 },
  { month: "May", matches: 68, teams: 48 },
  { month: "Haz", matches: 88, teams: 64 },
];
const maxMatches = Math.max(...monthlyData.map((d) => d.matches));

export default async function AdminStatsPage() {
  const [stats, organizers, topScorers] = await Promise.all([
    getPlatformStats().catch(() => ({ activeTournaments: 0, totalTeams: 0, todayMatches: 0, pendingOrganizers: 0, completedTournaments: 0, totalPlayers: 0 })),
    getAllOrganizers().catch(() => []),
    getPlatformTopScorers().catch(() => []),
  ]);

  const topOrganizers = [...organizers]
    .sort((a, b) => b._count.organizedTournaments - a._count.organizedTournaments)
    .slice(0, 5);

  return (
    <PageContent>
      <PageHeader title="Platform İstatistikleri" subtitle="Tüm platforma ait veri analizi" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Aktif Turnuva" value={stats.activeTournaments} icon={Trophy} color="blue" />
        <StatCard label="Toplam Takım" value={stats.totalTeams} icon={Users} color="gold" />
        <StatCard label="Tamamlanan" value={stats.completedTournaments} icon={Swords} color="green" />
        <StatCard label="Toplam Oyuncu" value={stats.totalPlayers} icon={TrendingUp} color="purple" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <Card>
            <CardHeader title="Aylık Büyüme" subtitle="Turnuva ve maç sayıları (gösterim amaçlı)" />
            <div className="p-5">
              <div className="flex items-end gap-3 h-48">
                {monthlyData.map((d) => (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end gap-0.5 h-40">
                      <div className="flex-1 bg-[#3B82F6] rounded-t-sm opacity-70" style={{ height: `${(d.matches / maxMatches) * 100}%` }} title={`${d.matches} maç`} />
                      <div className="flex-1 bg-[#F59E0B] rounded-t-sm" style={{ height: `${(d.teams / maxMatches) * 100}%` }} title={`${d.teams} takım`} />
                    </div>
                    <span className="text-[10px] text-[#9CA3AF]">{d.month}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-[#6B7280]"><div className="w-3 h-3 rounded-sm bg-[#3B82F6] opacity-70" /> Maç</div>
                <div className="flex items-center gap-1.5 text-xs text-[#6B7280]"><div className="w-3 h-3 rounded-sm bg-[#F59E0B]" /> Takım</div>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader title="En Aktif Organizatörler" subtitle="Turnuva sayısına göre" />
            <div className="divide-y divide-[#F3F4F6]">
              {topOrganizers.map((org, i) => (
                <div key={org.id} className="flex items-center gap-3 px-4 py-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-[#FEF3C7] text-[#D97706]" : i === 1 ? "bg-[#F3F4F6] text-[#374151]" : i === 2 ? "bg-[#FEF2F2] text-[#DC2626]" : "bg-[#F3F4F6] text-[#9CA3AF]"}`}>{i + 1}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[#111827]">{org.name}</div>
                    <div className="text-xs text-[#9CA3AF]">{org.city ?? "—"}</div>
                  </div>
                  <div className="text-sm font-bold text-[#374151]">{org._count.organizedTournaments}</div>
                </div>
              ))}
              {topOrganizers.length === 0 && <div className="py-6 text-center text-sm text-[#9CA3AF]">Veri yok</div>}
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader title="Platform Golcü Sıralaması" subtitle="Tüm turnuvalar geneli" />
        <div className="p-4">
          {topScorers.length === 0 ? (
            <div className="py-6 text-center text-sm text-[#9CA3AF]">Henüz gol kaydı yok</div>
          ) : (
            <div className="space-y-2">
              {topScorers.map(({ player, goals }, i) => (
                <div key={player.id} className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-lg">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? "bg-[#FEF3C7] text-[#D97706]" : "bg-white border border-[#E5E7EB] text-[#9CA3AF]"}`}>{i + 1}</div>
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-[#111827]">{player.name}</span>
                    <span className="text-xs text-[#9CA3AF] ml-2">{player.team.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 bg-[#F59E0B] rounded-full" style={{ width: `${(goals / (topScorers[0]?.goals ?? 1)) * 80}px` }} />
                    <span className="text-sm font-bold text-[#111827] w-6 text-right">{goals}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </PageContent>
  );
}
