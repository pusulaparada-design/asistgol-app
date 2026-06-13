"use client";
import { useState } from "react";
import { MapPin, Calendar, Trophy, Users, Swords, BarChart2, CheckCircle, ArrowRight, GitBranch } from "lucide-react";
import { Card, CardHeader, ProgressBar, StatusBadge } from "@/components/ui/PageShell";
import { BracketView } from "@/components/tournament/BracketView";
import type { getTournament } from "@/lib/actions/tournament";
import type { getMyTeams } from "@/lib/actions/team";
import { registerTeamToTournament } from "@/lib/actions/team";

type Tournament = NonNullable<Awaited<ReturnType<typeof getTournament>>>;
type MyTeams = Awaited<ReturnType<typeof getMyTeams>>;
type TMatch = Tournament["matches"][number];

const FORMAT_LABELS: Record<string, string> = {
  GROUP_KNOCKOUT: "Grup + Eleme",
  GROUP_ONLY:     "Sadece Lig",
  KNOCKOUT_ONLY:  "Sadece Eleme",
};
const STATUS_MAP: Record<string, { label: string; variant: "green"|"blue"|"gray"|"orange" }> = {
  REGISTRATION: { label: "Kayıt Açık",    variant: "green"  },
  ACTIVE:       { label: "Aktif",         variant: "blue"   },
  COMPLETED:    { label: "Tamamlandı",    variant: "gray"   },
  DRAFT:        { label: "Taslak",        variant: "orange" },
};

function fmt(d: Date|null|undefined) {
  if (!d) return "—";
  return d.toLocaleDateString("tr-TR", { day:"numeric", month:"long", year:"numeric" });
}

const ROUND_LABELS: Record<string, string> = {
  ROUND_OF_32: "Son 32", ROUND_OF_16: "Son 16",
  QUARTER_FINAL: "Çeyrek Final", SEMI_FINAL: "Yarı Final",
  FINAL: "Final", THIRD_PLACE: "3. Yer Maçı",
};
function matchContext(m: TMatch): string {
  if (m.group?.name) return m.group.name;
  if (m.round) return ROUND_LABELS[m.round] ?? m.round;
  return "Eleme";
}
function contextVariant(m: TMatch): string {
  if (m.group?.name) return "bg-[#EFF6FF] text-[#3B82F6]";
  const r = m.round ?? "";
  if (r === "FINAL") return "bg-[#FEF3C7] text-[#D97706]";
  if (r === "SEMI_FINAL" || r === "QUARTER_FINAL") return "bg-[#FFF7ED] text-[#EA580C]";
  return "bg-[#F4F6F9] text-[#6B7280]";
}

function calcStandings(groupId: string, groupTeams: Tournament["groups"][number]["teams"], matches: TMatch[], winPts: number) {
  const rows = groupTeams.map(gt => ({
    team: gt.team,
    played:0, wins:0, draws:0, losses:0,
    goalsFor:0, goalsAgainst:0, points:0,
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
    else                                { home.draws++; home.points++; away.draws++; away.points++; }
  }
  return rows.sort((a,b) => b.points - a.points || (b.goalsFor-b.goalsAgainst)-(a.goalsFor-a.goalsAgainst));
}

const TABS = [
  { key:"gruplar",    label:"Gruplar",         icon: Users      },
  { key:"eleme",      label:"Eleme Aşaması",   icon: GitBranch  },
  { key:"maclar",     label:"Maçlar",          icon: Swords     },
  { key:"istatistik", label:"İstatistikler",   icon: BarChart2  },
] as const;
type TabKey = typeof TABS[number]["key"];

export default function TournamentDetailClient({
  tournament: t,
  myTeams,
}: {
  tournament: Tournament;
  myTeams: MyTeams;
}) {
  const [tab, setTab] = useState<TabKey>("gruplar");
  const [activeGroup, setActiveGroup] = useState(t.groups[0]?.id ?? "");

  // Kayıt state
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(myTeams[0]?.id ?? "");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const s = STATUS_MAP[t.status] ?? STATUS_MAP.DRAFT;
  const approvedRegs = t.registrations.filter(r => r.status === "APPROVED");
  const spotsLeft = t.maxTeams - approvedRegs.length;
  const isUrgent = spotsLeft <= 2 && t.status === "REGISTRATION";
  const playedMatches = t.matches.filter(m => m.homeScore !== null);

  const alreadyRegisteredTeamIds = new Set(t.registrations.map(r => r.team.id));
  const availableTeams = myTeams.filter(tm => !alreadyRegisteredTeamIds.has(tm.id));
  const myRegistration = t.registrations.find(r => myTeams.some(tm => tm.id === r.team.id));

  // İstatistikler
  const scorers: Record<string, { name: string; team: string; goals: number }> = {};
  const carders: Record<string, { name: string; yellow: number; red: number }> = {};
  for (const m of t.matches) {
    for (const g of m.goals) {
      if (!scorers[g.playerId]) scorers[g.playerId] = { name: g.player.name, team: g.teamId === m.homeTeamId ? m.homeTeam.name : m.awayTeam.name, goals: 0 };
      scorers[g.playerId].goals++;
    }
    for (const c of m.cards) {
      if (!carders[c.playerId]) carders[c.playerId] = { name: c.player.name, yellow: 0, red: 0 };
      if (c.type === "YELLOW") carders[c.playerId].yellow++;
      else carders[c.playerId].red++;
    }
  }
  const topScorers = Object.values(scorers).sort((a,b) => b.goals - a.goals).slice(0, 10);
  const topCarders = Object.values(carders).sort((a,b) => (b.yellow + b.red*2) - (a.yellow + a.red*2)).slice(0, 10);

  const handleRegister = async () => {
    if (!selectedTeamId) { setError("Lütfen bir takım seçin."); return; }
    setLoading(true); setError("");
    try {
      await registerTeamToTournament(selectedTeamId, t.id, note || undefined);
      setRegistered(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Bir hata oluştu.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9]">
      {/* ── HEADER BANNER ── */}
      <div className="bg-[#0F1F47] text-white px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-extrabold mb-1">{t.name}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/70">
                {t.city && <span className="flex items-center gap-1"><MapPin size={13}/> {t.city}{t.venue ? ` · ${t.venue}` : ""}</span>}
                <span className="flex items-center gap-1"><Calendar size={13}/> {fmt(t.startDate)} – {fmt(t.endDate)}</span>
                {t.prize && <span className="flex items-center gap-1"><Trophy size={13}/> {t.prize}</span>}
                <span className="text-white/50">{t.organizer.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <StatusBadge label={s.label} variant={s.variant} dot={false} />
              <div className="text-sm text-white/70">{approvedRegs.length}/{t.maxTeams} takım</div>
              {myRegistration && (
                <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-medium">
                  {myRegistration.status === "APPROVED" ? "✓ Kayıtlısınız" : "⏳ Onay Bekliyor"}
                </span>
              )}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label:"Kayıtlı Takım",  val:`${approvedRegs.length}/${t.maxTeams}` },
              { label:"Oynanan Maç",    val:`${playedMatches.length}/${t._count.matches}` },
              { label:"Toplam Gol",     val: t.matches.reduce((s,m) => s + m.goals.length, 0) },
              { label:"Format",         val: FORMAT_LABELS[t.format] ?? t.format },
            ].map(st => (
              <div key={st.label} className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-xl font-bold">{st.val}</div>
                <div className="text-xs text-white/60 mt-0.5">{st.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TAB BAR ── */}
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
              <tb.icon size={14}/> {tb.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── İÇERİK ── */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* ANA İÇERİK */}
          <div className="xl:col-span-2 space-y-5">

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
                            <CardHeader title={`${g.name} — Puan Tablosu`} subtitle={`${g.teams.length} takım`}/>
                            <StandingsTable rows={rows} advanceCount={t.advanceCount ?? 0}/>
                          </Card>
                          {gMatches.length > 0 && (
                            <Card>
                              <CardHeader title="Maçlar" subtitle={`${gMatches.length} maç`}/>
                              <div className="divide-y divide-[#F3F4F6]">
                                {gMatches.map(m => {
                                  const isPlayed = m.homeScore !== null;
                                  const homeWin = isPlayed && m.homeScore! > m.awayScore!;
                                  const awayWin = isPlayed && m.awayScore! > m.homeScore!;
                                  return (
                                    <div key={m.id} className="flex items-center gap-3 px-5 py-3 flex-wrap sm:flex-nowrap">
                                      <div className="w-32 shrink-0">
                                        <div className="text-xs text-[#9CA3AF]">{m.date ? fmt(m.date) : <span className="text-[#D1D5DB]">—</span>}</div>
                                        {m.time && <div className="text-xs font-medium text-[#6B7280]">{m.time}</div>}
                                      </div>
                                      <span className="shrink-0 text-[10px] bg-[#F4F6F9] text-[#6B7280] px-2 py-0.5 rounded font-semibold whitespace-nowrap">{m.round ?? "—"}</span>
                                      <div className="flex-1 grid grid-cols-3 items-center gap-2 min-w-0">
                                        <span className={`text-sm text-right truncate ${homeWin ? "font-bold text-[#111827]" : "font-medium text-[#6B7280]"}`}>{m.homeTeam.name}</span>
                                        <span className={`text-center font-mono font-bold text-sm ${isPlayed ? "text-[#111827]" : "text-[#D1D5DB]"}`}>
                                          {isPlayed ? `${m.homeScore} – ${m.awayScore}` : "– vs –"}
                                        </span>
                                        <span className={`text-sm truncate ${awayWin ? "font-bold text-[#111827]" : "font-medium text-[#6B7280]"}`}>{m.awayTeam.name}</span>
                                      </div>
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
                  <BracketView matches={t.matches} />
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
              const playedCount = sorted.filter(m => m.homeScore !== null).length;
              return (
                <Card>
                  <CardHeader
                    title="Tüm Maçlar"
                    subtitle={`${sorted.length} maç · ${playedCount} oynandı`}
                  />
                  {sorted.length === 0 ? (
                    <div className="p-8 text-center text-sm text-[#9CA3AF]">Henüz fikstür oluşturulmadı.</div>
                  ) : (
                    <div className="divide-y divide-[#F3F4F6]">
                      {sorted.map(m => {
                        const isPlayed = m.homeScore !== null;
                        const homeWin  = isPlayed && m.homeScore! > m.awayScore!;
                        const awayWin  = isPlayed && m.awayScore! > m.homeScore!;
                        return (
                          <div key={m.id} className="flex items-center gap-3 px-5 py-3 flex-wrap sm:flex-nowrap">
                            <div className="w-36 shrink-0 text-xs text-[#9CA3AF]">
                              {fmt(m.date)}
                            </div>
                            <span className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-full ${contextVariant(m)}`}>
                              {matchContext(m)}
                            </span>
                            <div className="flex-1 grid grid-cols-3 items-center gap-2 min-w-0">
                              <span className={`text-sm text-right truncate ${homeWin ? "font-bold text-[#111827]" : "font-medium text-[#6B7280]"}`}>
                                {m.homeTeam.name}
                              </span>
                              <span className={`text-center font-mono font-bold text-sm ${isPlayed ? "text-[#111827]" : "text-[#D1D5DB]"}`}>
                                {isPlayed ? `${m.homeScore} – ${m.awayScore}` : "— vs —"}
                              </span>
                              <span className={`text-sm truncate ${awayWin ? "font-bold text-[#111827]" : "font-medium text-[#6B7280]"}`}>
                                {m.awayTeam.name}
                              </span>
                            </div>
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
              <div className="space-y-5">
                <Card>
                  <CardHeader title="Gol Krallığı"/>
                  <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b border-[#E5E7EB]">
                      {["#","Oyuncu","Takım","Gol"].map(h => <th key={h} className={`px-4 py-2.5 text-xs font-semibold text-[#9CA3AF] uppercase ${h==="Oyuncu"||h==="Takım"?"text-left":"text-center"}`}>{h}</th>)}
                    </tr></thead>
                    <tbody className="divide-y divide-[#F3F4F6]">
                      {topScorers.length === 0
                        ? <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-[#9CA3AF]">Henüz gol kaydedilmedi.</td></tr>
                        : topScorers.map((p,i) => (
                          <tr key={i} className="hover:bg-[#FAFAFA]">
                            <td className="px-4 py-2.5 text-xs text-[#9CA3AF] w-8">{i+1}</td>
                            <td className="px-4 py-2.5 text-sm font-medium text-[#111827]">{p.name}</td>
                            <td className="px-4 py-2.5 text-xs text-[#6B7280]">{p.team}</td>
                            <td className="px-4 py-2.5 text-sm font-bold text-[#10B981] text-center">{p.goals}</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                  </div>
                </Card>

                <Card>
                  <CardHeader title="Kart İstatistikleri"/>
                  <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b border-[#E5E7EB]">
                      {["#","Oyuncu","Sarı","Kırmızı"].map(h => <th key={h} className={`px-4 py-2.5 text-xs font-semibold text-[#9CA3AF] uppercase ${h==="Oyuncu"?"text-left":"text-center"}`}>{h}</th>)}
                    </tr></thead>
                    <tbody className="divide-y divide-[#F3F4F6]">
                      {topCarders.length === 0
                        ? <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-[#9CA3AF]">Henüz kart kaydedilmedi.</td></tr>
                        : topCarders.map((p,i) => (
                          <tr key={i} className="hover:bg-[#FAFAFA]">
                            <td className="px-4 py-2.5 text-xs text-[#9CA3AF] w-8">{i+1}</td>
                            <td className="px-4 py-2.5 text-sm font-medium text-[#111827]">{p.name}</td>
                            <td className="px-4 py-2.5 text-center">
                              {p.yellow > 0 ? <span className="inline-flex items-center gap-1"><span className="w-3 h-4 bg-[#F59E0B] rounded-sm inline-block"/>{p.yellow}</span> : <span className="text-[#D1D5DB]">—</span>}
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              {p.red > 0 ? <span className="inline-flex items-center gap-1"><span className="w-3 h-4 bg-[#EF4444] rounded-sm inline-block"/>{p.red}</span> : <span className="text-[#D1D5DB]">—</span>}
                            </td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* SAĞ PANEL — Kayıt */}
          <div className="space-y-5">
            {t.status === "REGISTRATION" && !myRegistration && (
              <Card>
                <div className="p-5">
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#6B7280]">Doluluk</span>
                      <span className={`font-semibold ${isUrgent ? "text-[#EF4444]" : "text-[#374151]"}`}>
                        {isUrgent ? `Son ${spotsLeft} yer!` : `${spotsLeft} yer kaldı`}
                      </span>
                    </div>
                    <ProgressBar value={approvedRegs.length} max={t.maxTeams} color={isUrgent ? "red" : "gold"}/>
                  </div>

                  {registered ? (
                    <div className="text-center py-2">
                      <CheckCircle size={28} className="text-[#10B981] mx-auto mb-2"/>
                      <p className="text-sm font-semibold text-[#111827]">Başvurunuz Alındı!</p>
                      <p className="text-xs text-[#9CA3AF] mt-1">Organizatör onayından sonra bildirim gönderilecektir.</p>
                    </div>
                  ) : availableTeams.length === 0 ? (
                    <p className="text-sm text-[#9CA3AF] text-center py-2">
                      {myTeams.length === 0 ? "Kayıt için önce bir takım oluşturun." : "Tüm takımlarınız bu turnuvaya zaten kayıtlı."}
                    </p>
                  ) : !registering ? (
                    <button onClick={() => setRegistering(true)}
                      className="w-full flex items-center justify-center gap-2 bg-[#0F1F47] text-white font-semibold py-3 rounded-xl hover:bg-[#1A2F5A] transition-colors">
                      Takımımı Kaydettir <ArrowRight size={16}/>
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-[#374151] mb-1.5">Takım seçin</label>
                        <select value={selectedTeamId} onChange={e => setSelectedTeamId(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]">
                          {availableTeams.map(tm => (
                            <option key={tm.id} value={tm.id}>{tm.name} ({tm._count.players} oyuncu)</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#374151] mb-1.5">Not (isteğe bağlı)</label>
                        <textarea rows={2} value={note} onChange={e => setNote(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B] resize-none"
                          placeholder="Organizatöre ek bilgi..."/>
                      </div>
                      {error && <p className="text-xs text-red-500">{error}</p>}
                      <button onClick={handleRegister} disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-[#10B981] text-white font-semibold py-2.5 rounded-xl hover:bg-[#059669] transition-colors text-sm disabled:opacity-50">
                        <CheckCircle size={15}/> {loading ? "Gönderiliyor..." : "Başvuruyu Gönder"}
                      </button>
                      <button onClick={() => setRegistering(false)} disabled={loading}
                        className="w-full text-sm text-[#9CA3AF] hover:text-[#6B7280]">İptal</button>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {myRegistration && (
              <Card>
                <div className="p-5 text-center">
                  <div className={`w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center ${myRegistration.status === "APPROVED" ? "bg-[#ECFDF5]" : "bg-[#FEF3C7]"}`}>
                    {myRegistration.status === "APPROVED"
                      ? <CheckCircle size={20} className="text-[#10B981]"/>
                      : <span className="text-lg">⏳</span>
                    }
                  </div>
                  <p className="text-sm font-semibold text-[#111827]">
                    {myRegistration.status === "APPROVED" ? "Bu turnuvaya kayıtlısınız" : "Başvurunuz inceleniyor"}
                  </p>
                  <p className="text-xs text-[#9CA3AF] mt-1">{myRegistration.team.name}</p>
                </div>
              </Card>
            )}

            <Card>
              <CardHeader title="Turnuva Detayı" border={false}/>
              <div className="px-4 pb-4 space-y-0">
                {[
                  { label:"Organizatör",   val: t.organizer.name },
                  { label:"Format",        val: FORMAT_LABELS[t.format] ?? t.format },
                  { label:"Maks Takım",    val: `${t.maxTeams} takım` },
                  { label:"Kayıt Ücreti",  val: t.fee ? `₺${t.fee}` : "Ücretsiz" },
                  { label:"Son Kayıt",     val: fmt(t.deadline) },
                ].map(row => (
                  <div key={row.label} className="flex justify-between py-2 border-b border-[#F3F4F6] last:border-0">
                    <span className="text-xs text-[#9CA3AF]">{row.label}</span>
                    <span className="text-xs font-semibold text-[#111827]">{row.val}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function StandingsTable({ rows, advanceCount }: {
  rows: { team: { id: string; name: string }; played:number; wins:number; draws:number; losses:number; goalsFor:number; goalsAgainst:number; points:number }[];
  advanceCount: number;
}) {
  return (
    <>
      <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#E5E7EB]">
            {["#","Takım","O","G","B","M","AG","YG","Av","P"].map(h => (
              <th key={h} className={`px-3 py-2.5 text-xs font-semibold text-[#9CA3AF] uppercase ${h==="Takım"?"text-left":"text-center"}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F3F4F6]">
          {rows.length === 0 ? (
            <tr><td colSpan={10} className="px-4 py-6 text-center text-sm text-[#9CA3AF]">Henüz maç oynanmadı.</td></tr>
          ) : rows.map((r, i) => {
            const qualifying = advanceCount > 0 && i < advanceCount;
            const av = r.goalsFor - r.goalsAgainst;
            return (
              <tr key={r.team.id} className={`hover:bg-[#FAFAFA] ${qualifying ? "bg-[#FFFBEB]/50" : ""}`}>
                <td className="px-3 py-2.5 text-center">
                  <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-xs font-bold ${qualifying ? "bg-[#FEF3C7] text-[#D97706]" : "bg-[#F3F4F6] text-[#9CA3AF]"}`}>{i+1}</span>
                </td>
                <td className="px-3 py-2.5 text-sm font-medium text-[#111827]">{r.team.name}</td>
                {[r.played, r.wins, r.draws, r.losses, r.goalsFor, r.goalsAgainst].map((v,j) => (
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
          <div className="w-3 h-3 rounded-sm bg-[#FEF3C7] border border-[#F59E0B]/30"/>
          <span className="text-xs text-[#9CA3AF]">İlk {advanceCount} takım elemeye geçer</span>
        </div>
      )}
    </>
  );
}
