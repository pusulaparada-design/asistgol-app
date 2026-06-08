import { Target, Trophy, Shield } from "lucide-react";
import { PageContent, PageHeader, Card, CardHeader } from "@/components/ui/PageShell";

const scorers = [
  { rank: 1, name: "Emre Demir", team: "Aslan FC", tournament: "Ramazan Kupası", goals: 8, assists: 3, isMyPlayer: true },
  { rank: 2, name: "Tolga Ak", team: "Rüzgar Spor", tournament: "Ramazan Kupası", goals: 7, assists: 2, isMyPlayer: false },
  { rank: 3, name: "Baran Kurt", team: "Çınar FC", tournament: "Ramazan Kupası", goals: 5, assists: 4, isMyPlayer: false },
  { rank: 4, name: "Murat Arslan", team: "Aslan FC", tournament: "Ramazan Kupası", goals: 5, assists: 2, isMyPlayer: true },
  { rank: 5, name: "Serdar Öz", team: "Kaplan SK", tournament: "Ramazan Kupası", goals: 4, assists: 1, isMyPlayer: false },
  { rank: 6, name: "Arda Güler", team: "Yıldız SK", tournament: "Yaz Ligi", goals: 4, assists: 2, isMyPlayer: true },
  { rank: 7, name: "Özgür Can", team: "Ateş FC", tournament: "Ramazan Kupası", goals: 4, assists: 2, isMyPlayer: false },
  { rank: 8, name: "Ali Güç", team: "Fırtına FC", tournament: "Ramazan Kupası", goals: 3, assists: 3, isMyPlayer: false },
];

const teamRankings = [
  { rank: 1, name: "Rüzgar Spor", pts: 12, wins: 4, tournament: "Ramazan Kupası" },
  { rank: 2, name: "Aslan FC", pts: 10, wins: 3, tournament: "Ramazan Kupası", isMine: true },
  { rank: 3, name: "Çınar FC", pts: 7, wins: 2, tournament: "Ramazan Kupası" },
  { rank: 4, name: "Demir SK", pts: 7, wins: 2, tournament: "Ramazan Kupası" },
  { rank: 5, name: "Kaplan SK", pts: 4, wins: 1, tournament: "Ramazan Kupası" },
];

const fairPlay = [
  { rank: 1, name: "Rüzgar Spor", yellow: 1, red: 0, score: 1, isMine: false },
  { rank: 2, name: "Aslan FC", yellow: 1, red: 0, score: 1, isMine: true },
  { rank: 3, name: "Çınar FC", yellow: 2, red: 0, score: 2, isMine: false },
  { rank: 4, name: "Demir SK", yellow: 3, red: 0, score: 3, isMine: false },
  { rank: 5, name: "Yıldız SK", yellow: 2, red: 0, score: 2, isMine: true },
];

export default function LeaderboardPage() {
  return (
    <PageContent>
      <PageHeader title="Sıralamalar" subtitle="Golcüler, takım sıralaması ve fair play" />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Top scorers */}
        <Card className="xl:col-span-1">
          <CardHeader title="Golcü Sıralaması" subtitle="Tüm turnuvalar" />
          <div className="divide-y divide-[#F3F4F6]">
            {scorers.map((s) => (
              <div key={s.rank} className={`flex items-center gap-3 px-4 py-3 ${s.isMyPlayer ? "bg-[#FFFBEB]/40" : ""}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  s.rank === 1 ? "bg-[#FEF3C7] text-[#D97706]" : s.rank === 2 ? "bg-[#F3F4F6] text-[#374151]" : s.rank === 3 ? "bg-[#FEF2F2] text-[#DC2626]" : "bg-[#F3F4F6] text-[#9CA3AF]"
                }`}>{s.rank}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-[#111827]">{s.name}</span>
                    {s.isMyPlayer && <span className="text-[10px] bg-[#FEF3C7] text-[#D97706] px-1.5 py-0.5 rounded-full font-bold">Benimki</span>}
                  </div>
                  <div className="text-xs text-[#9CA3AF]">{s.team}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#111827]">{s.goals}</div>
                  <div className="text-[10px] text-[#9CA3AF]">{s.assists} asist</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="xl:col-span-2 space-y-6">
          {/* Team rankings */}
          <Card>
            <CardHeader title="Takım Sıralaması" subtitle="Ramazan Kupası 2026 — Genel" />
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  {["#", "Takım", "Turnuva", "G", "P"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-[#9CA3AF] uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {teamRankings.map((r) => (
                  <tr key={r.rank} className={`hover:bg-[#FAFAFA] ${r.isMine ? "bg-[#FFFBEB]/40" : ""}`}>
                    <td className="px-4 py-3">
                      <span className={`w-6 h-6 inline-flex items-center justify-center rounded-full text-xs font-bold ${
                        r.rank === 1 ? "bg-[#FEF3C7] text-[#D97706]" : "bg-[#F3F4F6] text-[#9CA3AF]"
                      }`}>{r.rank}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#111827]">{r.name}</span>
                        {r.isMine && <span className="text-[10px] bg-[#FEF3C7] text-[#D97706] px-1.5 py-0.5 rounded-full font-bold">Benim</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#9CA3AF]">{r.tournament}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#10B981]">{r.wins}</td>
                    <td className="px-4 py-3 text-sm font-bold text-[#111827]">{r.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Fair play */}
          <Card>
            <CardHeader title="Fair Play Sıralaması" subtitle="En az kart alan takımlar" />
            <div className="divide-y divide-[#F3F4F6]">
              {fairPlay.map((r) => (
                <div key={r.rank} className={`flex items-center gap-3 px-4 py-3 ${r.isMine ? "bg-[#FFFBEB]/40" : ""}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${r.rank === 1 ? "bg-[#ECFDF5] text-[#059669]" : "bg-[#F3F4F6] text-[#9CA3AF]"}`}>{r.rank}</div>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-sm font-medium text-[#111827]">{r.name}</span>
                    {r.isMine && <span className="text-[10px] bg-[#FEF3C7] text-[#D97706] px-1.5 py-0.5 rounded-full font-bold">Benim</span>}
                  </div>
                  <div className="flex gap-3 items-center">
                    <div className="flex items-center gap-1"><div className="w-2.5 h-3.5 bg-[#F59E0B] rounded-sm" /><span className="text-xs text-[#D97706]">{r.yellow}</span></div>
                    <div className="flex items-center gap-1"><div className="w-2.5 h-3.5 bg-[#EF4444] rounded-sm" /><span className="text-xs text-[#DC2626]">{r.red}</span></div>
                    <span className="text-xs font-bold text-[#374151] w-12 text-right">{r.score} puan</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PageContent>
  );
}
