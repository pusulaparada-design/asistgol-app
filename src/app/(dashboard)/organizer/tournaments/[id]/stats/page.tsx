export const dynamic = "force-dynamic";
import { Target, Star, Trophy } from "lucide-react";
import { PageContent, PageHeader, Card, CardHeader, StatCard } from "@/components/ui/PageShell";
import { getTournamentStats, getTopScorers } from "@/lib/actions/match";
import { prisma } from "@/lib/prisma";

export default async function TournamentStatsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [stats, topScorers, tournament] = await Promise.all([
    getTournamentStats(id).catch(() => null),
    getTopScorers(id).catch(() => []),
    prisma.tournament.findUnique({ where: { id }, select: { name: true } }),
  ]);

  const {
    totalGoals = 0,
    avgGoals = 0,
    cleanSheets = 0,
    yellowCards = 0,
    teamStats = [],
    topAssists = [],
    cardStats = [],
  } = stats ?? {};

  return (
    <PageContent>
      <PageHeader title="Turnuva İstatistikleri" subtitle={tournament?.name ?? "—"} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Toplam Gol" value={totalGoals} icon={Target} color="green" />
        <StatCard label="Maç Başı Gol" value={avgGoals} icon={Target} color="gold" />
        <StatCard label="Gol Atsız Maç" value={cleanSheets} icon={Trophy} color="teal" sublabel="clean sheet" />
        <StatCard label="Toplam Sarı Kart" value={yellowCards} icon={Star} color="orange" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Top scorers */}
        <Card>
          <CardHeader title="Golcü Sıralaması" subtitle="Turnuva topçuları" />
          <div className="divide-y divide-[#F3F4F6]">
            {topScorers.length === 0 && <div className="py-6 text-center text-sm text-[#9CA3AF]">Henüz gol yok</div>}
            {topScorers.map(({ player, goals }, i) => (
              <div key={player.id} className="flex items-center gap-3 px-4 py-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? "bg-[#FEF3C7] text-[#D97706]" : i === 1 ? "bg-[#F3F4F6] text-[#374151]" : i === 2 ? "bg-[#FEF2F2] text-[#DC2626]" : "bg-[#F3F4F6] text-[#9CA3AF]"}`}>{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[#111827]">{player.name}</div>
                  <div className="text-xs text-[#9CA3AF]">{player.team.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#111827]">{goals} gol</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top assists */}
        <Card>
          <CardHeader title="Asist Sıralaması" />
          <div className="divide-y divide-[#F3F4F6]">
            {topAssists.length === 0 && <div className="py-6 text-center text-sm text-[#9CA3AF]">Henüz asist yok</div>}
            {topAssists.map(({ rank, player, assists }) => (
              <div key={player.id} className="flex items-center gap-3 px-4 py-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${rank === 1 ? "bg-[#FEF3C7] text-[#D97706]" : "bg-[#F3F4F6] text-[#9CA3AF]"}`}>{rank}</div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-[#111827]">{player.name}</div>
                  <div className="text-xs text-[#9CA3AF]">{player.team.name}</div>
                </div>
                <span className="text-sm font-bold text-[#111827]">{assists}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Card stats */}
        <Card>
          <CardHeader title="Kart İstatistikleri" subtitle="Takım bazında" />
          <div className="divide-y divide-[#F3F4F6]">
            {cardStats.length === 0 && <div className="py-6 text-center text-sm text-[#9CA3AF]">Henüz kart yok</div>}
            {cardStats.map((s) => (
              <div key={s.name} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 text-sm font-medium text-[#111827]">{s.name}</div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-4 bg-[#F59E0B] rounded-sm" />
                    <span className="text-sm font-bold text-[#D97706]">{s.yellow}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-4 bg-[#EF4444] rounded-sm" />
                    <span className="text-sm font-bold text-[#DC2626]">{s.red}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Team stats table */}
      <Card>
        <CardHeader title="Takım Performans Tablosu" />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB]">
                {["Takım", "G", "B", "M", "Attığı", "Yediği", "Averaj", "Clean Sheet"].map((h) => (
                  <th key={h} className="px-4 py-3 text-center text-xs font-semibold text-[#9CA3AF] uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {teamStats.length === 0 && (
                <tr><td colSpan={8} className="py-6 text-center text-sm text-[#9CA3AF]">Henüz oynanan maç yok</td></tr>
              )}
              {teamStats.map((t) => (
                <tr key={t.name} className="hover:bg-[#FAFAFA]">
                  <td className="px-4 py-3 text-sm font-semibold text-[#111827]">{t.name}</td>
                  <td className="px-4 py-3 text-center text-sm text-[#10B981] font-semibold">{t.wins}</td>
                  <td className="px-4 py-3 text-center text-sm text-[#F59E0B] font-semibold">{t.draws}</td>
                  <td className="px-4 py-3 text-center text-sm text-[#EF4444] font-semibold">{t.losses}</td>
                  <td className="px-4 py-3 text-center text-sm text-[#374151]">{t.goals}</td>
                  <td className="px-4 py-3 text-center text-sm text-[#374151]">{t.goalsAgainst}</td>
                  <td className="px-4 py-3 text-center text-sm font-medium text-[#374151]">{t.goals - t.goalsAgainst > 0 ? `+${t.goals - t.goalsAgainst}` : t.goals - t.goalsAgainst}</td>
                  <td className="px-4 py-3 text-center text-sm text-[#374151]">{t.cleanSheets}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageContent>
  );
}
