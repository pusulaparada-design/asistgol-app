"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import type { getTournament } from "@/lib/actions/tournament";

type Tournament = NonNullable<Awaited<ReturnType<typeof getTournament>>>;
type TMatch = Tournament["matches"][number];
type Player = Tournament["registrations"][number]["team"]["players"][number];

const ROUND_LABELS: Record<string, string> = {
  QUARTER_FINAL: "Çeyrek Final",
  SEMI_FINAL:    "Yarı Final",
  FINAL:         "Final",
  THIRD_PLACE:   "3. Yer Maçı",
  ROUND_OF_16:   "Son 16",
  ROUND_OF_32:   "Son 32",
};

function matchLabel(m: TMatch): string {
  if (m.group?.name) {
    const week = m.round ?? "";
    return week ? `${m.group.name} · ${week} Maçı` : `${m.group.name} Grup Maçı`;
  }
  if (m.round) return ROUND_LABELS[m.round] ?? m.round;
  return "Eleme Maçı";
}

function fmtDate(d: Date | string | null): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", weekday: "long" });
}

// ── Football Pitch SVG ──────────────────────────────────────────
function FootballPitch() {
  return (
    <svg
      viewBox="0 0 500 316"
      className="w-full"
      style={{ display: "block", maxHeight: "220px" }}
      aria-hidden="true"
    >
      {/* Background */}
      <rect x="0" y="0" width="500" height="316" fill="#1e5c12" />

      {/* Vertical stripes */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={10 + i * 80} y="10" width="80" height="296" fill={i % 2 === 0 ? "#1e5c12" : "#256517"} />
      ))}

      {/* Penalty arcs (drawn BEFORE boxes so boxes paint over them inside) */}
      <path d="M 86,125 A 42,42 0 0,1 86,191" fill="none" stroke="white" strokeWidth="1.5" />
      <path d="M 414,125 A 42,42 0 0,0 414,191" fill="none" stroke="white" strokeWidth="1.5" />

      {/* Left penalty box */}
      <rect x="10" y="70" width="76" height="176" fill="none" stroke="white" strokeWidth="1.5" />
      {/* Left goal box */}
      <rect x="10" y="118" width="26" height="80" fill="none" stroke="white" strokeWidth="1.5" />
      {/* Left penalty spot */}
      <circle cx="60" cy="158" r="2" fill="white" />

      {/* Right penalty box */}
      <rect x="414" y="70" width="76" height="176" fill="none" stroke="white" strokeWidth="1.5" />
      {/* Right goal box */}
      <rect x="464" y="118" width="26" height="80" fill="none" stroke="white" strokeWidth="1.5" />
      {/* Right penalty spot */}
      <circle cx="440" cy="158" r="2" fill="white" />

      {/* Field outline */}
      <rect x="10" y="10" width="480" height="296" fill="none" stroke="white" strokeWidth="2" />

      {/* Halfway line */}
      <line x1="250" y1="10" x2="250" y2="306" stroke="white" strokeWidth="2" />

      {/* Center circle & dot */}
      <circle cx="250" cy="158" r="43" fill="none" stroke="white" strokeWidth="2" />
      <circle cx="250" cy="158" r="2.5" fill="white" />

      {/* Goals */}
      <rect x="2" y="141" width="8" height="34" fill="#0f3a08" stroke="white" strokeWidth="1.5" />
      <rect x="490" y="141" width="8" height="34" fill="#0f3a08" stroke="white" strokeWidth="1.5" />

      {/* Corner arcs */}
      <path d="M 18,10 A 8,8 0 0,0 10,18"  fill="none" stroke="white" strokeWidth="1.5" />
      <path d="M 482,10 A 8,8 0 0,1 490,18" fill="none" stroke="white" strokeWidth="1.5" />
      <path d="M 10,298 A 8,8 0 0,1 18,306" fill="none" stroke="white" strokeWidth="1.5" />
      <path d="M 490,298 A 8,8 0 0,0 482,306" fill="none" stroke="white" strokeWidth="1.5" />
    </svg>
  );
}

// ── Card icon for card events ───────────────────────────────────
function CardIcon({ type }: { type: string }) {
  return (
    <span
      className="inline-block rounded-[2px] shrink-0"
      style={{
        width: 10, height: 14,
        background: type === "YELLOW" ? "#F59E0B" : "#EF4444",
      }}
    />
  );
}

// ── Lineup column ───────────────────────────────────────────────
function LineupColumn({
  label,
  players,
  lineupIds,
  captainName,
  cardMap,
  goalMap,
}: {
  label: string;
  players: Player[];
  lineupIds: string[];
  captainName: string | undefined;
  cardMap: Record<string, { yellow: number; red: number }>;
  goalMap: Record<string, number>;
}) {
  const inLineup = lineupIds.length > 0
    ? lineupIds.map((id) => players.find((p) => p.id === id)).filter(Boolean) as Player[]
    : [...players].sort((a, b) => (a.number ?? 99) - (b.number ?? 99));

  if (inLineup.length === 0) {
    return (
      <div className="flex-1">
        <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-2">{label}</div>
        <p className="text-xs text-[#9CA3AF] italic">Kadro bilgisi yok</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0">
      <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-2">{label}</div>
      <div className="space-y-1">
        {inLineup.map((p) => {
          const cards = cardMap[p.id];
          const goals = goalMap[p.id] ?? 0;
          const isCaptain = captainName ? p.name === captainName : false;
          return (
            <div key={p.id} className="flex items-center gap-2">
              <span className="w-6 h-6 bg-[#F4F6F9] rounded flex items-center justify-center text-[10px] font-bold text-[#374151] shrink-0">
                {p.number ?? "—"}
              </span>
              <span className="text-xs font-medium text-[#111827] truncate flex-1">{p.name}</span>
              {isCaptain && (
                <span className="text-[10px] font-bold text-[#D97706] shrink-0">(K)</span>
              )}
              {goals > 0 && (
                <span className="text-[10px] shrink-0">{goals > 1 ? `⚽×${goals}` : "⚽"}</span>
              )}
              {cards && (
                <div className="flex gap-0.5 shrink-0">
                  {Array.from({ length: cards.yellow }).map((_, i) => (
                    <CardIcon key={`y${i}`} type="YELLOW" />
                  ))}
                  {cards.red > 0 && <CardIcon type="RED" />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main modal ──────────────────────────────────────────────────
export function MatchDetailModal({
  match: m,
  tournament,
  onClose,
}: {
  match: TMatch;
  tournament: { name: string; registrations: Tournament["registrations"] };
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const isPlayed = m.homeScore !== null && m.awayScore !== null;
  const homeWin  = isPlayed && m.homeScore! > m.awayScore!;
  const awayWin  = isPlayed && m.awayScore! > m.homeScore!;

  // Look up player rosters from registrations
  const homeReg  = tournament.registrations.find((r) => r.team.id === m.homeTeamId);
  const awayReg  = tournament.registrations.find((r) => r.team.id === m.awayTeamId);
  const homePlayers = homeReg?.team.players ?? [];
  const awayPlayers = awayReg?.team.players ?? [];

  // Build card map per player { yellow, red }
  const cardMap: Record<string, { yellow: number; red: number }> = {};
  for (const c of m.cards) {
    if (!cardMap[c.playerId]) cardMap[c.playerId] = { yellow: 0, red: 0 };
    if (c.type === "YELLOW") cardMap[c.playerId].yellow++;
    else cardMap[c.playerId].red++;
  }

  // Build goal map per player { count }
  const goalMap: Record<string, number> = {};
  for (const g of m.goals) {
    goalMap[g.playerId] = (goalMap[g.playerId] ?? 0) + 1;
  }

  // Events sorted by minute
  type Event =
    | { kind: "goal";   minute: number | null; playerName: string; teamId: string; ownGoal?: boolean }
    | { kind: "card";   minute: number | null; playerName: string; teamId: string; cardType: string  };

  const events: Event[] = [
    ...m.goals.map((g): Event => ({
      kind: "goal",
      minute: g.minute,
      playerName: g.player.name,
      teamId: g.teamId,
      ownGoal: g.ownGoal ?? false,
    })),
    ...m.cards.map((c): Event => ({
      kind: "card",
      minute: c.minute,
      playerName: c.player.name,
      teamId: c.player.teamId,
      cardType: c.type,
    })),
  ].sort((a, b) => (a.minute ?? 999) - (b.minute ?? 999));

  const label = matchLabel(m);
  const dateStr = fmtDate(m.date);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="bg-[#0F1F47] text-white px-5 pt-5 pb-4 shrink-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-0.5">
                {tournament.name}
              </div>
              <div className="text-sm font-bold text-[#F59E0B]">{label}</div>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          {(dateStr || m.time) && (
            <div className="text-xs text-white/50 mt-1">
              {dateStr}{dateStr && m.time ? " · " : ""}{m.time}
            </div>
          )}
        </div>

        {/* ── Pitch + Score ── */}
        <div className="bg-[#1a5010] shrink-0 relative">
          <FootballPitch />

          {/* Score overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Home team — left */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2 max-w-[28%] text-right">
              <div
                className={`text-xs sm:text-sm font-bold leading-snug ${homeWin ? "text-[#FDE68A]" : "text-white"}`}
                style={{ textShadow: "0 1px 6px rgba(0,0,0,0.9)" }}
              >
                {m.homeTeam.name}
              </div>
            </div>

            {/* Score — exact center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-[#0F1F47]/90 backdrop-blur-sm rounded-xl px-4 sm:px-6 py-2 sm:py-3 text-center border border-white/20 shadow-xl">
                {isPlayed ? (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className={`text-2xl sm:text-4xl font-black font-mono ${homeWin ? "text-[#FDE68A]" : "text-white"}`}>
                      {m.homeScore}
                    </span>
                    <span className="text-white/30 text-xl sm:text-3xl font-light">–</span>
                    <span className={`text-2xl sm:text-4xl font-black font-mono ${awayWin ? "text-[#FDE68A]" : "text-white"}`}>
                      {m.awayScore}
                    </span>
                  </div>
                ) : (
                  <div className="text-white/60 text-sm font-semibold px-2 py-1">
                    {m.status === "LIVE" ? (
                      <span className="text-[#10B981] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse inline-block" />
                        Canlı
                      </span>
                    ) : "vs"}
                  </div>
                )}
                <div className="text-[9px] font-bold text-white/30 uppercase tracking-wider mt-0.5">
                  {m.status === "PLAYED" ? "FT" : m.status === "LIVE" ? "LIVE" : "—"}
                </div>
              </div>
            </div>

            {/* Away team — right */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 max-w-[28%] text-left">
              <div
                className={`text-xs sm:text-sm font-bold leading-snug ${awayWin ? "text-[#FDE68A]" : "text-white"}`}
                style={{ textShadow: "0 1px 6px rgba(0,0,0,0.9)" }}
              >
                {m.awayTeam.name}
              </div>
            </div>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1">

          {/* ── Lineup ── */}
          {(homePlayers.length > 0 || awayPlayers.length > 0) && (
            <div className="px-5 py-4 border-b border-[#F3F4F6]">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#0F1F47] mb-3">
                Kadro
              </div>
              <div className="flex gap-6">
                <LineupColumn
                  label={`⬤ ${m.homeTeam.name}`}
                  players={homePlayers}
                  lineupIds={m.homeLineup ?? []}
                  captainName={homeReg?.team.captain?.name}
                  cardMap={cardMap}
                  goalMap={goalMap}
                />
                <div className="w-px bg-[#F3F4F6] shrink-0" />
                <LineupColumn
                  label={`⬤ ${m.awayTeam.name}`}
                  players={awayPlayers}
                  lineupIds={m.awayLineup ?? []}
                  captainName={awayReg?.team.captain?.name}
                  cardMap={cardMap}
                  goalMap={goalMap}
                />
              </div>
            </div>
          )}

          {/* ── Events ── */}
          <div className="px-5 py-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#0F1F47] mb-3">
              Maç Olayları
            </div>

            {events.length === 0 ? (
              <p className="text-xs text-[#9CA3AF] italic">
                {isPlayed ? "Kayıtlı olay yok." : "Maç henüz oynanmadı."}
              </p>
            ) : (
              <div className="space-y-2">
                {events.map((ev, i) => {
                  const isHome = ev.teamId === m.homeTeamId;
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-3 ${isHome ? "flex-row" : "flex-row-reverse"}`}
                    >
                      {/* Minute */}
                      <span className="text-[10px] font-mono font-bold text-[#9CA3AF] w-8 shrink-0 text-center">
                        {ev.minute != null ? `${ev.minute}'` : "—"}
                      </span>

                      {/* Icon */}
                      <div className="shrink-0">
                        {ev.kind === "goal" ? (
                          <span className="text-base leading-none">{ev.ownGoal ? "⚽🔄" : "⚽"}</span>
                        ) : (
                          <CardIcon type={(ev as Extract<Event, { kind: "card" }>).cardType} />
                        )}
                      </div>

                      {/* Player + team */}
                      <div className={`flex-1 min-w-0 ${isHome ? "text-left" : "text-right"}`}>
                        <span className="text-xs font-semibold text-[#111827]">{ev.playerName}</span>
                        {ev.kind === "goal" && (ev as Extract<Event, { kind: "goal" }>).ownGoal && (
                          <span className="text-[10px] text-[#EF4444] ml-1">(kendi kalesine)</span>
                        )}
                        <div className="text-[10px] text-[#9CA3AF]">
                          {isHome ? m.homeTeam.name : m.awayTeam.name}
                        </div>
                      </div>

                      {/* Side indicator */}
                      <div
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          isHome ? "bg-[#0F1F47]" : "bg-[#6B7280]"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
