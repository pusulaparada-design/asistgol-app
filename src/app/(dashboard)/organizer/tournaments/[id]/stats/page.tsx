import { Target, Star, Trophy } from "lucide-react";
import { PageContent, PageHeader, Card, CardHeader, StatCard } from "@/components/ui/PageShell";

const topScorers = [
  { rank: 1, name: "Emre Demir", team: "Aslan FC", goals: 8, assists: 3 },
  { rank: 2, name: "Tolga Ak", team: "Rüzgar Spor", goals: 7, assists: 2 },
  { rank: 3, name: "Baran Kurt", team: "Çınar FC", goals: 5, assists: 4 },
  { rank: 4, name: "Serdar Öz", team: "Kaplan SK", goals: 4, assists: 1 },
  { rank: 5, name: "Özgür Can", team: "Ateş FC", goals: 4, assists: 2 },
  { rank: 6, name: "Ali Güç", team: "Fırtına FC", goals: 3, assists: 3 },
];

const topAssists = [
  { rank: 1, name: "Baran Kurt", team: "Çınar FC", assists: 4 },
  { rank: 2, name: "Emre Demir", team: "Aslan FC", assists: 3 },
  { rank: 3, name: "Ali Güç", team: "Fırtına FC", assists: 3 },
  { rank: 4, name: "Tolga Ak", team: "Rüzgar Spor", assists: 2 },
  { rank: 5, name: "Özgür Can", team: "Ateş FC", assists: 2 },
];

const teamStats = [
  { name: "Rüzgar Spor", goals: 12, goalsAgainst: 3, wins: 4, draws: 0, losses: 0, cleanSheets: 2 },
  { name: "Aslan FC", goals: 10, goalsAgainst: 4, wins: 3, draws: 1, losses: 0, cleanSheets: 1 },
  { name: "Çınar FC", goals: 8, goalsAgainst: 6, wins: 2, draws: 1, losses: 1, cleanSheets: 1 },
  { name: "Demir SK", goals: 7, goalsAgainst: 5, wins: 2, draws: 1, losses: 1, cleanSheets: 0 },
  { name: "Kaplan SK", goals: 5, goalsAgainst: 8, wins: 1, draws: 1, losses: 2, cleanSheets: 0 },
];

const cardStats = [
  { name: "Ateş FC", yellow: 6, red: 1 },
  { name: "Kaplan SK", yellow: 5, red: 0 },
  { name: "Fırtına FC", yellow: 4, red: 1 },
  { name: "Demir SK", yellow: 3, red: 0 },
  { name: "Çınar FC", yellow: 2, red: 0 },
  { name: "Aslan FC", yellow: 1, red: 0 },
];

export default function TournamentStatsPage({ params }: { params: { id: string } }) {
  return (
    <PageContent>
      <PageHeader title="Turnuva İstatistikleri" subtitle="Ramazan Kupası 2026" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Toplam Gol" value={52} icon={Target} color="green" sublabel="18 maçta" />
        <StatCard label="Maç Başı Gol" value="2.9" icon={Target} color="gold" />
        <StatCard label="Gol Atsız Maç" value={4} icon={Trophy} color="teal" sublabel="clean sheet" />
        <StatCard label="Toplam Sarı Kart" value={21} icon={Star} color="orange" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Top scorers */}
        <Card>
          <CardHeader title="Golcü Sıralaması" subtitle="Turnuva topçuları" />
          <div className="divide-y divide-[#F3F4F6]">
            {topScorers.map((s) => (
              <div key={s.name} className="flex items-center gap-3 px-4 py-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  s.rank === 1 ? "bg-[#FEF3C7] text-[#D97706]" : s.rank === 2 ? "bg-[#F3F4F6] text-[#374151]" : s.rank === 3 ? "bg-[#FEF2F2] text-[#DC2626]" : "bg-[#F3F4F6] text-[#9CA3AF]"
                }`}>{s.rank}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[#111827]">{s.name}</div>
                  <div className="text-xs text-[#9CA3AF]">{s.team}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#111827]">{s.goals} gol</div>
                  <div className="text-xs text-[#9CA3AF]">{s.assists} asist</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top assists */}
        <Card>
          <CardHeader title="Asist Sıralaması" />
          <div className="divide-y divide-[#F3F4F6]">
            {topAssists.map((s) => (
              <div key={s.name} className="flex items-center gap-3 px-4 py-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${s.rank === 1 ? "bg-[#FEF3C7] text-[#D97706]" : "bg-[#F3F4F6] text-[#9CA3AF]"}`}>{s.rank}</div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-[#111827]">{s.name}</div>
                  <div className="text-xs text-[#9CA3AF]">{s.team}</div>
                </div>
                <span className="text-sm font-bold text-[#111827]">{s.assists}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Card stats */}
        <Card>
          <CardHeader title="Kart İstatistikleri" subtitle="Takım bazında" />
          <div className="divide-y divide-[#F3F4F6]">
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
