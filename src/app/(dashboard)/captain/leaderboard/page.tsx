export const dynamic = "force-dynamic";
import { PageContent, PageHeader, Card, CardHeader } from "@/components/ui/PageShell";
import { getGlobalLeaderboard } from "@/lib/actions/match";

export default async function LeaderboardPage() {
  const { topScorers, fairPlay } = await getGlobalLeaderboard().catch(() => ({ topScorers: [], fairPlay: [] }));

  return (
    <PageContent>
      <PageHeader title="Sıralamalar" subtitle="Golcüler ve fair play sıralaması" />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Top scorers */}
        <Card className="xl:col-span-1">
          <CardHeader title="Golcü Sıralaması" subtitle="Tüm turnuvalar" />
          <div className="divide-y divide-[#F3F4F6]">
            {topScorers.length === 0 && (
              <div className="py-8 text-center text-sm text-[#9CA3AF]">Henüz gol kaydı yok</div>
            )}
            {topScorers.map(({ rank, player, goals }) => (
              <div key={player.id} className="flex items-center gap-3 px-4 py-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${rank === 1 ? "bg-[#FEF3C7] text-[#D97706]" : rank === 2 ? "bg-[#F3F4F6] text-[#374151]" : rank === 3 ? "bg-[#FEF2F2] text-[#DC2626]" : "bg-[#F3F4F6] text-[#9CA3AF]"}`}>{rank}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[#111827]">{player.name}</div>
                  <div className="text-xs text-[#9CA3AF]">{player.team.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#111827]">{goals}</div>
                  <div className="text-[10px] text-[#9CA3AF]">gol</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Fair play */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader title="Fair Play Sıralaması" subtitle="En az kart alan takımlar" />
            {fairPlay.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#9CA3AF]">Henüz kart verisi yok</div>
            ) : (
              <div className="divide-y divide-[#F3F4F6]">
                {fairPlay.map((r) => (
                  <div key={r.rank} className="flex items-center gap-3 px-4 py-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${r.rank === 1 ? "bg-[#ECFDF5] text-[#059669]" : "bg-[#F3F4F6] text-[#9CA3AF]"}`}>{r.rank}</div>
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-sm font-medium text-[#111827]">{r.name}</span>
                      {r.rank === 1 && <span className="text-xs text-[#059669] font-medium">Fair Play Lideri</span>}
                    </div>
                    <div className="flex gap-3 items-center">
                      <div className="flex items-center gap-1"><div className="w-2.5 h-3.5 bg-[#F59E0B] rounded-sm" /><span className="text-xs text-[#D97706]">{r.yellow}</span></div>
                      <div className="flex items-center gap-1"><div className="w-2.5 h-3.5 bg-[#EF4444] rounded-sm" /><span className="text-xs text-[#DC2626]">{r.red}</span></div>
                      <span className="text-xs font-bold text-[#374151] w-14 text-right">{r.score} puan</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageContent>
  );
}
