export const dynamic = "force-dynamic";
import { MapPin } from "lucide-react";
import { PageContent, PageHeader, Card, CardHeader, StatusBadge, LiveBadge } from "@/components/ui/PageShell";
import { getCaptainSchedule } from "@/lib/actions/match";

function fmtDay(d: Date) {
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}


function getResult(match: { homeScore: number | null; awayScore: number | null }, myTeamId: string, homeTeamId: string) {
  if (match.homeScore === null) return null;
  const hs = match.homeScore, as = match.awayScore ?? 0;
  const isHome = homeTeamId === myTeamId;
  const myScore = isHome ? hs : as;
  const opScore = isHome ? as : hs;
  if (myScore > opScore) return "win";
  if (myScore < opScore) return "loss";
  return "draw";
}

export default async function SchedulePage() {
  const { matches, myTeamIds } = await getCaptainSchedule().catch(() => ({ matches: [], myTeamIds: [] }));

  const now = new Date();
  const upcoming = matches.filter((m) => m.status !== "PLAYED");
  const past = matches.filter((m) => m.status === "PLAYED");

  // Build 7-day strip from today
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    return d;
  });

  const todayStr = now.toDateString();

  return (
    <PageContent>
      <PageHeader title="Maç Takvimim" subtitle="Önümüzdeki 7 gün" />

      {/* Week strip */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {days.map((day) => {
          const isToday = day.toDateString() === todayStr;
          const dayMatches = upcoming.filter((m) => m.date && new Date(m.date).toDateString() === day.toDateString());
          return (
            <div
              key={day.toISOString()}
              className={`min-w-[80px] p-3 rounded-xl text-center border-2 transition-all ${isToday ? "border-[#F59E0B] bg-[#FFFBEB]" : "border-[#E5E7EB] bg-white"}`}
            >
              <div className={`text-xs font-medium ${isToday ? "text-[#D97706]" : "text-[#9CA3AF]"}`}>{fmtDay(day)}</div>
              {dayMatches.length > 0 ? (
                <div className={`mt-1.5 text-sm font-bold ${isToday ? "text-[#D97706]" : "text-[#374151]"}`}>{dayMatches.length} maç</div>
              ) : (
                <div className="mt-1.5 text-xs text-[#D1D5DB]">—</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Upcoming */}
      <Card>
        <CardHeader title="Yaklaşan Maçlar" />
        {upcoming.length === 0 ? (
          <div className="py-8 text-center text-sm text-[#9CA3AF]">Yaklaşan maç yok</div>
        ) : (
          <div className="divide-y divide-[#F3F4F6]">
            {upcoming.map((m) => (
              <div key={m.id} className={`flex items-center gap-4 px-5 py-4 ${m.status === "LIVE" ? "bg-[#FEF2F2]/20" : ""}`}>
                <div className="w-12 text-right shrink-0">
                  {m.date && <div className="text-xs font-semibold text-[#374151]">{fmtDay(m.date)}</div>}
                  {m.time && <div className="text-xs text-[#9CA3AF] font-mono">{m.time}</div>}
                </div>
                <div className={`w-2 h-2 rounded-full shrink-0 ${m.status === "LIVE" ? "bg-[#EF4444] animate-pulse" : "bg-[#D1D5DB]"}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-[#111827]">{m.homeTeam.name} vs {m.awayTeam.name}</span>
                    {m.status === "LIVE" ? <LiveBadge /> : <StatusBadge label="Planlandı" variant="blue" dot={false} />}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#9CA3AF]">
                    <span>{m.tournament.name}{m.group ? ` · ${m.group.name}` : m.round ? ` · ${m.round}` : ""}</span>
                    {m.venue && <span className="flex items-center gap-0.5"><MapPin size={10} /> {m.venue}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Past results */}
      <Card>
        <CardHeader title="Son Maç Sonuçları" />
        {past.length === 0 ? (
          <div className="py-8 text-center text-sm text-[#9CA3AF]">Henüz oynanan maç yok</div>
        ) : (
          <div className="divide-y divide-[#F3F4F6]">
            {past.slice(0, 10).map((m) => {
              const myId = myTeamIds.find(id => id === m.homeTeamId || id === m.awayTeamId);
              const result = myId ? getResult(m, myId, m.homeTeamId) : null;
              const resultStyle =
                result === "win"  ? "text-[#059669] bg-[#ECFDF5]" :
                result === "loss" ? "text-[#DC2626] bg-[#FEF2F2]" :
                result === "draw" ? "text-[#D97706] bg-[#FEF3C7]" : "";
              const resultLabel =
                result === "win" ? "G" : result === "loss" ? "M" : result === "draw" ? "B" : null;
              return (
                <div key={m.id} className="flex items-center gap-4 px-5 py-3.5">
                  {resultLabel && (
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${resultStyle}`}>
                      {resultLabel}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#111827]">{m.homeTeam.name} vs {m.awayTeam.name}</div>
                    <div className="text-xs text-[#9CA3AF]">{m.date ? fmtDay(m.date) : "—"} · {m.tournament.name}</div>
                  </div>
                  <div className="font-mono font-bold text-sm text-[#111827]">{m.homeScore} - {m.awayScore}</div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </PageContent>
  );
}
