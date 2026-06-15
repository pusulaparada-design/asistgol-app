"use client";

import { useState, useTransition, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Play, Save, AlertTriangle, CheckCircle, RefreshCw, Calendar, Zap } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/PageShell";
import { saveGeneratedFixtures, rescheduleMatches, getTournamentMatches, generateKnockoutFixtures } from "@/lib/actions/tournament";
import type { getGroupsWithTeams } from "@/lib/actions/tournament";
import type { MatchWeek } from "./ScheduleTab";

type Groups = Awaited<ReturnType<typeof getGroupsWithTeams>>;
type Matches = Awaited<ReturnType<typeof getTournamentMatches>>;
type TMatch = Matches[number];

interface GeneratedMatch {
  homeTeamId: string;
  homeTeamName: string;
  awayTeamId: string;
  awayTeamName: string;
  groupId: string;
  groupName: string;
  round: string;
  date: string | null;
  time: string | null;
}

function bergerRounds(teams: { id: string; name: string }[]): [string, string, string, string][][] {
  const n = teams.length;
  if (n < 2) return [];
  const t = n % 2 === 0 ? [...teams] : [...teams, { id: "__BYE__", name: "BYE" }];
  const m = t.length;
  const rest = t.slice(1);
  const rounds: [string, string, string, string][][] = [];

  for (let r = 0; r < m - 1; r++) {
    const rotated = r === 0 ? [...rest] : [...rest.slice(-r), ...rest.slice(0, rest.length - r)];
    const slot = [t[0], ...rotated];
    const round: [string, string, string, string][] = [];
    for (let i = 0; i < m / 2; i++) {
      const home = slot[i];
      const away = slot[m - 1 - i];
      if (home.id !== "__BYE__" && away.id !== "__BYE__") {
        round.push([home.id, home.name, away.id, away.name]);
      }
    }
    rounds.push(round);
  }
  return rounds;
}

function buildFixtures(groups: Groups): GeneratedMatch[] {
  const groupRounds: GeneratedMatch[][][] = groups.map(group => {
    const teams = group.teams.map(gt => ({ id: gt.team.id, name: gt.team.name }));
    return bergerRounds(teams).map((round, ri) =>
      round.map(([hId, hName, aId, aName]) => ({
        homeTeamId: hId,
        homeTeamName: hName,
        awayTeamId: aId,
        awayTeamName: aName,
        groupId: group.id,
        groupName: group.name,
        round: `Hafta ${ri + 1}`,
        date: null,
        time: null,
      }))
    );
  });

  const maxRounds = Math.max(...groupRounds.map(g => g.length), 0);
  const all: GeneratedMatch[] = [];
  for (let r = 0; r < maxRounds; r++) {
    for (const gRounds of groupRounds) {
      if (gRounds[r]) all.push(...gRounds[r]);
    }
  }
  return all;
}

function buildWeekSlots(weeks: MatchWeek[]): { date: string; time: string }[][] {
  return weeks.map(week => {
    const slots: { date: string; time: string }[] = [];
    for (const day of [...week.days].sort((a, b) => a.date.localeCompare(b.date))) {
      for (const t of [...day.times].sort()) {
        slots.push({ date: day.date, time: t });
      }
    }
    return slots;
  });
}

function fmtDate(date: string) {
  return new Date(date + "T12:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

function toDateInput(d: Date | string | null | undefined): string {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

const TR_MONTHS = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
const TR_DAYS_SHORT = ["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"];

function calendarDays(year: number, month: number): (number | null)[] {
  const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
  const offset = firstDow === 0 ? 6 : firstDow - 1;  // Mon=0
  const total = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= total; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/* value: YYYY-MM-DD, onChange: YYYY-MM-DD */
function TurkishDatePicker({ value, onChange, disabled }: {
  value: string; onChange: (v: string) => void; disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => value ? +value.slice(0, 4) : new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => value ? +value.slice(5, 7) - 1 : new Date().getMonth());
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const fn = (e: MouseEvent) => { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open]);

  const display = value ? `${value.slice(8)}/${value.slice(5, 7)}/${value.slice(0, 4)}` : "";

  const handleText = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
    if (v.length > 5) v = v.slice(0, 5) + "/" + v.slice(5, 9);
    if (v.length === 10) { const [d, m, y] = v.split("/"); onChange(`${y}-${m}-${d}`); }
    else if (v.length === 0) onChange("");
  };

  const prevMonth = () => viewMonth === 0 ? (setViewMonth(11), setViewYear(y => y - 1)) : setViewMonth(m => m - 1);
  const nextMonth = () => viewMonth === 11 ? (setViewMonth(0), setViewYear(y => y + 1)) : setViewMonth(m => m + 1);

  const selectDay = (d: number) => {
    onChange(`${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    setOpen(false);
  };

  const selY = value ? +value.slice(0, 4) : null;
  const selM = value ? +value.slice(5, 7) - 1 : null;
  const selD = value ? +value.slice(8, 10) : null;
  const today = new Date();

  const baseCls = "text-xs border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]";

  if (disabled) return (
    <input type="text" value={display} disabled
      className={`${baseCls} w-[110px] bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed border-[#E5E7EB]`} />
  );

  return (
    <div className="relative inline-block" ref={wrapRef}>
      <div className="relative inline-flex items-center">
        <input type="text" value={display} onChange={handleText} maxLength={10} placeholder="GG/AA/YYYY"
          onFocus={() => setOpen(true)}
          className={`${baseCls} w-[125px] pr-7 border-[#E5E7EB] text-[#111827]`} />
        <button type="button" onClick={() => setOpen(o => !o)} className="absolute right-2 text-[#9CA3AF] hover:text-[#374151]">
          <Calendar size={13} />
        </button>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 left-0 bg-white border border-[#E5E7EB] rounded-xl shadow-xl p-3 w-[228px]">
          <div className="flex items-center justify-between mb-2">
            <button type="button" onClick={prevMonth} className="w-7 h-7 flex items-center justify-center hover:bg-[#F3F4F6] rounded-lg text-[#6B7280] text-base font-bold">‹</button>
            <span className="text-xs font-semibold text-[#111827]">{TR_MONTHS[viewMonth]} {viewYear}</span>
            <button type="button" onClick={nextMonth} className="w-7 h-7 flex items-center justify-center hover:bg-[#F3F4F6] rounded-lg text-[#6B7280] text-base font-bold">›</button>
          </div>
          <div className="grid grid-cols-7 mb-1">
            {TR_DAYS_SHORT.map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-[#9CA3AF] py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-0.5">
            {calendarDays(viewYear, viewMonth).map((d, i) => {
              const isSel = d !== null && d === selD && viewMonth === selM && viewYear === selY;
              const isToday = d !== null && d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
              return (
                <button key={i} type="button" disabled={d === null}
                  onClick={() => d !== null && selectDay(d)}
                  className={`text-xs h-7 w-full rounded-lg text-center transition-colors ${
                    d === null ? "" :
                    isSel ? "bg-[#0F1F47] text-white font-bold" :
                    isToday ? "bg-[#EFF6FF] text-[#2563EB] font-semibold" :
                    "hover:bg-[#F3F4F6] text-[#374151]"
                  }`}
                >{d ?? ""}</button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function TimeInputCell({ value, onChange, disabled }: {
  value: string; onChange: (v: string) => void; disabled?: boolean;
}) {
  const handleText = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 2) v = v.slice(0, 2) + ":" + v.slice(2, 4);
    onChange(v.slice(0, 5));
  };

  return (
    <input
      type="text"
      value={value}
      onChange={handleText}
      maxLength={5}
      placeholder="SS:DD"
      disabled={disabled}
      className={`text-xs border rounded-lg px-2 py-1.5 w-[72px] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] ${
        disabled
          ? "bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed border-[#E5E7EB]"
          : "border-[#E5E7EB] text-[#111827]"
      }`}
    />
  );
}

/* ── Mevcut fikstür düzenleme bölümü ─────────────────────────── */
function EditableFixture({ matches, tournamentId }: { matches: TMatch[]; tournamentId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [changes, setChanges] = useState<Map<string, { date: string; time: string }>>(new Map());
  const [saved, setSaved] = useState(false);

  const sorted = [...matches].sort((a, b) => {
    const da = a.date ? new Date(a.date).getTime() : 0;
    const db = b.date ? new Date(b.date).getTime() : 0;
    if (da !== db) return da - db;
    return (a.time ?? "").localeCompare(b.time ?? "");
  });

  const rounds = [...new Set(sorted.map(m => m.round ?? ""))].filter(Boolean);

  function handleChange(m: TMatch, field: "date" | "time", value: string) {
    const origDate = toDateInput(m.date);
    const origTime = m.time ?? "";

    setChanges(prev => {
      const next = new Map(prev);
      const cur = next.get(m.id);
      const newDate = field === "date" ? value : (cur?.date ?? origDate);
      const newTime = field === "time" ? value : (cur?.time ?? origTime);
      if (newDate === origDate && newTime === origTime) {
        next.delete(m.id);
      } else {
        next.set(m.id, { date: newDate, time: newTime });
      }
      return next;
    });
    setSaved(false);
  }

  function handleUpdate() {
    if (changes.size === 0) return;
    startTransition(async () => {
      const payload = Array.from(changes.entries()).map(([matchId, { date, time }]) => ({
        matchId,
        date: date || null,
        time: time || null,
      }));
      await rescheduleMatches(tournamentId, payload);
      setChanges(new Map());
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader
        title="Mevcut Fikstür"
        subtitle={`${matches.length} maç · düzenlemek için tarih/saat alanlarını değiştirin`}
      />

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
              {["Tur", "Ev Sahibi", "", "Deplasman", "Tarih", "Saat"].map((h, i) => (
                <th key={i} className={`px-3 py-2.5 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider ${
                  i === 1 ? "text-right" : i === 2 ? "text-center" : "text-left"
                }`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F4F6]">
            {rounds.map(round => {
              const roundMatches = sorted.filter(m => (m.round ?? "") === round);
              return roundMatches.map((m, idx) => {
                const isPlayed = m.status === "PLAYED" || m.status === "LIVE";
                const cur = changes.get(m.id);
                const dateVal = cur ? cur.date : toDateInput(m.date);
                const timeVal = cur ? cur.time : (m.time ?? "");
                const changed = changes.has(m.id);

                return (
                  <tr key={m.id} className={`hover:bg-[#FAFAFA] ${changed ? "bg-[#FFFBEB]" : ""}`}>
                    {idx === 0 && (
                      <td
                        rowSpan={roundMatches.length}
                        className="px-3 py-2.5 align-top"
                      >
                        <span className="text-[10px] bg-[#EFF6FF] text-[#2563EB] px-2 py-0.5 rounded-md font-semibold whitespace-nowrap">
                          {round}
                        </span>
                      </td>
                    )}
                    <td className="px-3 py-2.5 text-sm font-medium text-[#111827] text-right whitespace-nowrap">{m.homeTeam.name}</td>
                    <td className="px-3 py-2.5 text-xs text-[#D1D5DB] text-center font-bold">–</td>
                    <td className="px-3 py-2.5 text-sm font-medium text-[#111827] whitespace-nowrap">{m.awayTeam.name}</td>
                    <td className="px-3 py-2.5">
                      <TurkishDatePicker
                        value={dateVal}
                        disabled={isPlayed}
                        onChange={v => handleChange(m, "date", v)}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <TimeInputCell
                        value={timeVal}
                        disabled={isPlayed}
                        onChange={v => handleChange(m, "time", v)}
                      />
                    </td>
                  </tr>
                );
              });
            })}
            {matches.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-[#9CA3AF]">Henüz maç yok.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(changes.size > 0 || saved) && (
        <div className="px-4 py-3 border-t border-[#F3F4F6] flex items-center gap-3">
          {changes.size > 0 && (
            <button
              onClick={handleUpdate}
              disabled={isPending}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#F59E0B] text-white text-sm font-semibold rounded-lg hover:bg-[#D97706] disabled:opacity-50 transition-colors"
            >
              <RefreshCw size={14} className={isPending ? "animate-spin" : ""} />
              {isPending ? "Güncelleniyor..." : `Fikstür Güncelle (${changes.size} maç)`}
            </button>
          )}
          {saved && changes.size === 0 && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-[#059669]">
              <CheckCircle size={16} /> Fikstür güncellendi · Kaptanlara bildirim gönderildi
            </span>
          )}
        </div>
      )}
    </Card>
  );
}

/* ── Eleme yardımcıları ────────────────────────────────────────── */
const KO_ROUND_LABEL: Record<string, string> = {
  QUARTER_FINAL: "Çeyrek Final",
  SEMI_FINAL: "Yarı Final",
  FINAL: "Final",
};

function koStandings(group: Groups[number], matches: TMatch[], winPts: number) {
  const rows = group.teams.map((gt) => ({ team: gt.team, pts: 0, gf: 0, ga: 0 }));
  for (const m of matches) {
    if (m.groupId !== group.id || m.homeScore === null || m.awayScore === null) continue;
    const h = rows.find((r) => r.team.id === m.homeTeamId);
    const a = rows.find((r) => r.team.id === m.awayTeamId);
    if (!h || !a) continue;
    h.gf += m.homeScore; h.ga += m.awayScore;
    a.gf += m.awayScore; a.ga += m.homeScore;
    if (m.homeScore > m.awayScore) h.pts += winPts;
    else if (m.homeScore < m.awayScore) a.pts += winPts;
    else { h.pts++; a.pts++; }
  }
  return rows.sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga));
}

type KOPair = { homeId: string; homeName: string; awayId: string; awayName: string };

function buildQFPairs(
  groups: Groups,
  matches: TMatch[],
  advanceCount: number,
  winPts: number,
): KOPair[] {
  const pairs: KOPair[] = [];
  for (let gi = 0; gi < groups.length; gi += 2) {
    const gj = gi + 1;
    if (gj >= groups.length) break;
    const si = koStandings(groups[gi], matches, winPts);
    const sj = koStandings(groups[gj], matches, winPts);
    for (let r = 1; r <= advanceCount; r++) {
      const rank = Math.ceil(r / 2);
      const opp = advanceCount + 1 - rank;
      const [h, a] =
        r % 2 === 1
          ? [si[rank - 1]?.team, sj[opp - 1]?.team]
          : [sj[rank - 1]?.team, si[opp - 1]?.team];
      if (!h || !a) continue;
      pairs.push({ homeId: h.id, homeName: h.name, awayId: a.id, awayName: a.name });
    }
  }
  return pairs;
}

function matchWinner(m: TMatch): { id: string; name: string } | null {
  if (m.homeScore === null || m.awayScore === null) return null;
  if (m.homeScore > m.awayScore) return { id: m.homeTeamId, name: m.homeTeam.name };
  if (m.awayScore > m.homeScore) return { id: m.awayTeamId, name: m.awayTeam.name };
  return null; // draw — no winner yet
}

function buildSFPairs(qfMatches: TMatch[]): KOPair[] {
  const pairs: KOPair[] = [];
  for (let i = 0; i < qfMatches.length; i += 2) {
    const w1 = matchWinner(qfMatches[i]);
    const w2 = matchWinner(qfMatches[i + 1]);
    if (!w1 || !w2) continue;
    pairs.push({ homeId: w1.id, homeName: w1.name, awayId: w2.id, awayName: w2.name });
  }
  return pairs;
}

function buildFinalPair(sfMatches: TMatch[]): KOPair[] {
  const w1 = matchWinner(sfMatches[0]);
  const w2 = matchWinner(sfMatches[1]);
  if (!w1 || !w2) return [];
  return [{ homeId: w1.id, homeName: w1.name, awayId: w2.id, awayName: w2.name }];
}

/* ── Planlanan eleme takvimi ──────────────────────────────────── */
const KO_SCHED_LABELS = ["Çeyrek Final", "Yarı Final", "Final", "3. Yer Maçı"];
const LABEL_TO_ROUND: Record<string, string> = {
  "Çeyrek Final": "QUARTER_FINAL",
  "Yarı Final":   "SEMI_FINAL",
  "Final":        "FINAL",
  "3. Yer Maçı":  "THIRD_PLACE",
};
const TR_MONTHS_S = ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];
function fmtShort(d: string) {
  const dt = new Date(d + "T12:00:00");
  return `${dt.getDate()} ${TR_MONTHS_S[dt.getMonth()]}`;
}

function PlannedKnockoutCalendar({ matchWeeks, kMatches }: { matchWeeks: MatchWeek[]; kMatches: TMatch[] }) {
  const weeks = matchWeeks.filter(w => KO_SCHED_LABELS.includes(w.label));
  if (weeks.length === 0) return null;

  return (
    <Card>
      <div className="px-5 py-3 border-b border-[#E5E7EB]">
        <h3 className="text-sm font-semibold text-[#111827]">Planlanan Eleme Takvimi</h3>
        <p className="text-xs text-[#9CA3AF] mt-0.5">Maç Günleri sekmesinde belirlenen tarihler</p>
      </div>
      <div className="divide-y divide-[#F3F4F6]">
        {weeks.map(week => {
          const round = LABEL_TO_ROUND[week.label];
          const created = kMatches.filter(m => m.round === round);
          const slots = week.days
            .slice().sort((a, b) => a.date.localeCompare(b.date))
            .flatMap(d => d.times.slice().sort().map(t => ({ date: d.date, time: t })));

          return (
            <div key={week.id} className="px-5 py-3 flex items-start gap-4">
              <div className="w-28 shrink-0">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                  created.length > 0 ? "bg-[#ECFDF5] text-[#059669]" : "bg-[#EFF6FF] text-[#2563EB]"
                }`}>{week.label}</span>
              </div>
              <div className="flex-1 min-w-0">
                {created.length > 0 ? (
                  <span className="text-xs text-[#059669] font-medium">✓ {created.length} maç oluşturuldu</span>
                ) : slots.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {slots.map((s, i) => (
                      <span key={i} className="text-xs bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg px-2 py-0.5 text-[#374151]">
                        {fmtShort(s.date)} — {s.time}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-[#D1D5DB]">Tarih girilmedi</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ── Eleme oluşturucu bileşeni ──────────────────────────────────── */
const ROUND_TO_WEEK_LABEL: Record<string, string> = {
  QUARTER_FINAL: "Çeyrek Final",
  SEMI_FINAL:    "Yarı Final",
  FINAL:         "Final",
  THIRD_PLACE:   "3. Yer Maçı",
};

function KnockoutSection({
  groups,
  matches,
  advanceCount,
  winPoints,
  tournamentId,
  matchWeeks,
}: {
  groups: Groups;
  matches: TMatch[];
  advanceCount: number;
  winPoints: number;
  tournamentId: string;
  matchWeeks: MatchWeek[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dates, setDates] = useState<Record<string, { date: string; time: string }>>({});

  const kMatches = matches.filter((m) => !m.groupId && m.round);
  const qfMatches = kMatches.filter((m) => m.round === "QUARTER_FINAL");
  const sfMatches = kMatches.filter((m) => m.round === "SEMI_FINAL");
  const finalMatches = kMatches.filter((m) => m.round === "FINAL");

  const groupsComplete = groups.length >= 2 && groups.every((g) => {
    const gm = matches.filter((m) => m.groupId === g.id);
    return gm.length > 0 && gm.every((m) => m.homeScore !== null);
  });

  const qfComplete = qfMatches.length > 0 && qfMatches.every((m) => m.homeScore !== null);
  const sfComplete = sfMatches.length > 0 && sfMatches.every((m) => m.homeScore !== null);

  const pendingRound =
    qfMatches.length === 0 ? "QUARTER_FINAL"
    : qfComplete && sfMatches.length === 0 && qfMatches.length > 2 ? "SEMI_FINAL"
    : (qfComplete && qfMatches.length <= 2 && finalMatches.length === 0) || (sfComplete && finalMatches.length === 0) ? "FINAL"
    : null;

  const pairs: KOPair[] =
    pendingRound === "QUARTER_FINAL" ? buildQFPairs(groups, matches, advanceCount, winPoints)
    : pendingRound === "SEMI_FINAL" ? buildSFPairs(qfMatches)
    : pendingRound === "FINAL" ? buildFinalPair(sfMatches.length > 0 ? sfMatches : qfMatches)
    : [];

  const canGenerate =
    pendingRound === "QUARTER_FINAL" ? groupsComplete
    : pendingRound === "SEMI_FINAL" ? qfComplete
    : pendingRound === "FINAL" ? (sfComplete || (qfComplete && qfMatches.length <= 2))
    : false;

  // Schedule'dan tarih/saat otomatik doldur
  useEffect(() => {
    if (!pendingRound) return;
    const weekLabel = ROUND_TO_WEEK_LABEL[pendingRound];
    const week = matchWeeks.find(w => w.label === weekLabel);
    if (!week) return;
    const slots: { date: string; time: string }[] = [];
    for (const day of [...week.days].sort((a, b) => a.date.localeCompare(b.date))) {
      for (const time of [...day.times].sort()) {
        slots.push({ date: day.date, time });
      }
    }
    setDates(prev => {
      const next = { ...prev };
      pairs.forEach((_, i) => {
        const key = `${pendingRound}-${i}`;
        if (!next[key] && slots[i]) next[key] = slots[i];
      });
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingRound, matchWeeks]);

  function setDate(key: string, field: "date" | "time", val: string) {
    setDates((prev) => {
      const cur = prev[key] ?? { date: "", time: "" };
      return { ...prev, [key]: { ...cur, [field]: val } };
    });
  }

  function handleGenerate() {
    if (!pendingRound || !canGenerate || pairs.length === 0) return;
    const fixtures = pairs.map((p, i) => {
      const key = `${pendingRound}-${i}`;
      return {
        homeTeamId: p.homeId,
        awayTeamId: p.awayId,
        round: pendingRound,
        date: dates[key]?.date || null,
        time: dates[key]?.time || null,
      };
    });
    startTransition(async () => {
      await generateKnockoutFixtures(tournamentId, fixtures);
      setDates({});
      router.refresh();
    });
  }

  if (advanceCount === 0 || groups.length < 2) return null;

  return (
    <Card>
      <CardHeader
        title="Eleme Turları"
        subtitle={
          kMatches.length === 0
            ? "Grup aşaması tamamlandığında eleme maçları oluşturun"
            : `${kMatches.length} eleme maçı · ${kMatches.filter((m) => m.homeScore !== null).length} oynandı`
        }
      />

      {/* Existing knockout matches summary */}
      {kMatches.length > 0 && (
        <div className="divide-y divide-[#F3F4F6] border-b border-[#F3F4F6]">
          {["QUARTER_FINAL", "SEMI_FINAL", "FINAL"].map((round) => {
            const rm = kMatches.filter((m) => m.round === round);
            if (rm.length === 0) return null;
            const played = rm.filter((m) => m.homeScore !== null).length;
            return (
              <div key={round} className="flex items-center gap-3 px-5 py-2.5">
                <span className="text-[10px] bg-[#EFF6FF] text-[#2563EB] px-2 py-0.5 rounded-md font-semibold whitespace-nowrap">
                  {KO_ROUND_LABEL[round] ?? round}
                </span>
                <div className="flex gap-2 flex-wrap">
                  {rm.map((m) => (
                    <span key={m.id} className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                      m.homeScore !== null ? "bg-[#ECFDF5] text-[#059669]" : "bg-[#F3F4F6] text-[#6B7280]"
                    }`}>
                      {m.homeTeam.name} {m.homeScore !== null ? `${m.homeScore}–${m.awayScore}` : "vs"} {m.awayTeam.name}
                      {m.date && ` · ${new Date(m.date).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}`}
                    </span>
                  ))}
                </div>
                <span className="ml-auto text-[10px] text-[#9CA3AF]">{played}/{rm.length}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Generator for next pending round */}
      {pendingRound && (
        <div className="px-5 py-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] bg-[#FEF3C7] text-[#D97706] px-2 py-0.5 rounded-md font-semibold">
              {KO_ROUND_LABEL[pendingRound] ?? pendingRound}
            </span>
            <span className="text-xs text-[#6B7280]">{pairs.length} maç</span>
          </div>

          {!canGenerate && pendingRound === "QUARTER_FINAL" && (
            <div className="flex items-center gap-2 text-xs text-[#D97706]">
              <AlertTriangle size={13} />
              Tüm grup maçları tamamlanmadan çeyrek final oluşturulamaz.
            </div>
          )}

          {pairs.length > 0 && (
            <div className="space-y-2">
              {pairs.map((p, i) => {
                const key = `${pendingRound}-${i}`;
                return (
                  <div key={i} className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-[#111827] w-[180px] truncate text-right">{p.homeName}</span>
                    <span className="text-xs text-[#D1D5DB] font-bold">–</span>
                    <span className="text-xs font-medium text-[#111827] w-[180px] truncate">{p.awayName}</span>
                    <TurkishDatePicker
                      value={dates[key]?.date ?? ""}
                      onChange={(v) => setDate(key, "date", v)}
                    />
                    <TimeInputCell
                      value={dates[key]?.time ?? ""}
                      onChange={(v) => setDate(key, "time", v)}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {canGenerate && pairs.length > 0 && (
            <button
              onClick={handleGenerate}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 bg-[#0F1F47] text-white text-xs font-semibold rounded-lg hover:bg-[#1A2F5A] disabled:opacity-50 transition-colors mt-1"
            >
              <Zap size={13} className={isPending ? "animate-pulse" : ""} />
              {isPending ? "Oluşturuluyor..." : `${KO_ROUND_LABEL[pendingRound] ?? pendingRound} Maçlarını Oluştur`}
            </button>
          )}
        </div>
      )}

      {!pendingRound && kMatches.length > 0 && finalMatches.some((m) => m.homeScore !== null) && (
        <div className="px-5 py-4 flex items-center gap-2 text-sm font-semibold text-[#059669]">
          <CheckCircle size={16} /> Tüm eleme turları tamamlandı
        </div>
      )}
    </Card>
  );
}

/* ── Ana bileşen ──────────────────────────────────────────────── */
export default function FixtureTab({
  groups,
  matchWeeks,
  tournamentId,
  matches = [],
  advanceCount = 0,
  winPoints = 3,
}: {
  groups: Groups;
  matchWeeks: MatchWeek[];
  tournamentId: string;
  matches?: TMatch[];
  advanceCount?: number;
  winPoints?: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<GeneratedMatch[] | null>(null);
  const [saved, setSaved] = useState(false);

  const totalSlots = matchWeeks.reduce((s, w) => s + w.days.reduce((ds, d) => ds + d.times.length, 0), 0);
  const hasGroups = groups.some(g => g.teams.length >= 2);
  const hasMatches = matches.length > 0;

  function handleGenerate() {
    const fixtures = buildFixtures(groups);
    const weekSlots = buildWeekSlots(matchWeeks);
    const rounds = [...new Set(fixtures.map(f => f.round))];
    const assigned = fixtures.map(f => ({ ...f }));
    rounds.forEach((round, ri) => {
      const slots = weekSlots[ri] ?? [];
      let slotIdx = 0;
      for (const f of assigned) {
        if (f.round === round) {
          f.date = slots[slotIdx]?.date ?? null;
          f.time = slots[slotIdx]?.time ?? null;
          slotIdx++;
        }
      }
    });
    setPreview(assigned);
    setSaved(false);
  }

  function handleSave() {
    if (!preview) return;
    startTransition(async () => {
      await saveGeneratedFixtures(
        tournamentId,
        preview.map(f => ({
          homeTeamId: f.homeTeamId,
          awayTeamId: f.awayTeamId,
          groupId: f.groupId,
          round: f.round,
          date: f.date,
          time: f.time,
        }))
      );
      setSaved(true);
      router.refresh();
    });
  }

  const unassigned = preview?.filter(f => !f.date).length ?? 0;

  return (
    <div className="space-y-4">
      {/* Mevcut fikstür (düzenlenebilir) */}
      {hasMatches && <EditableFixture matches={matches} tournamentId={tournamentId} />}

      {/* Planlanan eleme takvimi + oluşturucu */}
      {advanceCount > 0 && (
        <>
          <PlannedKnockoutCalendar
            matchWeeks={matchWeeks}
            kMatches={matches.filter(m => !m.groupId && m.round)}
          />
          <KnockoutSection
            groups={groups}
            matches={matches}
            advanceCount={advanceCount}
            winPoints={winPoints}
            tournamentId={tournamentId}
            matchWeeks={matchWeeks}
          />
        </>
      )}

      {/* Fikstür oluşturucu */}
      <div className="space-y-4">
        {hasMatches && (
          <div className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider pt-2">
            Fikstür Oluşturucu
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {groups.map(g => (
            <div key={g.id} className="bg-white rounded-xl border border-[#E5E7EB] px-4 py-3">
              <div className="text-xs text-[#9CA3AF] mb-1">{g.name}</div>
              <div className="text-lg font-bold text-[#111827]">{g.teams.length} takım</div>
              {g.teams.length >= 2 && (
                <div className="text-[10px] text-[#6B7280] mt-0.5">
                  {g.teams.length - 1} tur · {(g.teams.length * (g.teams.length - 1)) / 2} maç
                </div>
              )}
            </div>
          ))}
          <div className="bg-white rounded-xl border border-[#E5E7EB] px-4 py-3">
            <div className="text-xs text-[#9CA3AF] mb-1">Maç Slotu</div>
            <div className="text-lg font-bold text-[#111827]">{totalSlots}</div>
            <div className="text-[10px] text-[#6B7280] mt-0.5">{matchWeeks.length} hafta</div>
          </div>
        </div>

        {!hasGroups && (
          <div className="flex items-center gap-2.5 p-4 bg-[#FEF3C7] border border-[#FCD34D] rounded-xl text-sm text-[#92400E]">
            <AlertTriangle size={16} className="shrink-0" />
            Fikstür oluşturmak için önce gruplara en az 2 takım atayın.
          </div>
        )}

        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={handleGenerate}
            disabled={!hasGroups}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0F1F47] text-white text-sm font-semibold rounded-lg hover:bg-[#1A2F5A] disabled:opacity-40 transition-colors"
          >
            <Play size={14} />
            {hasMatches ? "Fikstürü Yeniden Oluştur" : "Fikstür Oluştur"}
          </button>

          {preview && !saved && (
            <button
              onClick={handleSave}
              disabled={isPending}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#059669] text-white text-sm font-semibold rounded-lg hover:bg-[#047857] disabled:opacity-50 transition-colors"
            >
              <Save size={14} />
              {isPending ? "Kaydediliyor..." : `${preview.length} Maçı Kaydet`}
            </button>
          )}

          {saved && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-[#059669]">
              <CheckCircle size={16} /> Fikstür kaydedildi
            </span>
          )}
        </div>

        {preview && (
          <Card>
            <CardHeader
              title="Fikstür Önizlemesi"
              subtitle={`${preview.length} maç · ${preview.length - unassigned} tarih atandı`}
            />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                    {["#", "Grup", "Tur", "Ev Sahibi", "", "Deplasman", "Tarih", "Saat"].map((h, i) => (
                      <th key={i} className={`px-3 py-2.5 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider ${
                        i === 3 ? "text-right" : i === 4 ? "text-center" : "text-left"
                      }`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {preview.map((m, i) => (
                    <tr key={i} className="hover:bg-[#FAFAFA]">
                      <td className="px-3 py-2.5 text-xs text-[#9CA3AF]">{i + 1}</td>
                      <td className="px-3 py-2.5">
                        <span className="text-[10px] bg-[#EFF6FF] text-[#2563EB] px-2 py-0.5 rounded-md font-semibold whitespace-nowrap">
                          {m.groupName}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-[#6B7280] whitespace-nowrap">{m.round}</td>
                      <td className="px-3 py-2.5 text-sm font-medium text-[#111827] text-right whitespace-nowrap">{m.homeTeamName}</td>
                      <td className="px-3 py-2.5 text-xs text-[#D1D5DB] text-center font-bold">–</td>
                      <td className="px-3 py-2.5 text-sm font-medium text-[#111827] whitespace-nowrap">{m.awayTeamName}</td>
                      <td className="px-3 py-2.5 text-xs text-[#6B7280] whitespace-nowrap">
                        {m.date ? fmtDate(m.date) : <span className="text-[#D1D5DB]">—</span>}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-[#6B7280]">
                        {m.time ?? <span className="text-[#D1D5DB]">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {unassigned > 0 && (
              <div className="px-5 py-3 border-t border-[#F3F4F6] flex items-center gap-2 text-xs text-[#D97706]">
                <AlertTriangle size={13} />
                {unassigned} maç için tarih/saat slotu yetmedi. Maç Günleri sekmesinden slot ekleyin.
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
