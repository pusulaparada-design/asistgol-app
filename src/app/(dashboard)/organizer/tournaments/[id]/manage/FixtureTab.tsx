"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Play, Save, AlertTriangle, CheckCircle, RefreshCw, Calendar } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/PageShell";
import { saveGeneratedFixtures, rescheduleMatches, getTournamentMatches } from "@/lib/actions/tournament";
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

/* ── Ana bileşen ──────────────────────────────────────────────── */
export default function FixtureTab({
  groups,
  matchWeeks,
  tournamentId,
  matches = [],
}: {
  groups: Groups;
  matchWeeks: MatchWeek[];
  tournamentId: string;
  matches?: TMatch[];
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
