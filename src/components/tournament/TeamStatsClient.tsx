"use client";
import Link from "next/link";
import { ArrowLeft, Trophy, Shield, Swords, Star } from "lucide-react";
import { Card, CardHeader, StatusBadge } from "@/components/ui/PageShell";
import type { getTeamTournamentStats } from "@/lib/actions/tournament";

type Stats = Awaited<ReturnType<typeof getTeamTournamentStats>>;
type TMatch = Stats["matches"][number];

function fmt(d: Date | null | undefined) {
  if (!d) return "—";
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

function matchResult(m: TMatch, teamId: string): "W" | "D" | "L" | null {
  if (m.homeScore === null || m.awayScore === null) return null;
  const isHome  = m.homeTeamId === teamId;
  const myScore = isHome ? m.homeScore : m.awayScore;
  const opScore = isHome ? m.awayScore : m.homeScore;
  if (myScore > opScore) return "W";
  if (myScore < opScore) return "L";
  return "D";
}

const RESULT_CLS: Record<string, string> = {
  W: "bg-[#ECFDF5] text-[#059669] font-bold",
  D: "bg-[#FEF3C7] text-[#D97706] font-bold",
  L: "bg-[#FEF2F2] text-[#DC2626] font-bold",
};
const RESULT_LABEL: Record<string, string> = { W: "G", D: "B", L: "M" };

export default function TeamStatsClient({
  data,
  backHref,
}: {
  data: Stats;
  backHref: string;
}) {
  const { matches, team, registration, tournament } = data;

  if (!team || !tournament) {
    return <div className="p-10 text-center text-[#9CA3AF]">Takım bulunamadı.</div>;
  }

  const teamId = team.id;
  const playedMatches = matches.filter(m => m.homeScore !== null);

  // ── Genel istatistikler ──
  let wins = 0, draws = 0, losses = 0, gf = 0, ga = 0, yellowCards = 0, redCards = 0, cleanSheets = 0;
  for (const m of playedMatches) {
    const isHome  = m.homeTeamId === teamId;
    const myScore = isHome ? m.homeScore! : m.awayScore!;
    const opScore = isHome ? m.awayScore! : m.homeScore!;
    gf += myScore; ga += opScore;
    if (myScore > opScore) wins++;
    else if (myScore < opScore) losses++;
    else draws++;
    if (opScore === 0) cleanSheets++;
    for (const c of m.cards) {
      if (c.player.id && team.players.some(p => p.id === c.player.id)) {
        if (c.type === "YELLOW") yellowCards++;
        else redCards++;
      }
    }
  }
  const points = wins * (tournament.winPoints ?? 3) + draws;
  const played = playedMatches.length;
  const gd = gf - ga;

  // ── Oyuncu istatistikleri ──
  const playerStats: Record<string, {
    id: string; name: string; number: number | null;
    goals: number; ownGoals: number; assists: number; yellow: number; red: number; matches: Set<string>;
  }> = {};

  function ensurePlayer(p: { id: string; name: string; number: number | null }) {
    if (!playerStats[p.id]) {
      playerStats[p.id] = { id: p.id, name: p.name, number: p.number, goals: 0, ownGoals: 0, assists: 0, yellow: 0, red: 0, matches: new Set() };
    }
  }

  for (const m of playedMatches) {
    for (const g of m.goals) {
      if (!team.players.some(p => p.id === g.player.id)) continue;
      ensurePlayer(g.player);
      if (g.ownGoal) playerStats[g.player.id].ownGoals++;
      else playerStats[g.player.id].goals++;
      playerStats[g.player.id].matches.add(m.id);
    }
    for (const a of m.assists) {
      if (!team.players.some(p => p.id === a.player.id)) continue;
      ensurePlayer(a.player);
      playerStats[a.player.id].assists++;
      playerStats[a.player.id].matches.add(m.id);
    }
    for (const c of m.cards) {
      if (!team.players.some(p => p.id === c.player.id)) continue;
      ensurePlayer(c.player);
      if (c.type === "YELLOW") playerStats[c.player.id].yellow++;
      else playerStats[c.player.id].red++;
      playerStats[c.player.id].matches.add(m.id);
    }
  }

  // Oynanan maç: lineup VEYA o maçta eventi olan oyuncu (örn. değişiklikle giren)
  const playerPlayedCount: Record<string, number> = {};
  for (const m of playedMatches) {
    const isHome   = m.homeTeamId === teamId;
    const lineup   = isHome ? m.homeLineup : m.awayLineup;
    const teamPIds = new Set(team.players.map(p => p.id));
    const playedInMatch = new Set<string>();
    for (const pid of lineup) {
      if (teamPIds.has(pid)) playedInMatch.add(pid);
    }
    for (const g of m.goals)   { if (teamPIds.has(g.player.id))   playedInMatch.add(g.player.id); }
    for (const a of m.assists)  { if (teamPIds.has(a.player.id))   playedInMatch.add(a.player.id); }
    for (const c of m.cards)    { if (teamPIds.has(c.player.id))   playedInMatch.add(c.player.id); }
    for (const pid of playedInMatch) {
      playerPlayedCount[pid] = (playerPlayedCount[pid] ?? 0) + 1;
    }
  }

  const playerRows = Object.values(playerStats).sort((a, b) => b.goals - a.goals || b.assists - a.assists);

  // Form (son 5 maç)
  const form = playedMatches.slice(-5).map(m => matchResult(m, teamId)).filter(Boolean) as ("W"|"D"|"L")[];

  return (
    <div className="min-h-screen bg-[#F4F6F9]">

      {/* ── HEADER ── */}
      <div className="bg-[#0F1F47] text-white px-6 py-6">
        <div className="max-w-5xl mx-auto">
          <Link href={backHref} className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft size={15} /> Turnuvaya Dön
          </Link>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-xl font-extrabold">
                  {team.name[0]}
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold">{team.name}</h1>
                  <p className="text-white/60 text-sm">{tournament.name}</p>
                </div>
              </div>
              {registration?.groupTeam?.group?.name && (
                <span className="mt-2 inline-block text-xs bg-white/10 px-2.5 py-1 rounded-full text-white/80">
                  {registration.groupTeam.group.name}
                </span>
              )}
            </div>

            {/* Form */}
            {form.length > 0 && (
              <div className="text-right">
                <div className="text-xs text-white/50 mb-1.5">Son {form.length} Maç</div>
                <div className="flex gap-1.5">
                  {form.map((r, i) => (
                    <span key={i} className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center ${RESULT_CLS[r]}`}>
                      {RESULT_LABEL[r]}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Özet stat şeridi */}
          <div className="mt-5 grid grid-cols-4 sm:grid-cols-8 gap-3">
            {[
              { label: "Maç",    val: played },
              { label: "Galibiyet", val: wins },
              { label: "Beraberlik", val: draws },
              { label: "Mağlubiyet", val: losses },
              { label: "Puan",   val: points },
              { label: "GD",     val: gd > 0 ? `+${gd}` : gd },
              { label: "Sarı",   val: yellowCards },
              { label: "Kırmızı", val: redCards },
            ].map(st => (
              <div key={st.label} className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-lg font-bold">{st.val}</div>
                <div className="text-[10px] text-white/60 mt-0.5">{st.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── İÇERİK ── */}
      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">

        {/* Özet Kartlar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Trophy,  label: "Gol Atılan",   val: gf,          color: "text-[#F59E0B]", bg: "bg-[#FFF7ED]" },
            { icon: Shield,  label: "Gol Yenilen",  val: ga,          color: "text-[#EF4444]", bg: "bg-[#FEF2F2]" },
            { icon: Swords,  label: "Gol Farkı",    val: gd > 0 ? `+${gd}` : gd, color: "text-[#3B82F6]", bg: "bg-[#EFF6FF]" },
            { icon: Star,    label: "Klinsiz Maç",  val: cleanSheets, color: "text-[#10B981]", bg: "bg-[#ECFDF5]" },
          ].map(({ icon: Icon, label, val, color, bg }) => (
            <Card key={label}>
              <div className="flex items-center gap-3 p-4">
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
                  <Icon size={18} className={color} />
                </div>
                <div>
                  <div className={`text-2xl font-extrabold ${color}`}>{val}</div>
                  <div className="text-xs text-[#9CA3AF]">{label}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Maçlar */}
        <Card>
          <CardHeader title="Maçlar" subtitle={`${played} maç oynandı`} />
          {matches.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#9CA3AF]">Henüz maç oynanmadı.</div>
          ) : (
            <div className="divide-y divide-[#F3F4F6]">
              {matches.map(m => {
                const isHome = m.homeTeamId === teamId;
                const played = m.homeScore !== null;
                const result = played ? matchResult(m, teamId) : null;
                const hasEvents = played && (m.goals.length + m.assists.length + m.cards.length) > 0;

                const playerTeamMap: Record<string, string> = {};
                for (const pid of m.homeLineup) playerTeamMap[pid] = m.homeTeamId;
                for (const pid of m.awayLineup) playerTeamMap[pid] = m.awayTeamId;
                for (const g of m.goals) playerTeamMap[g.player.id] = g.teamId;

                const homeGoals   = m.goals.filter(g => g.teamId === m.homeTeamId);
                const awayGoals   = m.goals.filter(g => g.teamId === m.awayTeamId);
                const homeAssists = m.assists.filter(a => playerTeamMap[a.player.id] === m.homeTeamId);
                const awayAssists = m.assists.filter(a => playerTeamMap[a.player.id] === m.awayTeamId);
                const homeCards   = m.cards.filter(c => playerTeamMap[c.player.id] === m.homeTeamId);
                const awayCards   = m.cards.filter(c => playerTeamMap[c.player.id] === m.awayTeamId);

                // rev=true → home takım olayları sağdan sola (skora doğru) akar
                const renderTeamEvents = (
                  goals: typeof m.goals,
                  assists: typeof m.assists,
                  cards: typeof m.cards,
                  rev = false,
                ) => (
                  <div className={`space-y-1.5 ${rev ? "text-right" : ""}`}>
                    {goals.map(g => (
                      <div key={g.id} className={`flex items-center gap-1.5 text-xs text-[#374151] ${rev ? "flex-row-reverse" : ""}`}>
                        <span>⚽</span>
                        <span className="font-medium">{g.player.name}</span>
                        {g.ownGoal && <span className="text-[#9CA3AF] text-[10px]">(kendi kalesine)</span>}
                        {g.minute != null && <span className="text-[#9CA3AF] shrink-0">{g.minute}'</span>}
                      </div>
                    ))}
                    {assists.map(a => (
                      <div key={a.id} className={`flex items-center gap-1.5 text-xs text-[#6B7280] ${rev ? "flex-row-reverse" : ""}`}>
                        <span>🎯</span>
                        <span className="font-medium">{a.player.name}</span>
                        <span className="text-[#9CA3AF] text-[10px]">asist</span>
                        {a.minute != null && <span className="text-[#9CA3AF] shrink-0">{a.minute}'</span>}
                      </div>
                    ))}
                    {cards.map(c => (
                      <div key={c.id} className={`flex items-center gap-1.5 text-xs text-[#374151] ${rev ? "flex-row-reverse" : ""}`}>
                        <div className={`w-3 h-4 rounded-sm shrink-0 ${c.type === "YELLOW" ? "bg-[#F59E0B]" : "bg-[#EF4444]"}`} />
                        <span className="font-medium">{c.player.name}</span>
                        {c.minute != null && <span className="text-[#9CA3AF] shrink-0">{c.minute}'</span>}
                      </div>
                    ))}
                  </div>
                );

                // Sütun genişlikleri maç satırı ve olaylar arasında aynı olmalı
                // w-24: tarih | w-10: badge | flex-1: ev takım | w-20: skor | flex-1: dep takım | trailing
                return (
                  <div key={m.id}>
                    {/* Maç satırı */}
                    <div className="flex items-center gap-3 px-5 py-3.5">
                      <div className="w-24 shrink-0">
                        <div className="text-xs text-[#9CA3AF]">{fmt(m.date)}</div>
                        {m.time && <div className="text-xs text-[#6B7280]">{m.time}</div>}
                      </div>
                      <div className="w-10 shrink-0">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isHome ? "bg-[#EFF6FF] text-[#3B82F6]" : "bg-[#F4F6F9] text-[#6B7280]"}`}>
                          {isHome ? "EV" : "DEP"}
                        </span>
                      </div>
                      <div className="flex-1 text-sm font-semibold text-[#111827] text-right truncate">{m.homeTeam.name}</div>
                      <div className="w-20 shrink-0 text-center">
                        {played
                          ? <span className="font-mono font-extrabold text-base text-[#111827]">{m.homeScore} – {m.awayScore}</span>
                          : <span className="text-sm text-[#D1D5DB]">vs</span>}
                      </div>
                      <div className="flex-1 text-sm font-semibold text-[#111827] truncate">{m.awayTeam.name}</div>
                      <div className="flex items-center gap-2 shrink-0">
                        {result && (
                          <span className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center ${RESULT_CLS[result]}`}>
                            {RESULT_LABEL[result]}
                          </span>
                        )}
                        {m.group?.name && (
                          <span className="hidden sm:block text-[10px] bg-[#F4F6F9] text-[#6B7280] px-2 py-0.5 rounded font-medium">
                            {m.group.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Olaylar — maç satırıyla aynı sütun hizası */}
                    {hasEvents && (
                      <div className="flex gap-3 px-5 pb-3 bg-[#F8FAFC] border-t border-[#F3F4F6]">
                        <div className="w-24 shrink-0" />
                        <div className="w-10 shrink-0" />
                        <div className="flex-1 pt-2.5">
                          {renderTeamEvents(homeGoals, homeAssists, homeCards, true)}
                        </div>
                        <div className="w-20 shrink-0" />
                        <div className="flex-1 pt-2.5">
                          {renderTeamEvents(awayGoals, awayAssists, awayCards, false)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Oyuncu İstatistikleri */}
          <Card>
            <CardHeader title="Oyuncu İstatistikleri" subtitle={`${team.players.length} oyuncu`} />
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5E7EB]">
                    {["#", "Oyuncu", "Oynanan", "Gol", "Asist", "Sarı", "Kırmızı"].map(h => (
                      <th key={h} className={`px-3 py-2.5 text-xs font-semibold text-[#9CA3AF] uppercase ${h === "Oyuncu" ? "text-left" : "text-center"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {team.players
                    .filter(p => (playerPlayedCount[p.id] ?? 0) > 0)
                    .map(p => {
                      const ps      = playerStats[p.id];
                      const oynanan = playerPlayedCount[p.id] ?? 0;
                      return (
                        <tr key={p.id} className="hover:bg-[#FAFAFA]">
                          <td className="px-3 py-2.5 text-xs text-[#9CA3AF] text-center">{p.number ?? "—"}</td>
                          <td className="px-3 py-2.5 text-sm font-medium text-[#111827]">{p.name}</td>
                          <td className="px-3 py-2.5 text-center text-sm font-semibold text-[#374151]">{oynanan}</td>
                          <td className="px-3 py-2.5 text-center">
                            <span className={`text-sm font-bold ${ps?.goals ? "text-[#10B981]" : "text-[#D1D5DB]"}`}>{ps?.goals ?? 0}</span>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className={`text-sm ${ps?.assists ? "text-[#3B82F6] font-semibold" : "text-[#D1D5DB]"}`}>{ps?.assists ?? 0}</span>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            {ps?.yellow ? (
                              <div className="flex items-center justify-center gap-1">
                                <div className="w-3 h-4 bg-[#F59E0B] rounded-sm" />
                                <span className="text-xs font-semibold">{ps.yellow}</span>
                              </div>
                            ) : <span className="text-[#D1D5DB] text-xs">—</span>}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            {ps?.red ? (
                              <div className="flex items-center justify-center gap-1">
                                <div className="w-3 h-4 bg-[#EF4444] rounded-sm" />
                                <span className="text-xs font-semibold">{ps.red}</span>
                              </div>
                            ) : <span className="text-[#D1D5DB] text-xs">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Gol Krallığı (Takım İçi) */}
          <Card>
            <CardHeader title="Gol Krallığı" subtitle="Takım içi sıralama" />
            {playerRows.filter(p => p.goals > 0).length === 0 ? (
              <div className="p-8 text-center text-sm text-[#9CA3AF]">Henüz gol kaydedilmedi.</div>
            ) : (
              <div className="divide-y divide-[#F3F4F6]">
                {playerRows.filter(p => p.goals > 0).map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? "bg-[#FEF3C7] text-[#D97706]" : "bg-[#F3F4F6] text-[#9CA3AF]"}`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#111827] truncate">{p.name}</div>
                      {p.assists > 0 && <div className="text-xs text-[#9CA3AF]">{p.assists} asist</div>}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xl font-extrabold text-[#10B981]">{p.goals}</span>
                      <div className="text-[10px] text-[#9CA3AF]">gol</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Disiplin */}
          <Card>
            <CardHeader title="Disiplin" subtitle={`${yellowCards} sarı · ${redCards} kırmızı`} />
            {playerRows.filter(p => p.yellow > 0 || p.red > 0).length === 0 ? (
              <div className="p-8 text-center text-sm text-[#9CA3AF]">Henüz kart kaydedilmedi.</div>
            ) : (
              <div className="divide-y divide-[#F3F4F6]">
                {playerRows
                  .filter(p => p.yellow > 0 || p.red > 0)
                  .sort((a, b) => (b.yellow + b.red * 3) - (a.yellow + a.red * 3))
                  .map(p => (
                    <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="flex-1 text-sm font-medium text-[#111827] truncate">{p.name}</div>
                      <div className="flex items-center gap-2 shrink-0">
                        {p.yellow > 0 && (
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-4 bg-[#F59E0B] rounded-sm" />
                            <span className="text-xs font-bold text-[#D97706]">{p.yellow}</span>
                          </div>
                        )}
                        {p.red > 0 && (
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-4 bg-[#EF4444] rounded-sm" />
                            <span className="text-xs font-bold text-[#DC2626]">{p.red}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </Card>

          {/* Maç Başına Ortalamalar */}
          <Card>
            <CardHeader title="Ortalamalar" subtitle="Maç başına" />
            <div className="divide-y divide-[#F3F4F6]">
              {[
                { label: "Gol Ortalaması (Atılan)",  val: played ? (gf / played).toFixed(2) : "—" },
                { label: "Gol Ortalaması (Yenilen)", val: played ? (ga / played).toFixed(2) : "—" },
                { label: "Galibiyet Oranı",           val: played ? `%${((wins / played) * 100).toFixed(0)}` : "—" },
                { label: "Maç Başına Puan",           val: played ? (points / played).toFixed(2) : "—" },
                { label: "Sarı Kart / Maç",           val: played ? (yellowCards / played).toFixed(2) : "—" },
                { label: "Klinsiz Maç Oranı",         val: played ? `%${((cleanSheets / played) * 100).toFixed(0)}` : "—" },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-[#6B7280]">{row.label}</span>
                  <span className="text-sm font-bold text-[#111827]">{row.val}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Kadro */}
        <Card>
          <CardHeader title="Kadro" subtitle={`${team.players.length} oyuncu · Kaptan: ${team.captain.name}`} />
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {team.players.map(p => (
              <div key={p.id} className="flex items-center gap-2 bg-[#F8FAFC] rounded-lg px-3 py-2 border border-[#E5E7EB]">
                <div className="w-8 h-8 bg-[#0F1F47] rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">{p.number ?? "—"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-[#111827] truncate">{p.name}</div>
                  <div className="text-[10px] text-[#9CA3AF]">{p.position ?? "—"}</div>
                </div>
                <StatusBadge
                  label={p.status === "ACTIVE" ? "Aktif" : p.status === "SUSPENDED" ? "Cezalı" : "Sakatık"}
                  variant={p.status === "ACTIVE" ? "green" : p.status === "SUSPENDED" ? "orange" : "gray"}
                  dot={false}
                />
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
}
