import { Trophy, Users, Swords, TrendingUp } from "lucide-react";
import { PageContent, PageHeader, StatCard, Card, CardHeader } from "@/components/ui/PageShell";

const monthlyData = [
  { month: "Oca", tournaments: 3, teams: 24, matches: 48 },
  { month: "Şub", tournaments: 4, teams: 32, matches: 64 },
  { month: "Mar", tournaments: 5, teams: 40, matches: 80 },
  { month: "Nis", tournaments: 7, teams: 56, matches: 112 },
  { month: "May", tournaments: 9, teams: 72, matches: 144 },
  { month: "Haz", tournaments: 12, teams: 96, matches: 192 },
];

const topOrganizers = [
  { name: "Bosphorus Arena", tournaments: 8, teams: 64, city: "İstanbul" },
  { name: "Yıldız Spor", tournaments: 5, teams: 40, city: "Ankara" },
  { name: "Arena Spor", tournaments: 4, teams: 32, city: "İstanbul" },
  { name: "Anadolu SK", tournaments: 3, teams: 24, city: "Ankara" },
  { name: "Ege FC", tournaments: 2, teams: 16, city: "İzmir" },
];

const topScorers = [
  { name: "Emre Demir", team: "Aslan FC", goals: 14 },
  { name: "Burak Şahin", team: "Rüzgar Spor", goals: 12 },
  { name: "Serkan Yıldız", team: "Çınar FC", goals: 10 },
  { name: "Mert Kaya", team: "Kaplan SK", goals: 9 },
  { name: "Arda Güler", team: "Ateş FC", goals: 8 },
];

const maxMatches = Math.max(...monthlyData.map(d => d.matches));

export default function AdminStatsPage() {
  return (
    <PageContent>
      <PageHeader title="Platform İstatistikleri" subtitle="Tüm platforma ait veri analizi" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Toplam Turnuva" value={47} icon={Trophy} color="blue" trend="up" trendLabel="+12 bu yıl" />
        <StatCard label="Toplam Takım" value={148} icon={Users} color="gold" trend="up" trendLabel="+48 bu yıl" />
        <StatCard label="Toplam Maç" value={640} icon={Swords} color="green" trend="up" trendLabel="+192 bu yıl" />
        <StatCard label="Toplam Oyuncu" value="1.842" icon={TrendingUp} color="purple" trend="up" trendLabel="+384 bu yıl" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Monthly chart */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader title="Aylık Büyüme" subtitle="Turnuva ve maç sayıları" />
            <div className="p-5">
              <div className="flex items-end gap-3 h-48">
                {monthlyData.map((d) => (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end gap-0.5 h-40">
                      {/* Matches bar */}
                      <div
                        className="flex-1 bg-[#3B82F6] rounded-t-sm opacity-70"
                        style={{ height: `${(d.matches / maxMatches) * 100}%` }}
                        title={`${d.matches} maç`}
                      />
                      {/* Teams bar */}
                      <div
                        className="flex-1 bg-[#F59E0B] rounded-t-sm"
                        style={{ height: `${(d.teams / maxMatches) * 100}%` }}
                        title={`${d.teams} takım`}
                      />
                    </div>
                    <span className="text-[10px] text-[#9CA3AF]">{d.month}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                  <div className="w-3 h-3 rounded-sm bg-[#3B82F6] opacity-70" /> Maç
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                  <div className="w-3 h-3 rounded-sm bg-[#F59E0B]" /> Takım
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Top organizers */}
        <div>
          <Card>
            <CardHeader title="En Aktif Organizatörler" subtitle="Turnuva sayısına göre" />
            <div className="divide-y divide-[#F3F4F6]">
              {topOrganizers.map((org, i) => (
                <div key={org.name} className="flex items-center gap-3 px-4 py-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? "bg-[#FEF3C7] text-[#D97706]" : i === 1 ? "bg-[#F3F4F6] text-[#374151]" : i === 2 ? "bg-[#FEF2F2] text-[#DC2626]" : "bg-[#F3F4F6] text-[#9CA3AF]"
                  }`}>{i + 1}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[#111827]">{org.name}</div>
                    <div className="text-xs text-[#9CA3AF]">{org.city} · {org.teams} takım</div>
                  </div>
                  <div className="text-sm font-bold text-[#374151]">{org.tournaments}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Top scorers */}
      <Card>
        <CardHeader title="Platform Golcü Sıralaması" subtitle="Tüm turnuvalar geneli" />
        <div className="p-4">
          <div className="space-y-2">
            {topScorers.map((s, i) => (
              <div key={s.name} className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-lg">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  i === 0 ? "bg-[#FEF3C7] text-[#D97706]" : "bg-white border border-[#E5E7EB] text-[#9CA3AF]"
                }`}>{i + 1}</div>
                <div className="flex-1">
                  <span className="text-sm font-semibold text-[#111827]">{s.name}</span>
                  <span className="text-xs text-[#9CA3AF] ml-2">{s.team}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 bg-[#F59E0B] rounded-full" style={{ width: `${(s.goals / topScorers[0].goals) * 80}px` }} />
                  <span className="text-sm font-bold text-[#111827] w-6 text-right">{s.goals}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </PageContent>
  );
}
