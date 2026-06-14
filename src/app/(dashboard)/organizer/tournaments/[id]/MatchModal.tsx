"use client";

import { useState, useTransition, useMemo } from "react";
import { CheckCircle, Trash2 } from "lucide-react";
import { saveMatchScore, startMatch, getTournamentMatches } from "@/lib/actions/tournament";

type Matches = Awaited<ReturnType<typeof getTournamentMatches>>;
export type TMatch = Matches[number];
type TPlayer = TMatch["homeTeam"]["players"][number];

const MAX_LINEUP = 9;
const MATCH_DURATION = 60;

const ROUND_LABEL: Record<string, string> = {
  ROUND_OF_32: "Son 32", ROUND_OF_16: "Son 16",
  QUARTER_FINAL: "Çeyrek Final", SEMI_FINAL: "Yarı Final",
  FINAL: "Final", THIRD_PLACE: "3. Yer",
};

function fmt(d: Date | null | undefined) {
  if (!d) return "—";
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}
function matchLabel(m: TMatch) {
  if (m.group?.name) return m.group.name;
  if (m.round) return ROUND_LABEL[m.round] ?? m.round;
  return "Eleme";
}
function uid() { return Math.random().toString(36).slice(2, 9); }

type EventKind = "goal" | "yellow" | "red" | "sub";

interface MatchEvent {
  id: string;
  kind: EventKind;
  teamId: string;
  playerId: string;
  playerName: string;
  inPlayerId?: string;
  inPlayerName?: string;
  minute: string;
  ownGoal?: boolean;
}

interface AddForm {
  kind: EventKind;
  teamId: string;
  playerId: string;
  inPlayerId: string;
  minute: string;
  ownGoal: boolean;
}

function YCard() {
  return <span className="inline-block w-2.5 h-3.5 bg-[#F59E0B] rounded-[2px] shrink-0" />;
}
function RCard() {
  return <span className="inline-block w-2.5 h-3.5 bg-[#EF4444] rounded-[2px] shrink-0" />;
}

const ACTION_BTNS: { kind: EventKind; icon: React.ReactNode; label: string; cls: string }[] = [
  { kind: "goal",   icon: "⚽", label: "Gol",     cls: "bg-[#ECFDF5] text-[#059669] hover:bg-[#D1FAE5]" },
  { kind: "yellow", icon: <YCard />, label: "Sarı",    cls: "bg-[#FEF3C7] text-[#D97706] hover:bg-[#FDE68A]" },
  { kind: "red",    icon: <RCard />, label: "Kırmızı", cls: "bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2]" },
  { kind: "sub",    icon: "↔", label: "Değişim",  cls: "bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE]" },
];

function eventIcon(k: EventKind): React.ReactNode {
  if (k === "yellow") return <YCard />;
  if (k === "red") return <RCard />;
  return k === "goal" ? "⚽" : "↔";
}
function eventTextColor(k: EventKind) {
  return k === "goal" ? "text-[#059669]" : k === "yellow" ? "text-[#D97706]" : k === "red" ? "text-[#DC2626]" : "text-[#2563EB]";
}
function playerLabel(p: TPlayer) {
  return p.number ? `#${p.number} ${p.name}` : p.name;
}

export type SaveResult = {
  matchId: string;
  status: "LIVE" | "PLAYED";
  homeScore: number;
  awayScore: number;
};

export default function MatchModal({
  match,
  onClose,
  onSaved,
}: {
  match: TMatch;
  onClose: () => void;
  onSaved?: (result: SaveResult) => void;
}) {
  const [tab, setTab] = useState<"kadro" | "olaylar">("kadro");
  const [lineup, setLineup] = useState<{ home: Set<string>; away: Set<string> }>(() => ({
    home: new Set(match.homeLineup ?? []),
    away: new Set(match.awayLineup ?? []),
  }));
  const [events, setEvents] = useState<MatchEvent[]>(() => {
    const goals: MatchEvent[] = match.goals.map(g => ({
      id: uid(), kind: "goal",
      teamId: g.teamId, playerId: g.playerId, playerName: g.player.name,
      minute: g.minute?.toString() ?? "", ownGoal: g.ownGoal,
    }));
    const cards: MatchEvent[] = match.cards.map(c => ({
      id: uid(),
      kind: c.type === "YELLOW" ? "yellow" : "red",
      teamId: c.player.teamId, playerId: c.playerId, playerName: c.player.name,
      minute: c.minute?.toString() ?? "",
    }));
    return [...goals, ...cards].sort((a, b) => (parseInt(a.minute) || 0) - (parseInt(b.minute) || 0));
  });
  const [addForm, setAddForm] = useState<AddForm | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const home = match.homeTeam;
  const away = match.awayTeam;

  const homeScore =
    events.filter(e => e.kind === "goal" && !e.ownGoal && e.teamId === match.homeTeamId).length +
    events.filter(e => e.kind === "goal" &&  e.ownGoal && e.teamId === match.awayTeamId).length;
  const awayScore =
    events.filter(e => e.kind === "goal" && !e.ownGoal && e.teamId === match.awayTeamId).length +
    events.filter(e => e.kind === "goal" &&  e.ownGoal && e.teamId === match.homeTeamId).length;

  const onField = useMemo(() => {
    const h = new Set(lineup.home);
    const a = new Set(lineup.away);
    for (const e of events) {
      if (e.kind !== "sub") continue;
      const set = e.teamId === match.homeTeamId ? h : a;
      set.delete(e.playerId);
      if (e.inPlayerId) set.add(e.inPlayerId);
    }
    return { home: h, away: a };
  }, [events, lineup, match.homeTeamId]);

  function toggleLineup(key: "home" | "away", pid: string) {
    setLineup(prev => {
      const s = new Set(prev[key]);
      if (s.has(pid)) s.delete(pid); else if (s.size < MAX_LINEUP) s.add(pid);
      return { ...prev, [key]: s };
    });
  }

  function startAdd(kind: EventKind, teamId: string) {
    setAddForm({ kind, teamId, playerId: "", inPlayerId: "", minute: "", ownGoal: false });
  }

  function commitAdd() {
    if (!addForm?.playerId) return;
    if (addForm.kind === "sub" && !addForm.inPlayerId) return;
    if (!addForm.minute) return;
    const teamPlayers = addForm.teamId === match.homeTeamId ? home.players : away.players;
    const player = teamPlayers.find(p => p.id === addForm.playerId);
    const inPlayer = teamPlayers.find(p => p.id === addForm.inPlayerId);
    if (!player) return;
    const ev: MatchEvent = {
      id: uid(), kind: addForm.kind,
      teamId: addForm.teamId,
      playerId: addForm.playerId, playerName: player.name,
      inPlayerId: inPlayer?.id, inPlayerName: inPlayer?.name,
      minute: addForm.minute, ownGoal: addForm.ownGoal,
    };
    setEvents(prev => [...prev, ev].sort((a, b) => (parseInt(a.minute) || 0) - (parseInt(b.minute) || 0)));
    setAddForm(null);
  }

  function outPlayers(teamId: string) {
    const isHome = teamId === match.homeTeamId;
    const active = isHome ? onField.home : onField.away;
    const all = isHome ? home.players : away.players;
    return active.size > 0 ? all.filter(p => active.has(p.id)) : all;
  }
  function inPlayers(teamId: string) {
    const isHome = teamId === match.homeTeamId;
    const active = isHome ? onField.home : onField.away;
    const all = isHome ? home.players : away.players;
    return active.size > 0 ? all.filter(p => !active.has(p.id)) : all;
  }

  function handleStart() {
    setError("");
    startTransition(async () => {
      try {
        await startMatch({
          matchId: match.id,
          homeLineup: Array.from(lineup.home),
          awayLineup: Array.from(lineup.away),
        });
        onSaved?.({ matchId: match.id, status: "LIVE", homeScore, awayScore });
        onClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  }

  function handleFinish() {
    setError("");
    startTransition(async () => {
      try {
        await saveMatchScore({
          matchId: match.id, homeScore, awayScore, finished: true,
          goals: events.filter(e => e.kind === "goal").map(e => ({
            teamId: e.teamId, playerId: e.playerId,
            minute: e.minute ? parseInt(e.minute) : null,
            ownGoal: e.ownGoal ?? false,
          })),
          cards: events.filter(e => e.kind === "yellow" || e.kind === "red").map(e => ({
            playerId: e.playerId,
            type: e.kind === "yellow" ? "YELLOW" as const : "RED" as const,
            minute: e.minute ? parseInt(e.minute) : null,
          })),
        });
        onSaved?.({ matchId: match.id, status: "PLAYED", homeScore, awayScore });
        onClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  }

  const lineupReady = lineup.home.size === MAX_LINEUP && lineup.away.size === MAX_LINEUP;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[94vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Başlık */}
        <div className="bg-[#0F1F47] text-white rounded-t-2xl px-5 py-4 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-white/60">
              {matchLabel(match)} · {fmt(match.date)}{match.time ? ` · ${match.time}` : ""}
            </span>
            <button onClick={onClose} className="text-white/50 hover:text-white text-xl leading-none w-7 h-7 flex items-center justify-center">✕</button>
          </div>
          <div className="grid grid-cols-3 items-center gap-2">
            <div className="text-center">
              <div className="text-sm font-bold leading-tight truncate">{home.name}</div>
              <div className="text-[10px] text-white/40 mt-0.5">{home.players.length} oyuncu</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-extrabold tracking-tight tabular-nums">
                {homeScore} <span className="text-white/30">–</span> {awayScore}
              </div>
              <div className="text-[10px] text-white/40 mt-1">{MATCH_DURATION} dakika</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold leading-tight truncate">{away.name}</div>
              <div className="text-[10px] text-white/40 mt-0.5">{away.players.length} oyuncu</div>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-[#E5E7EB] shrink-0">
          <button
            onClick={() => setTab("kadro")}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${tab === "kadro" ? "border-[#F59E0B] text-[#0F1F47]" : "border-transparent text-[#9CA3AF] hover:text-[#374151]"}`}
          >
            İlk 9{lineupReady && <span className="ml-1.5 text-[#10B981] text-xs">✓</span>}
          </button>
          <button
            onClick={() => setTab("olaylar")}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${tab === "olaylar" ? "border-[#F59E0B] text-[#0F1F47]" : "border-transparent text-[#9CA3AF] hover:text-[#374151]"}`}
          >
            Olaylar
            {events.length > 0 && (
              <span className="ml-1.5 bg-[#0F1F47] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{events.length}</span>
            )}
          </button>
        </div>

        {/* İçerik */}
        <div className="flex-1 overflow-y-auto">

          {/* KADRO */}
          {tab === "kadro" && (
            <div className="grid grid-cols-2 divide-x divide-[#F3F4F6]">
              {([["home", home] as const, ["away", away] as const]).map(([key, team]) => {
                const sel = lineup[key];
                const full = sel.size === MAX_LINEUP;
                return (
                  <div key={key} className="p-3">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs font-bold text-[#374151] truncate pr-2">{team.name}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${full ? "bg-[#ECFDF5] text-[#059669]" : "bg-[#FEF3C7] text-[#D97706]"}`}>
                        {sel.size}/{MAX_LINEUP}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {team.players.length === 0 && (
                        <p className="text-xs text-[#9CA3AF] text-center py-6">Oyuncu yok</p>
                      )}
                      {team.players.map(p => {
                        const checked = sel.has(p.id);
                        const disabled = !checked && full;
                        return (
                          <button
                            key={p.id}
                            onClick={() => toggleLineup(key, p.id)}
                            disabled={disabled}
                            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all ${
                              checked ? "bg-[#0F1F47] text-white" : disabled ? "opacity-30 cursor-not-allowed" : "hover:bg-[#F4F6F9] text-[#374151]"
                            }`}
                          >
                            <span className={`w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center shrink-0 ${checked ? "bg-white/20 text-white" : "bg-[#E5E7EB] text-[#9CA3AF]"}`}>
                              {p.number ?? "—"}
                            </span>
                            <span className="text-xs font-medium truncate flex-1">{p.name}</span>
                            {checked && <CheckCircle size={12} className="text-[#10B981] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* OLAYLAR */}
          {tab === "olaylar" && (
            <div className="p-4 space-y-4">
              {/* Aksiyon butonları */}
              <div className="grid grid-cols-2 gap-3">
                {([["home", home.name, match.homeTeamId], ["away", away.name, match.awayTeamId]] as const).map(([, teamName, teamId]) => (
                  <div key={teamId}>
                    <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2 truncate">{teamName}</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {ACTION_BTNS.map(btn => (
                        <button key={btn.kind} onClick={() => startAdd(btn.kind, teamId)}
                          className={`px-2 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${btn.cls}`}>
                          {btn.icon}{btn.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Olay ekleme formu */}
              {addForm && (() => {
                const isHome = addForm.teamId === match.homeTeamId;
                const teamName = isHome ? home.name : away.name;
                const allPlayers = isHome ? home.players : away.players;
                const active = isHome ? onField.home : onField.away;
                const fieldPlayers = active.size > 0 ? allPlayers.filter(p => active.has(p.id)) : allPlayers;
                const outList = addForm.kind === "sub" ? outPlayers(addForm.teamId) : fieldPlayers;
                const inList = inPlayers(addForm.teamId).filter(p => p.id !== addForm.playerId);
                const kindLabel: React.ReactNode = addForm.kind === "goal" ? "⚽ Gol" : addForm.kind === "yellow" ? <><YCard /> Sarı Kart</> : addForm.kind === "red" ? <><RCard /> Kırmızı Kart</> : "↔ Değişim";
                return (
                  <div className="border-2 border-[#F59E0B]/40 rounded-xl p-4 bg-[#FFFBF0] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#374151]">{kindLabel} · {teamName}</span>
                      <button onClick={() => setAddForm(null)} className="text-[#9CA3AF] hover:text-[#374151] text-lg leading-none">✕</button>
                    </div>

                    <div className={`grid gap-2 ${addForm.kind === "sub" ? "grid-cols-1" : "grid-cols-2"}`}>
                      <div>
                        <label className="block text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">
                          {addForm.kind === "sub" ? "Çıkan Oyuncu" : "Oyuncu"}
                        </label>
                        <select value={addForm.playerId} onChange={e => setAddForm(f => f ? { ...f, playerId: e.target.value } : f)}
                          className="w-full px-2.5 py-2 text-xs border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]">
                          <option value="">Oyuncu seçin...</option>
                          {outList.map(p => <option key={p.id} value={p.id}>{playerLabel(p)}</option>)}
                        </select>
                      </div>
                      {addForm.kind !== "sub" && (
                        <div>
                          <label className="block text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">Dakika</label>
                          <input type="number" min={1} max={MATCH_DURATION} placeholder={`1–${MATCH_DURATION}`}
                            value={addForm.minute} onChange={e => setAddForm(f => f ? { ...f, minute: e.target.value } : f)}
                            className="w-full px-2.5 py-2 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" />
                        </div>
                      )}
                    </div>

                    {addForm.kind === "sub" && (
                      <>
                        <div>
                          <label className="block text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">Giren Oyuncu</label>
                          <select value={addForm.inPlayerId} onChange={e => setAddForm(f => f ? { ...f, inPlayerId: e.target.value } : f)}
                            className="w-full px-2.5 py-2 text-xs border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]">
                            <option value="">Oyuncu seçin...</option>
                            {inList.map(p => <option key={p.id} value={p.id}>{playerLabel(p)}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">Dakika</label>
                          <input type="number" min={1} max={MATCH_DURATION} placeholder={`1–${MATCH_DURATION}`}
                            value={addForm.minute} onChange={e => setAddForm(f => f ? { ...f, minute: e.target.value } : f)}
                            className="w-full px-2.5 py-2 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" />
                        </div>
                      </>
                    )}

                    {addForm.kind === "goal" && (
                      <label className="flex items-center gap-2 text-xs text-[#6B7280] cursor-pointer select-none">
                        <input type="checkbox" checked={addForm.ownGoal}
                          onChange={e => setAddForm(f => f ? { ...f, ownGoal: e.target.checked } : f)}
                          className="rounded border-[#D1D5DB]" />
                        Kendi kalesine gol (rakibe sayılır)
                      </label>
                    )}

                    <div className="flex gap-2 pt-1">
                      <button onClick={() => setAddForm(null)}
                        className="flex-1 py-2 text-xs font-medium text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-white transition-colors">
                        Vazgeç
                      </button>
                      <button onClick={commitAdd}
                        disabled={!addForm.playerId || (addForm.kind === "sub" && !addForm.inPlayerId) || !addForm.minute}
                        className="flex-1 py-2 text-xs font-bold bg-[#0F1F47] text-white rounded-lg hover:bg-[#1A2F5A] disabled:opacity-40 transition-colors">
                        Ekle ✓
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Timeline */}
              <div>
                <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2">
                  Maç Olayları {events.length > 0 && `(${events.length})`}
                </div>
                {events.length === 0 ? (
                  <div className="text-xs text-[#D1D5DB] text-center py-8 border border-dashed border-[#E5E7EB] rounded-xl">
                    Henüz olay eklenmedi.<br />Yukarıdaki butonları kullanın.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {events.map(e => {
                      const isHome = e.teamId === match.homeTeamId;
                      return (
                        <div key={e.id} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg ${isHome ? "bg-[#EFF6FF]/60" : "bg-[#FFF7ED]/60"}`}>
                          <span className="flex items-center justify-center w-5 shrink-0">{eventIcon(e.kind)}</span>
                          <span className={`text-xs font-extrabold w-8 shrink-0 tabular-nums ${eventTextColor(e.kind)}`}>
                            {e.minute ? `${e.minute}'` : "—'"}
                          </span>
                          <span className="text-xs text-[#374151] flex-1 truncate">
                            {e.kind === "sub"
                              ? <>{e.playerName} <span className="text-[#9CA3AF] font-bold">→</span> {e.inPlayerName}</>
                              : <>{e.playerName}{e.ownGoal ? <span className="text-[#9CA3AF]"> (kendi kalesine)</span> : ""}</>
                            }
                          </span>
                          <span className={`text-[10px] font-semibold shrink-0 ${isHome ? "text-[#3B82F6]" : "text-[#F59E0B]"}`}>
                            {isHome ? "Ev" : "Dep"}
                          </span>
                          <button onClick={() => setEvents(prev => prev.filter(x => x.id !== e.id))}
                            className="shrink-0 text-[#D1D5DB] hover:text-[#EF4444] transition-colors ml-1">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Alt bar */}
        <div className="px-5 py-4 border-t border-[#E5E7EB] shrink-0 bg-[#FAFAFA] rounded-b-2xl">
          {error && <p className="text-xs text-[#EF4444] mb-3">{error}</p>}
          {match.status === "PLAYED" ? null : pending ? (
            <div className="flex items-center justify-center gap-2 py-2.5 text-sm text-[#6B7280]">
              <svg className="animate-spin w-4 h-4 text-[#0F1F47]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Kaydediliyor...
            </div>
          ) : (
            <div className="flex gap-2">
              <button onClick={onClose}
                className="py-2.5 px-4 text-sm font-medium text-[#6B7280] border border-[#E5E7EB] rounded-xl hover:bg-white transition-colors bg-white">
                İptal
              </button>
              {match.status === "SCHEDULED" ? (
                <button
                  onClick={handleStart}
                  disabled={!lineupReady}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold bg-[#059669] text-white rounded-xl hover:bg-[#047857] transition-colors disabled:opacity-50"
                >
                  <CheckCircle size={15} />
                  {lineupReady ? "Maçı Başlat" : `Kadroyu Tamamla (${lineup.home.size + lineup.away.size}/${MAX_LINEUP * 2})`}
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-colors"
                >
                  <CheckCircle size={15} />
                  {`Maçı Bitir  ${homeScore} – ${awayScore}`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
