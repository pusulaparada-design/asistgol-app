"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, X } from "lucide-react";
import { adminUpdateMatchSchedule, adminSaveMatchEvents, type getAllMatchesAdmin } from "@/lib/actions/admin";
import type { MatchStatus } from "@prisma/client";

type Matches = Awaited<ReturnType<typeof getAllMatchesAdmin>>;
export type AdminMatch = Matches[number];

const MATCH_DURATION = 90;

const STATUS_OPTIONS: { value: MatchStatus; label: string }[] = [
  { value: "SCHEDULED", label: "Planlandı" },
  { value: "LIVE", label: "Canlı" },
  { value: "PLAYED", label: "Oynandı" },
  { value: "POSTPONED", label: "Ertelendi" },
];

const inputCls = "w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]";

function toDateInput(d: Date | string | null): string {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function uid() { return Math.random().toString(36).slice(2, 9); }

type EventKind = "goal" | "yellow" | "red";
interface MatchEvent {
  id: string;
  kind: EventKind;
  teamId: string;
  playerId: string;
  playerName: string;
  minute: string;
  ownGoal: boolean;
}

function YCard() { return <span className="inline-block w-2.5 h-3.5 bg-[#F59E0B] rounded-[2px] shrink-0" />; }
function RCard() { return <span className="inline-block w-2.5 h-3.5 bg-[#EF4444] rounded-[2px] shrink-0" />; }
function eventIcon(k: EventKind): React.ReactNode {
  if (k === "yellow") return <YCard />;
  if (k === "red") return <RCard />;
  return "⚽";
}

export default function AdminMatchModal({ match, onClose }: { match: AdminMatch; onClose: () => void }) {
  const router = useRouter();
  const [tab, setTab] = useState<"plan" | "olaylar">("plan");

  // ── Tarih & Saat formu ──
  const [date, setDate] = useState(toDateInput(match.date));
  const [time, setTime] = useState(match.time ?? "");
  const [venue, setVenue] = useState(match.venue ?? "");
  const [status, setStatus] = useState<MatchStatus>(match.status);

  // ── Olaylar (gol/kart) ──
  const [events, setEvents] = useState<MatchEvent[]>(() => {
    const goals: MatchEvent[] = match.goals.map(g => ({
      id: uid(), kind: "goal", teamId: g.teamId, playerId: g.playerId,
      playerName: g.player.name, minute: g.minute?.toString() ?? "", ownGoal: g.ownGoal,
    }));
    const cards: MatchEvent[] = match.cards.map(c => ({
      id: uid(), kind: c.type === "YELLOW" ? "yellow" : "red",
      teamId: c.player.teamId, playerId: c.playerId, playerName: c.player.name,
      minute: c.minute?.toString() ?? "", ownGoal: false,
    }));
    return [...goals, ...cards].sort((a, b) => (parseInt(a.minute) || 0) - (parseInt(b.minute) || 0));
  });
  const [addForm, setAddForm] = useState<{ kind: EventKind; teamId: string; playerId: string; minute: string; ownGoal: boolean } | null>(null);

  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const home = match.homeTeam;
  const away = match.awayTeam;

  const homeScore =
    events.filter(e => e.kind === "goal" && !e.ownGoal && e.teamId === match.homeTeamId).length +
    events.filter(e => e.kind === "goal" && e.ownGoal && e.teamId === match.awayTeamId).length;
  const awayScore =
    events.filter(e => e.kind === "goal" && !e.ownGoal && e.teamId === match.awayTeamId).length +
    events.filter(e => e.kind === "goal" && e.ownGoal && e.teamId === match.homeTeamId).length;

  function commitAdd() {
    if (!addForm?.playerId) return;
    const players = addForm.teamId === match.homeTeamId ? home.players : away.players;
    const player = players.find(p => p.id === addForm.playerId);
    if (!player) return;
    setEvents(prev => [...prev, {
      id: uid(), kind: addForm.kind, teamId: addForm.teamId,
      playerId: player.id, playerName: player.name, minute: addForm.minute, ownGoal: addForm.ownGoal,
    }].sort((a, b) => (parseInt(a.minute) || 0) - (parseInt(b.minute) || 0)));
    setAddForm(null);
  }

  function handleSaveSchedule() {
    setError("");
    start(async () => {
      const res = await adminUpdateMatchSchedule(match.id, {
        date: date || null, time: time || null, venue: venue || null, status,
      });
      if (res.ok) { router.refresh(); onClose(); }
      else setError(res.error);
    });
  }

  function handleSaveEvents() {
    setError("");
    start(async () => {
      const res = await adminSaveMatchEvents(match.id, {
        goals: events.filter(e => e.kind === "goal").map(e => ({
          teamId: e.teamId, playerId: e.playerId,
          minute: e.minute ? parseInt(e.minute) : null, ownGoal: e.ownGoal,
        })),
        cards: events.filter(e => e.kind === "yellow" || e.kind === "red").map(e => ({
          playerId: e.playerId,
          type: e.kind === "yellow" ? "YELLOW" as const : "RED" as const,
          minute: e.minute ? parseInt(e.minute) : null,
        })),
      });
      if (res.ok) { router.refresh(); onClose(); }
      else setError(res.error);
    });
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[94vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Başlık */}
        <div className="bg-[#0F1F47] text-white rounded-t-2xl px-5 py-4 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/60">{match.tournament.name} · {match.group?.name ?? match.round ?? "Maç"}</span>
            <button onClick={onClose} className="text-white/50 hover:text-white"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-3 items-center gap-2">
            <div className="text-sm font-bold truncate text-right">{home.name}</div>
            <div className="text-center text-3xl font-extrabold tabular-nums">{homeScore} <span className="text-white/30">–</span> {awayScore}</div>
            <div className="text-sm font-bold truncate">{away.name}</div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-[#E5E7EB] shrink-0">
          <button onClick={() => setTab("plan")}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${tab === "plan" ? "border-[#F59E0B] text-[#0F1F47]" : "border-transparent text-[#9CA3AF] hover:text-[#374151]"}`}>
            Tarih & Saat
          </button>
          <button onClick={() => setTab("olaylar")}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${tab === "olaylar" ? "border-[#F59E0B] text-[#0F1F47]" : "border-transparent text-[#9CA3AF] hover:text-[#374151]"}`}>
            Gol & Kart {events.length > 0 && <span className="ml-1.5 bg-[#0F1F47] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{events.length}</span>}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* TARİH & SAAT */}
          {tab === "plan" && (
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1.5">Tarih</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1.5">Saat</label>
                  <input type="time" value={time} onChange={e => setTime(e.target.value)} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">Saha / Mekan</label>
                <input value={venue} onChange={e => setVenue(e.target.value)} placeholder="Saha adı" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">Durum</label>
                <select value={status} onChange={e => setStatus(e.target.value as MatchStatus)} className={inputCls + " bg-white"}>
                  {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* GOL & KART */}
          {tab === "olaylar" && (
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {([["home", home.name, match.homeTeamId], ["away", away.name, match.awayTeamId]] as const).map(([, teamName, teamId]) => (
                  <div key={teamId}>
                    <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2 truncate">{teamName}</div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button onClick={() => setAddForm({ kind: "goal", teamId, playerId: "", minute: "", ownGoal: false })}
                        className="px-2 py-2 text-xs font-semibold rounded-lg bg-[#ECFDF5] text-[#059669] hover:bg-[#D1FAE5] flex items-center justify-center gap-1">⚽ Gol</button>
                      <button onClick={() => setAddForm({ kind: "yellow", teamId, playerId: "", minute: "", ownGoal: false })}
                        className="px-2 py-2 text-xs font-semibold rounded-lg bg-[#FEF3C7] text-[#D97706] hover:bg-[#FDE68A] flex items-center justify-center gap-1"><YCard /> Sarı</button>
                      <button onClick={() => setAddForm({ kind: "red", teamId, playerId: "", minute: "", ownGoal: false })}
                        className="px-2 py-2 text-xs font-semibold rounded-lg bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2] flex items-center justify-center gap-1"><RCard /> Kırmızı</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Olay ekleme formu */}
              {addForm && (() => {
                const isHome = addForm.teamId === match.homeTeamId;
                const teamName = isHome ? home.name : away.name;
                const players = isHome ? home.players : away.players;
                const kindLabel: React.ReactNode = addForm.kind === "goal" ? "⚽ Gol" : addForm.kind === "yellow" ? <><YCard /> Sarı Kart</> : <><RCard /> Kırmızı Kart</>;
                return (
                  <div className="border-2 border-[#F59E0B]/40 rounded-xl p-4 bg-[#FFFBF0] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#374151] flex items-center gap-1">{kindLabel} · {teamName}</span>
                      <button onClick={() => setAddForm(null)} className="text-[#9CA3AF] hover:text-[#374151]"><X size={16} /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">Oyuncu</label>
                        <select value={addForm.playerId} onChange={e => setAddForm(f => f ? { ...f, playerId: e.target.value } : f)}
                          className="w-full px-2.5 py-2 text-xs border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]">
                          <option value="">Oyuncu seçin...</option>
                          {players.map(p => <option key={p.id} value={p.id}>{p.number ? `#${p.number} ${p.name}` : p.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">Dakika</label>
                        <input type="number" min={1} max={MATCH_DURATION} placeholder={`1–${MATCH_DURATION}`}
                          value={addForm.minute} onChange={e => setAddForm(f => f ? { ...f, minute: e.target.value } : f)}
                          className="w-full px-2.5 py-2 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" />
                      </div>
                    </div>
                    {addForm.kind === "goal" && (
                      <label className="flex items-center gap-2 text-xs text-[#6B7280] cursor-pointer select-none">
                        <input type="checkbox" checked={addForm.ownGoal}
                          onChange={e => setAddForm(f => f ? { ...f, ownGoal: e.target.checked } : f)} className="rounded border-[#D1D5DB]" />
                        Kendi kalesine gol (rakibe sayılır)
                      </label>
                    )}
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => setAddForm(null)} className="flex-1 py-2 text-xs font-medium text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-white transition-colors">Vazgeç</button>
                      <button onClick={commitAdd} disabled={!addForm.playerId}
                        className="flex-1 py-2 text-xs font-bold bg-[#0F1F47] text-white rounded-lg hover:bg-[#1A2F5A] disabled:opacity-40 transition-colors">Ekle ✓</button>
                    </div>
                  </div>
                );
              })()}

              {/* Timeline */}
              <div>
                <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2">Maç Olayları {events.length > 0 && `(${events.length})`}</div>
                {events.length === 0 ? (
                  <div className="text-xs text-[#D1D5DB] text-center py-8 border border-dashed border-[#E5E7EB] rounded-xl">Henüz olay yok.</div>
                ) : (
                  <div className="space-y-1">
                    {events.map(e => {
                      const isHome = e.teamId === match.homeTeamId;
                      return (
                        <div key={e.id} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg ${isHome ? "bg-[#EFF6FF]/60" : "bg-[#FFF7ED]/60"}`}>
                          <span className="flex items-center justify-center w-5 shrink-0">{eventIcon(e.kind)}</span>
                          <span className="text-xs font-extrabold w-8 shrink-0 tabular-nums text-[#374151]">{e.minute ? `${e.minute}'` : "—'"}</span>
                          <span className="text-xs text-[#374151] flex-1 truncate">{e.playerName}{e.ownGoal ? <span className="text-[#9CA3AF]"> (kendi kalesine)</span> : ""}</span>
                          <span className={`text-[10px] font-semibold shrink-0 ${isHome ? "text-[#3B82F6]" : "text-[#F59E0B]"}`}>{isHome ? "Ev" : "Dep"}</span>
                          <button onClick={() => setEvents(prev => prev.filter(x => x.id !== e.id))} className="shrink-0 text-[#D1D5DB] hover:text-[#EF4444] transition-colors ml-1"><Trash2 size={12} /></button>
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
          <div className="flex gap-2">
            <button onClick={onClose} className="py-2.5 px-4 text-sm font-medium text-[#6B7280] border border-[#E5E7EB] rounded-xl hover:bg-white transition-colors bg-white">İptal</button>
            <button
              onClick={tab === "plan" ? handleSaveSchedule : handleSaveEvents}
              disabled={pending}
              className="flex-1 py-2.5 text-sm font-bold bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
            >
              {pending ? "Kaydediliyor..." : tab === "plan" ? "Tarih & Saati Kaydet" : `Gol & Kartı Kaydet (${homeScore}–${awayScore})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
