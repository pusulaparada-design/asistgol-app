"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin, Calendar, Trophy, Users, Swords, BarChart2,
  GitBranch, Settings2, Info,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { Card, CardHeader, StatusBadge } from "@/components/ui/PageShell";
import { BracketView } from "@/components/tournament/BracketView";
import { MatchDetailModal } from "@/components/tournament/MatchDetailModal";
import type { getTournament } from "@/lib/actions/tournament";
import type { getMyTeams } from "@/lib/actions/team";


type Tournament = NonNullable<Awaited<ReturnType<typeof getTournament>>>;
type MyTeams    = Awaited<ReturnType<typeof getMyTeams>>;
type TMatch     = Tournament["matches"][number];

const FORMAT_LABELS: Record<string, string> = {
  GROUP_KNOCKOUT: "Grup + Eleme",
  GROUP_ONLY:     "Sadece Lig",
  KNOCKOUT_ONLY:  "Sadece Eleme",
};

const STATUS_MAP: Record<string, { label: string; variant: "green" | "blue" | "gray" | "orange" }> = {
  REGISTRATION: { label: "Talep Topluyor", variant: "green"  },
  ACTIVE:       { label: "Devam Ediyor",   variant: "blue"   },
  COMPLETED:    { label: "Bitti",          variant: "gray"   },
  DRAFT:        { label: "Taslak",         variant: "orange" },
};

function effectiveStatus(t: Tournament) {
  const approved = t.registrations.filter(r => r.status === "APPROVED").length;
  if (t.status === "REGISTRATION" && approved >= t.maxTeams)
    return { label: "Hazırlanıyor", variant: "orange" as const };
  return STATUS_MAP[t.status] ?? STATUS_MAP.DRAFT;
}

function expectedTotalMatches(t: Tournament) {
  const groupMatches  = t.matches.filter(m => m.groupId !== null).length;
  const knockoutInDB  = t.matches.filter(m => m.groupId === null && m.round != null).length;
  if (t.format === "GROUP_ONLY")    return groupMatches;
  if (t.format === "KNOCKOUT_ONLY") return t._count.matches;
  if (knockoutInDB > 0)             return groupMatches + knockoutInDB;
  const advancing = (t.advanceCount ?? 2) * t.groups.length;
  const knockoutExp = advancing > 1 ? (advancing - 1 + (t.thirdPlace ? 1 : 0)) : 0;
  return groupMatches + knockoutExp;
}

function fmt(d: Date | null | undefined) {
  if (!d) return "—";
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}
function fmtLong(d: Date | null | undefined) {
  if (!d) return "—";
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

const ROUND_LABELS: Record<string, string> = {
  ROUND_OF_32: "Son 32", ROUND_OF_16: "Son 16",
  QUARTER_FINAL: "Çeyrek Final", SEMI_FINAL: "Yarı Final",
  FINAL: "Final", THIRD_PLACE: "3. Yer Maçı",
};
function matchContext(m: TMatch) {
  if (m.group?.name) return m.group.name;
  if (m.round) return ROUND_LABELS[m.round] ?? m.round;
  return "Eleme";
}
function contextVariant(m: TMatch) {
  if (m.group?.name) return "bg-[#EFF6FF] text-[#3B82F6]";
  const r = m.round ?? "";
  if (r === "FINAL") return "bg-[#FEF3C7] text-[#D97706]";
  if (r === "SEMI_FINAL" || r === "QUARTER_FINAL") return "bg-[#FFF7ED] text-[#EA580C]";
  return "bg-[#F4F6F9] text-[#6B7280]";
}

function calcStandings(
  groupId: string,
  groupTeams: Tournament["groups"][number]["teams"],
  matches: TMatch[],
  winPts: number,
) {
  const rows = groupTeams.map(gt => ({
    team: gt.team,
    played: 0, wins: 0, draws: 0, losses: 0,
    goalsFor: 0, goalsAgainst: 0, points: 0,
  }));
  for (const m of matches) {
    if (m.groupId !== groupId) continue;
    if (m.homeScore === null || m.awayScore === null) continue;
    const home = rows.find(r => r.team.id === m.homeTeamId);
    const away = rows.find(r => r.team.id === m.awayTeamId);
    if (!home || !away) continue;
    home.played++; away.played++;
    home.goalsFor += m.homeScore; home.goalsAgainst += m.awayScore;
    away.goalsFor += m.awayScore; away.goalsAgainst += m.homeScore;
    if (m.homeScore > m.awayScore)      { home.wins++; home.points += winPts; away.losses++; }
    else if (m.homeScore < m.awayScore) { away.wins++; away.points += winPts; home.losses++; }
    else { home.draws++; home.points++; away.draws++; away.points++; }
  }
  return rows.sort((a, b) =>
    b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst),
  );
}

const TABS = [
  { key: "bilgi",      label: "Bilgi & Şartlar", icon: Info    },
  { key: "gruplar",    label: "Gruplar",       icon: Users     },
  { key: "eleme",      label: "Eleme Aşaması", icon: GitBranch },
  { key: "maclar",     label: "Maçlar",        icon: Swords    },
  { key: "istatistik", label: "İstatistikler", icon: BarChart2 },
  { key: "takimlar",   label: "Takımlar",      icon: Users     },
] as const;

const MATCH_FORMAT_LABELS: Record<string, string> = {
  SINGLE: "Tek Maç",
  DOUBLE: "Çift Maç (Rövanşlı)",
};
type TabKey = typeof TABS[number]["key"];

export default function TournamentDetailClient({
  tournament: t,
  myTeams,
  isOrganizer = false,
  basePath,
}: {
  tournament: Tournament;
  myTeams?: MyTeams;
  isOrganizer?: boolean;
  basePath?: string;
}) {
  const teamStatsBase = basePath ?? (isOrganizer ? "/organizer/tournaments" : "/captain/tournaments");
  const [tab, setTab] = useState<TabKey>("gruplar");
  const [activeGroup, setActiveGroup] = useState(t.groups[0]?.id ?? "");
  const [detailMatch, setDetailMatch] = useState<TMatch | null>(null);

  const s              = effectiveStatus(t);
  const approvedRegs   = t.registrations.filter(r => r.status === "APPROVED");
  const pendingRegs    = t.registrations.filter(r => r.status === "PENDING");
  const playedMatches  = t.matches.filter(m => m.homeScore !== null);
  const totalExp       = expectedTotalMatches(t);
  const totalYellow    = t.matches.reduce((a, m) => a + m.cards.filter(c => c.type === "YELLOW").length, 0);
  const totalRed       = t.matches.reduce((a, m) => a + m.cards.filter(c => c.type === "RED").length, 0);
  const totalGoals     = t.matches.reduce((a, m) => a + m.goals.length, 0);

  const myRegistration = t.registrations.find(r => (myTeams ?? []).some(tm => tm.id === r.team.id));

  // İstatistikler
  const scorers: Record<string, { name: string; team: string; goals: number }> = {};
  const carders: Record<string, { name: string; team: string; yellow: number; red: number }> = {};
  for (const m of t.matches) {
    for (const g of m.goals) {
      if (!scorers[g.playerId]) scorers[g.playerId] = { name: g.player.name, team: m.homeTeamId === g.teamId ? m.homeTeam.name : m.awayTeam.name, goals: 0 };
      scorers[g.playerId].goals++;
    }
    for (const c of m.cards) {
      const teamName = c.player.teamId === m.homeTeamId ? m.homeTeam.name : m.awayTeam.name;
      if (!carders[c.playerId]) carders[c.playerId] = { name: c.player.name, team: teamName, yellow: 0, red: 0 };
      if (c.type === "YELLOW") carders[c.playerId].yellow++;
      else carders[c.playerId].red++;
    }
  }
  const topScorers = Object.values(scorers).sort((a, b) => b.goals - a.goals).slice(0, 10);
  const topCarders = Object.values(carders).sort((a, b) => (b.yellow + b.red * 2) - (a.yellow + a.red * 2)).slice(0, 10);

  return (
    <div className="min-h-screen bg-[#F4F6F9]">

      {/* ── HEADER + TAB BAR (sticky) ── */}
      <div className="sticky top-0 z-30">
        <div className="bg-[#0F1F47] text-white px-4 sm:px-6 py-5 sm:py-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-extrabold mb-1">{t.name}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/70">
                  {t.city && <span className="flex items-center gap-1"><MapPin size={13} /> {t.city}{t.venue ? ` · ${t.venue}` : ""}</span>}
                  <span className="flex items-center gap-1"><Calendar size={13} /> {fmt(t.startDate)} – {fmt(t.endDate)}</span>
                  {t.prize && <span className="flex items-center gap-1"><Trophy size={13} /> {t.prize}</span>}
                  {!isOrganizer && <span className="text-white/50">{t.organizer.name}</span>}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <StatusBadge label={s.label} variant={s.variant} dot={false} />
                <div className="text-sm text-white/70">{approvedRegs.length}/{t.maxTeams} takım</div>
                <div className="text-sm text-white/70">{FORMAT_LABELS[t.format] ?? t.format}</div>
                {isOrganizer && (
                  <Link
                    href={`/organizer/tournaments/${t.id}/manage`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#EF4444] text-white text-sm font-bold hover:bg-[#DC2626] transition-colors"
                  >
                    <Settings2 size={14} /> Yönet
                  </Link>
                )}
                {!isOrganizer && myRegistration && (
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      myRegistration.status === "APPROVED"  ? "bg-[#ECFDF5] text-[#059669]" :
                      myRegistration.status === "REJECTED"  ? "bg-[#FEF2F2] text-[#DC2626]" :
                      "bg-white/10 text-white"
                    }`}>
                      {myRegistration.status === "APPROVED" ? "✓ Kayıtlısınız" :
                       myRegistration.status === "REJECTED" ? "✗ Başvuru Reddedildi" :
                       "⏳ Onay Bekliyor"}
                    </span>
                    {myRegistration.status === "REJECTED" && myRegistration.rejectionReason && (
                      <span className="text-xs text-[#FCA5A5] text-right max-w-[220px]">Red sebebi: {myRegistration.rejectionReason}</span>
                    )}
                    {myRegistration.note && (
                      <span className="text-xs text-white/50 text-right max-w-[220px]">Notunuz: {myRegistration.note}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: "Kayıtlı Takım", val: `${approvedRegs.length}/${t.maxTeams}` },
                { label: "Oynanan Maç",   val: `${playedMatches.length}/${totalExp}` },
                { label: "Toplam Gol",    val: totalGoals },
                { label: "Sarı Kart",     val: totalYellow },
                { label: "Kırmızı Kart",  val: totalRed },
              ].map(st => (
                <div key={st.label} className="bg-white/10 rounded-xl p-3 text-center">
                  <div className="text-xl font-bold">{st.val}</div>
                  <div className="text-xs text-white/60 mt-0.5">{st.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="bg-white border-b border-[#E5E7EB] px-6">
          <div className="max-w-6xl mx-auto flex gap-1 overflow-x-auto">
            {TABS.map(tb => (
              <button
                key={tb.key}
                onClick={() => setTab(tb.key)}
                className={`flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  tab === tb.key
                    ? "border-[#F59E0B] text-[#0F1F47]"
                    : "border-transparent text-[#6B7280] hover:text-[#374151]"
                }`}
              >
                <tb.icon size={14} /> {tb.label}
                {tb.key === "takimlar" && pendingRegs.length > 0 && (
                  <span className="bg-[#EF4444] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {pendingRegs.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── İÇERİK ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid gap-6 grid-cols-1">

          {/* ANA İÇERİK */}
          <div className="space-y-5">

            {/* BİLGİ & ŞARTLAR */}
            {tab === "bilgi" && (() => {
              const specs: { label: string; value: React.ReactNode }[] = [
                { label: "Format", value: FORMAT_LABELS[t.format] ?? t.format },
                { label: "Maç Formatı", value: MATCH_FORMAT_LABELS[t.matchFormat] ?? t.matchFormat },
                { label: "Kontenjan", value: `${t.maxTeams} takım` },
                { label: "Katılım Ücreti", value: t.fee != null ? `${t.fee.toLocaleString("tr-TR")} ₺` : "Ücretsiz" },
                { label: "Son Başvuru Tarihi", value: fmtLong(t.deadline) },
                { label: "Başlangıç", value: fmtLong(t.startDate) },
                { label: "Bitiş", value: fmtLong(t.endDate) },
                { label: "Şehir / Saha", value: t.venue ? `${t.city} · ${t.venue}` : t.city },
                { label: "Ödül", value: t.prize || "—" },
                { label: "Galibiyet Puanı", value: t.winPoints },
                { label: "Sarı Kart Limiti", value: t.yellowCardLimit },
                { label: "Uzatma", value: t.extraTime ? "Var" : "Yok" },
                { label: "3.'lük Maçı", value: t.thirdPlace ? "Var" : "Yok" },
              ];
              return (
                <div className="space-y-5">
                  <Card>
                    <CardHeader title="Turnuva Bilgileri & Katılım Şartları" subtitle={`Organizatör: ${t.organizer.name}`} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#F3F4F6]">
                      {specs.map(sp => (
                        <div key={sp.label} className="bg-white px-5 py-3">
                          <div className="text-xs text-[#9CA3AF] mb-0.5">{sp.label}</div>
                          <div className="text-sm font-semibold text-[#111827]">{sp.value}</div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {t.description && (
                    <Card>
                      <CardHeader title="Açıklama" />
                      <p className="px-5 py-4 text-sm text-[#374151] whitespace-pre-wrap leading-relaxed">{t.description}</p>
                    </Card>
                  )}

                  {t.rules && (
                    <Card>
                      <CardHeader title="Turnuva Kuralları" />
                      <p className="px-5 py-4 text-sm text-[#374151] whitespace-pre-wrap leading-relaxed">{t.rules}</p>
                    </Card>
                  )}
                </div>
              );
            })()}

            {/* GRUPLAR */}
            {tab === "gruplar" && (
              <div className="space-y-4">
                {t.groups.length === 0 ? (
                  <Card><div className="p-10 text-center text-sm text-[#9CA3AF]">Henüz grup oluşturulmadı veya takımlar gruplara atanmadı.</div></Card>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {t.groups.map(g => (
                        <button key={g.id} onClick={() => setActiveGroup(g.id)}
                          className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-all ${
                            activeGroup === g.id
                              ? "bg-[#0F1F47] text-white border-[#0F1F47]"
                              : "bg-white text-[#374151] border-[#E5E7EB] hover:border-[#0F1F47]"
                          }`}>{g.name}</button>
                      ))}
                    </div>
                    {t.groups.filter(g => g.id === activeGroup).map(g => {
                      const rows = calcStandings(g.id, g.teams, t.matches, t.winPoints);
                      const gMatches = [...t.matches.filter(m => m.groupId === g.id)].sort((a, b) => {
                        if (!a.date && !b.date) return 0;
                        if (!a.date) return 1;
                        if (!b.date) return -1;
                        return new Date(a.date).getTime() - new Date(b.date).getTime();
                      });
                      return (
                        <div key={g.id} className="space-y-4">
                          <Card>
                            <CardHeader title={`${g.name} — Puan Tablosu`} subtitle={`${g.teams.length} takım`} />
                            <StandingsTable rows={rows} advanceCount={t.advanceCount ?? 0} tournamentId={t.id} teamStatsBase={teamStatsBase} />
                          </Card>
                          {gMatches.length > 0 && (
                            <Card>
                              <CardHeader title="Maçlar" subtitle={`${gMatches.length} maç`} />
                              <div className="divide-y divide-[#F3F4F6]">
                                {gMatches.map(m => {
                                  const isPlayed = m.homeScore !== null;
                                  const homeWin  = isPlayed && m.homeScore! > m.awayScore!;
                                  const awayWin  = isPlayed && m.awayScore! > m.homeScore!;
                                  return (
                                    <div key={m.id} onClick={() => setDetailMatch(m)} className="flex items-center gap-3 px-5 py-3 flex-wrap sm:flex-nowrap cursor-pointer hover:bg-[#F8FAFC] transition-colors">
                                      <div className="w-32 shrink-0">
                                        <div className="text-xs text-[#9CA3AF]">{m.date ? fmt(m.date) : <span className="text-[#D1D5DB]">—</span>}</div>
                                        {m.time && <div className="text-xs font-medium text-[#6B7280]">{m.time}</div>}
                                      </div>
                                      <div className="flex-1 grid grid-cols-3 items-center gap-2 min-w-0">
                                        <span className={`text-sm text-right truncate ${homeWin ? "font-bold text-[#111827]" : "font-medium text-[#6B7280]"}`}>{m.homeTeam.name}</span>
                                        <span className={`text-center font-mono font-bold text-sm ${isPlayed ? "text-[#111827]" : "text-[#D1D5DB]"}`}>
                                          {isPlayed ? `${m.homeScore} – ${m.awayScore}` : "– vs –"}
                                        </span>
                                        <span className={`text-sm truncate ${awayWin ? "font-bold text-[#111827]" : "font-medium text-[#6B7280]"}`}>{m.awayTeam.name}</span>
                                      </div>
                                      <StatusBadge
                                        label={m.status === "PLAYED" ? "Oynandı" : m.status === "LIVE" ? "Canlı" : "Planlandı"}
                                        variant={m.status === "PLAYED" ? "gray" : m.status === "LIVE" ? "green" : "orange"}
                                        dot={false}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </Card>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}

            {/* ELEME AŞAMASI */}
            {tab === "eleme" && (
              <Card>
                <CardHeader title="Eleme Aşaması" subtitle="Knockout tabelası" />
                <div className="p-4">
                  <BracketView
                    matches={t.matches}
                    groups={t.groups}
                    advanceCount={t.advanceCount ?? 0}
                    winPoints={t.winPoints}
                    onMatchClick={setDetailMatch}
                  />
                </div>
              </Card>
            )}

            {/* MAÇLAR */}
            {tab === "maclar" && (() => {
              const sorted = [...t.matches].sort((a, b) => {
                if (!a.date && !b.date) return 0;
                if (!a.date) return 1;
                if (!b.date) return -1;
                return new Date(a.date).getTime() - new Date(b.date).getTime();
              });
              const played = sorted.filter(m => m.homeScore !== null).length;
              return (
                <Card>
                  <CardHeader title="Tüm Maçlar" subtitle={`${sorted.length} maç · ${played} oynandı`} />
                  {sorted.length === 0 ? (
                    <div className="p-8 text-center text-sm text-[#9CA3AF]">Henüz fikstür oluşturulmadı.</div>
                  ) : (
                    <div className="divide-y divide-[#F3F4F6]">
                      {sorted.map(m => {
                        const isPlayed = m.homeScore !== null;
                        const homeWin  = isPlayed && m.homeScore! > m.awayScore!;
                        const awayWin  = isPlayed && m.awayScore! > m.homeScore!;
                        return (
                          <div key={m.id} onClick={() => setDetailMatch(m)} className="flex items-center gap-3 px-5 py-3 flex-wrap sm:flex-nowrap cursor-pointer hover:bg-[#F8FAFC] transition-colors">
                            <div className="w-36 shrink-0 text-xs text-[#9CA3AF]">{fmtLong(m.date)}</div>
                            <span className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-full ${contextVariant(m)}`}>{matchContext(m)}</span>
                            <div className="flex-1 grid grid-cols-3 items-center gap-2 min-w-0">
                              <span className={`text-sm text-right truncate ${homeWin ? "font-bold text-[#111827]" : "font-medium text-[#6B7280]"}`}>{m.homeTeam.name}</span>
                              <span className={`text-center font-mono font-bold text-sm ${isPlayed ? "text-[#111827]" : "text-[#D1D5DB]"}`}>
                                {isPlayed ? `${m.homeScore} – ${m.awayScore}` : "— vs —"}
                              </span>
                              <span className={`text-sm truncate ${awayWin ? "font-bold text-[#111827]" : "font-medium text-[#6B7280]"}`}>{m.awayTeam.name}</span>
                            </div>
                            <StatusBadge
                              label={m.status === "PLAYED" ? "Oynandı" : m.status === "LIVE" ? "Canlı" : "Planlandı"}
                              variant={m.status === "PLAYED" ? "gray" : m.status === "LIVE" ? "green" : "orange"}
                              dot={false}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              );
            })()}

            {/* İSTATİSTİKLER */}
            {tab === "istatistik" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader title="Gol Krallığı" />
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="border-b border-[#E5E7EB]">
                        {["#", "Oyuncu", "Takım", "Gol"].map(h => (
                          <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-[#9CA3AF] uppercase">{h}</th>
                        ))}
                      </tr></thead>
                      <tbody className="divide-y divide-[#F3F4F6]">
                        {topScorers.length === 0
                          ? <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-[#9CA3AF]">Henüz gol kaydedilmedi.</td></tr>
                          : topScorers.map((p, i) => (
                            <tr key={i} className="hover:bg-[#FAFAFA]">
                              <td className="px-4 py-2.5 text-xs text-[#9CA3AF]">{i + 1}</td>
                              <td className="px-4 py-2.5 text-sm font-medium text-[#111827]">{p.name}</td>
                              <td className="px-4 py-2.5 text-xs text-[#6B7280]">{p.team}</td>
                              <td className="px-4 py-2.5 text-sm font-bold text-[#10B981]">{p.goals}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                <Card>
                  <CardHeader title="Kart İstatistikleri" />
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="border-b border-[#E5E7EB]">
                        {["#", "Oyuncu", "Takım", "Sarı", "Kırmızı"].map(h => (
                          <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-[#9CA3AF] uppercase">{h}</th>
                        ))}
                      </tr></thead>
                      <tbody className="divide-y divide-[#F3F4F6]">
                        {topCarders.length === 0
                          ? <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-[#9CA3AF]">Henüz kart kaydedilmedi.</td></tr>
                          : topCarders.map((p, i) => (
                            <tr key={i} className="hover:bg-[#FAFAFA]">
                              <td className="px-4 py-2.5 text-xs text-[#9CA3AF]">{i + 1}</td>
                              <td className="px-4 py-2.5 text-sm font-medium text-[#111827]">{p.name}</td>
                              <td className="px-4 py-2.5 text-xs text-[#6B7280]">{p.team}</td>
                              <td className="px-4 py-2.5">
                                {p.yellow > 0 && <div className="flex items-center gap-1"><div className="w-3 h-4 bg-[#F59E0B] rounded-sm" /><span className="text-xs">{p.yellow}</span></div>}
                              </td>
                              <td className="px-4 py-2.5">
                                {p.red > 0 && <div className="flex items-center gap-1"><div className="w-3 h-4 bg-[#EF4444] rounded-sm" /><span className="text-xs">{p.red}</span></div>}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* TAKIMLAR */}
            {tab === "takimlar" && (
              <TeamTab pendingRegs={pendingRegs} approvedRegs={approvedRegs} />
            )}
          </div>

        </div>
      </div>

      {detailMatch && (
        <MatchDetailModal
          match={detailMatch}
          tournament={t}
          onClose={() => setDetailMatch(null)}
        />
      )}
    </div>
  );
}

// ── Takımlar sekmesi ──
const POSITION_LABEL: Record<string, string> = {
  Kaleci: "Kaleci", Defans: "Defans", "Orta Saha": "Orta Saha", Forvet: "Forvet",
  GK: "Kaleci", DEF: "Defans", MID: "Orta Saha", FWD: "Forvet",
};
const PLAYER_STATUS_CLS: Record<string, string> = {
  ACTIVE: "bg-[#ECFDF5] text-[#059669]",
  SUSPENDED: "bg-[#FEF3C7] text-[#D97706]",
  INJURED: "bg-[#FEF2F2] text-[#DC2626]",
};
const PLAYER_STATUS_LABEL: Record<string, string> = { ACTIVE: "Aktif", SUSPENDED: "Cezalı", INJURED: "Sakatık" };

function TeamTab({
  pendingRegs,
  approvedRegs,
}: {
  pendingRegs: Tournament["registrations"];
  approvedRegs: Tournament["registrations"];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function PlayerList({ players }: { players: Tournament["registrations"][number]["team"]["players"] }) {
    if (players.length === 0) return <p className="text-xs text-[#9CA3AF]">Bu takımda oyuncu yok.</p>;
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {players.map(p => (
          <div key={p.id} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-[#E5E7EB]">
            <div className="w-7 h-7 bg-[#0F1F47] rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white text-[10px] font-bold">{p.number ?? "—"}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-[#111827] truncate">{p.name}</div>
              <div className="text-[10px] text-[#9CA3AF]">{POSITION_LABEL[p.position ?? ""] ?? p.position ?? "—"}</div>
            </div>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${PLAYER_STATUS_CLS[p.status] ?? PLAYER_STATUS_CLS.ACTIVE}`}>
              {PLAYER_STATUS_LABEL[p.status] ?? "Aktif"}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {pendingRegs.length > 0 && (
        <Card>
          <CardHeader title="Onay Bekleyen Başvurular" subtitle={`${pendingRegs.length} başvuru`} />
          <div className="divide-y divide-[#F3F4F6]">
            {pendingRegs.map(r => {
              const open = expandedId === r.id;
              return (
                <div key={r.id}>
                  <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-[#FAFAFA] transition-colors select-none"
                    onClick={() => setExpandedId(open ? null : r.id)}>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-[#111827]">{r.team.name}</div>
                      <div className="text-xs text-[#9CA3AF]">{r.team._count.players} oyuncu · Kpt: {r.team.captain.name}</div>
                    </div>
                    <span className="text-[#9CA3AF] shrink-0">{open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</span>
                  </div>
                  {open && (
                    <div className="bg-[#F8FAFC] border-t border-[#F3F4F6] px-5 py-3">
                      <PlayerList players={r.team.players} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card>
        <CardHeader title="Kayıtlı Takımlar" subtitle={`${approvedRegs.length} takım onaylı`} />
        <div className="divide-y divide-[#F3F4F6]">
          {approvedRegs.length === 0 && (
            <div className="p-8 text-center text-sm text-[#9CA3AF]">Henüz onaylı takım yok.</div>
          )}
          {approvedRegs.map(r => {
            const open = expandedId === r.id;
            return (
              <div key={r.id}>
                <div className="flex items-center gap-4 px-5 py-3 cursor-pointer hover:bg-[#FAFAFA] transition-colors select-none"
                  onClick={() => setExpandedId(open ? null : r.id)}>
                  <div className="w-9 h-9 bg-[#EFF6FF] rounded-lg flex items-center justify-center shrink-0">
                    <Users size={15} className="text-[#3B82F6]" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[#111827]">{r.team.name}</div>
                    <div className="text-xs text-[#9CA3AF]">{r.team._count.players} oyuncu · {r.groupTeam?.group?.name ?? "Grup atanmadı"}</div>
                  </div>
                  <StatusBadge label="Onaylı" variant="green" dot={false} />
                  <span className="text-[#9CA3AF]">{open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</span>
                </div>
                {open && (
                  <div className="bg-[#F8FAFC] border-t border-[#F3F4F6] px-5 py-3">
                    <PlayerList players={r.team.players} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ── Puan tablosu ──
function StandingsTable({
  rows,
  advanceCount,
  tournamentId,
  teamStatsBase,
}: {
  rows: { team: { id: string; name: string }; played: number; wins: number; draws: number; losses: number; goalsFor: number; goalsAgainst: number; points: number }[];
  advanceCount: number;
  tournamentId?: string;
  teamStatsBase?: string;
}) {
  const router = useRouter();
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E7EB]">
              {["#", "Takım", "O", "G", "B", "M", "AG", "YG", "Av", "P"].map(h => (
                <th key={h} className={`px-3 py-2.5 text-xs font-semibold text-[#9CA3AF] uppercase ${h === "Takım" ? "text-left" : "text-center"}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F4F6]">
            {rows.length === 0 ? (
              <tr><td colSpan={10} className="px-4 py-6 text-center text-sm text-[#9CA3AF]">Henüz maç oynanmadı.</td></tr>
            ) : rows.map((r, i) => {
              const qualifying = advanceCount > 0 && i < advanceCount;
              const av = r.goalsFor - r.goalsAgainst;
              const href = tournamentId && teamStatsBase ? `${teamStatsBase}/${tournamentId}/teams/${r.team.id}` : undefined;
              return (
                <tr
                  key={r.team.id}
                  onClick={() => href && router.push(href)}
                  className={`hover:bg-[#FAFAFA] transition-colors ${qualifying ? "bg-[#FFFBEB]/50" : ""} ${href ? "cursor-pointer" : ""}`}
                >
                  <td className="px-3 py-2.5 text-center">
                    <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-xs font-bold ${qualifying ? "bg-[#FEF3C7] text-[#D97706]" : "bg-[#F3F4F6] text-[#9CA3AF]"}`}>{i + 1}</span>
                  </td>
                  <td className="px-3 py-2.5 text-sm font-medium text-[#111827]">{r.team.name}</td>
                  {[r.played, r.wins, r.draws, r.losses, r.goalsFor, r.goalsAgainst].map((v, j) => (
                    <td key={j} className="px-3 py-2.5 text-center text-xs text-[#6B7280]">{v}</td>
                  ))}
                  <td className="px-3 py-2.5 text-center text-xs font-medium text-[#374151]">{av > 0 ? `+${av}` : av}</td>
                  <td className="px-3 py-2.5 text-center text-sm font-bold text-[#111827]">{r.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {advanceCount > 0 && rows.length > 0 && (
        <div className="px-4 py-2 flex items-center gap-2 border-t border-[#F3F4F6]">
          <div className="w-3 h-3 rounded-sm bg-[#FEF3C7] border border-[#F59E0B]/30" />
          <span className="text-xs text-[#9CA3AF]">İlk {advanceCount} takım elemeye geçer</span>
        </div>
      )}
    </>
  );
}
