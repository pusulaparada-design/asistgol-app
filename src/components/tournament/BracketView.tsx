"use client";

import type { getTournament } from "@/lib/actions/tournament";

type Tournament = NonNullable<Awaited<ReturnType<typeof getTournament>>>;
type TMatch = Tournament["matches"][number];
type Group = Tournament["groups"][number];

const MATCH_WIDTH  = 220;
const COL_GAP      = 48;
const LABEL_HEIGHT = 36;
const BASE_SLOT    = 112; // slot height in first round

const ROUND_NORMALIZE: Record<string, string> = {
  ROUND_OF_32: "Son 32", ROUND_OF_16: "Son 16",
  QUARTER_FINAL: "Çeyrek Final", SEMI_FINAL: "Yarı Final",
  FINAL: "Final",
};
const ROUND_ABBR: Record<string, string> = {
  "Final": "F", "Yarı Final": "YF",
  "Çeyrek Final": "ÇF", "Son 16": "S16", "Son 32": "S32",
};
// Ordered from smallest bracket (Final) outward
const ROUND_NAMES_BY_SIZE = ["Final", "Yarı Final", "Çeyrek Final", "Son 16", "Son 32"];

type SlotData = {
  homeLabel: string;
  awayLabel: string;
  homeScore: number | null;
  awayScore: number | null;
  homeWin: boolean;
  awayWin: boolean;
  date: Date | string | null;
  time: string | null;
  match: TMatch | null;
};

type BracketRound = {
  name: string;
  slots: SlotData[];
};

// ── Standings ───────────────────────────────────────────────────────────────

function computeGroupStandings(group: Group, matches: TMatch[], winPts: number) {
  const rows = group.teams.map(gt => ({
    team: gt.team,
    played: 0, wins: 0, draws: 0, losses: 0,
    goalsFor: 0, goalsAgainst: 0, points: 0,
  }));
  for (const m of matches) {
    if (m.groupId !== group.id || m.homeScore === null || m.awayScore === null) continue;
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

function isGroupComplete(group: Group, matches: TMatch[]): boolean {
  const gm = matches.filter(m => m.groupId === group.id);
  return gm.length > 0 && gm.every(m => m.homeScore !== null);
}

// ── Bracket builder ─────────────────────────────────────────────────────────

function buildBracket(
  groups: Group[],
  matches: TMatch[],
  advanceCount: number,
  winPts: number,
): BracketRound[] {
  if (groups.length < 2 || advanceCount < 1) return [];

  const totalTeams = groups.length * advanceCount;
  if (totalTeams < 2) return [];

  const numRounds = Math.ceil(Math.log2(Math.max(totalTeams, 2)));
  // roundNames[0] = earliest round (e.g. "Çeyrek Final"), roundNames[last] = "Final"
  const roundNames: string[] = Array.from({ length: numRounds }, (_, i) =>
    ROUND_NAMES_BY_SIZE[numRounds - 1 - i] ?? `Tur ${i + 1}`
  );

  const standings = groups.map(g => computeGroupStandings(g, matches, winPts));
  const complete  = groups.map(g => isGroupComplete(g, matches));

  const labelAt = (gi: number, rank: number): string => {
    if (complete[gi] && standings[gi].length >= rank) return standings[gi][rank - 1].team.name;
    return `${groups[gi].name} ${rank}.`;
  };

  // QF seed pairs: for paired groups (A,B), (C,D)…
  // Pattern for advanceCount=K: r=1 → A[1] vs B[K], r=2 → B[1] vs A[K], r=3 → A[2] vs B[K-1]…
  const qfPairs: { home: [number, number]; away: [number, number] }[] = [];
  for (let gi = 0; gi < groups.length; gi += 2) {
    const gj = gi + 1;
    if (gj >= groups.length) break;
    for (let r = 1; r <= advanceCount; r++) {
      const rank    = Math.ceil(r / 2);
      const oppRank = advanceCount + 1 - rank;
      if (r % 2 === 1) qfPairs.push({ home: [gi, rank], away: [gj, oppRank] });
      else             qfPairs.push({ home: [gj, rank], away: [gi, oppRank] });
    }
  }

  // Map actual knockout DB matches by normalized round name
  const dbByRound = new Map<string, TMatch[]>();
  for (const m of matches.filter(m => !m.groupId && m.round)) {
    const name = ROUND_NORMALIZE[m.round!] ?? m.round!;
    if (!dbByRound.has(name)) dbByRound.set(name, []);
    dbByRound.get(name)!.push(m);
  }

  const rounds: BracketRound[] = [];
  let prevSlots: SlotData[] = [];

  for (let ri = 0; ri < numRounds; ri++) {
    const roundName = roundNames[ri];
    const dbSlots   = dbByRound.get(roundName) ?? [];
    const numSlots  = Math.pow(2, numRounds - 1 - ri);
    const slots: SlotData[] = [];

    for (let si = 0; si < numSlots; si++) {
      let homeLabel: string, awayLabel: string;

      if (ri === 0) {
        const pair = qfPairs[si];
        homeLabel = pair ? labelAt(...pair.home) : "—";
        awayLabel = pair ? labelAt(...pair.away) : "—";
      } else {
        const p1   = prevSlots[si * 2];
        const p2   = prevSlots[si * 2 + 1];
        const abbr = ROUND_ABBR[roundNames[ri - 1]] ?? roundNames[ri - 1];
        homeLabel  = p1
          ? (p1.homeWin ? p1.homeLabel : p1.awayWin ? p1.awayLabel : `${abbr}-${si * 2 + 1} G.`)
          : "—";
        awayLabel  = p2
          ? (p2.homeWin ? p2.homeLabel : p2.awayWin ? p2.awayLabel : `${abbr}-${si * 2 + 2} G.`)
          : "—";
      }

      const db = dbSlots[si];
      if (db) {
        const played  = db.homeScore !== null && db.awayScore !== null;
        const homeWin = played && db.homeScore! > db.awayScore!;
        const awayWin = played && db.awayScore! > db.homeScore!;
        slots.push({
          homeLabel: db.homeTeam?.name ?? homeLabel,
          awayLabel: db.awayTeam?.name ?? awayLabel,
          homeScore: db.homeScore, awayScore: db.awayScore,
          homeWin, awayWin,
          date: db.date ?? null,
          time: db.time ?? null,
          match: db,
        });
      } else {
        slots.push({ homeLabel, awayLabel, homeScore: null, awayScore: null, homeWin: false, awayWin: false, date: null, time: null, match: null });
      }
    }

    rounds.push({ name: roundName, slots });
    prevSlots = slots;
  }

  return rounds;
}

// ── Sub-components ──────────────────────────────────────────────────────────

function fmtDate(d: Date | string | null) {
  if (!d) return null;
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

function SlotCard({ slot, onClick }: { slot: SlotData; onClick?: () => void }) {
  const dateStr = fmtDate(slot.date);
  const timeStr = slot.time ?? null;
  const hasDateTime = dateStr || timeStr;

  const row = (name: string, score: number | null, win: boolean, border: boolean) => (
    <div className={`flex items-center justify-between px-3 py-2 ${border ? "border-b border-[#E5E7EB]" : ""} ${win ? "bg-[#F0FDF4]" : ""}`}>
      <span className={`text-sm truncate leading-tight max-w-[155px] ${win ? "font-bold text-[#166534]" : score === null ? "text-[#9CA3AF] italic" : "text-[#374151]"}`}>
        {name}
      </span>
      {score !== null && (
        <span className={`font-mono font-bold text-base ml-2 shrink-0 ${win ? "text-[#166534]" : "text-[#9CA3AF]"}`}>
          {score}
        </span>
      )}
    </div>
  );

  return (
    <div
      className={`w-full rounded-lg border border-[#E5E7EB] overflow-hidden bg-white shadow-sm ${onClick ? "cursor-pointer hover:border-[#0F1F47]/40 hover:shadow-md transition-all" : ""}`}
      onClick={onClick}
    >
      {hasDateTime && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAFC] border-b border-[#E5E7EB]">
          {dateStr && <span className="text-[10px] font-semibold text-[#6B7280]">{dateStr}</span>}
          {dateStr && timeStr && <span className="text-[#D1D5DB] text-[10px]">·</span>}
          {timeStr && <span className="text-[10px] font-mono font-semibold text-[#374151]">{timeStr}</span>}
        </div>
      )}
      {row(slot.homeLabel, slot.homeScore, slot.homeWin, true)}
      {row(slot.awayLabel, slot.awayScore, slot.awayWin, false)}
    </div>
  );
}

function BracketConnector({ matchCount, slotHeight }: { matchCount: number; slotHeight: number }) {
  const height    = matchCount * slotHeight;
  const halfW     = COL_GAP / 2;
  const pairCount = Math.floor(matchCount / 2);
  return (
    <svg width={COL_GAP} height={height} style={{ display: "block", flexShrink: 0 }}>
      {Array.from({ length: pairCount }, (_, i) => {
        const topY    = (i * 2)     * slotHeight + slotHeight / 2;
        const bottomY = (i * 2 + 1) * slotHeight + slotHeight / 2;
        const midY    = (topY + bottomY) / 2;
        const p       = { stroke: "#CBD5E1", strokeWidth: 1.5, strokeLinecap: "round" as const };
        return [
          <line key={`ht-${i}`} x1={0}       y1={topY}    x2={halfW}   y2={topY}    {...p} />,
          <line key={`v-${i}`}  x1={halfW}   y1={topY}    x2={halfW}   y2={bottomY} {...p} />,
          <line key={`hb-${i}`} x1={0}       y1={bottomY} x2={halfW}   y2={bottomY} {...p} />,
          <line key={`hm-${i}`} x1={halfW}   y1={midY}    x2={COL_GAP} y2={midY}    {...p} />,
        ];
      })}
    </svg>
  );
}

// ── Main export ─────────────────────────────────────────────────────────────

export function BracketView({
  matches,
  groups,
  advanceCount,
  winPoints,
  onMatchClick,
}: {
  matches: Tournament["matches"];
  groups: Tournament["groups"];
  advanceCount: number;
  winPoints: number;
  onMatchClick?: (match: TMatch) => void;
}) {
  const rounds = buildBracket(groups, matches, advanceCount, winPoints);

  if (rounds.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-[#9CA3AF]">
        Eleme aşaması için yeterli grup verisi bulunamadı.
      </div>
    );
  }

  const firstRoundCount = rounds[0].slots.length;
  const totalSlotHeight = firstRoundCount * BASE_SLOT;
  const finalSlot       = rounds[rounds.length - 1].slots[0];
  const champion        = finalSlot?.homeWin ? finalSlot.homeLabel
                        : finalSlot?.awayWin ? finalSlot.awayLabel
                        : null;

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex items-start p-2">
        {rounds.map((round, ri) => {
          const slotHeight = BASE_SLOT * Math.pow(2, ri);
          const isLast     = ri === rounds.length - 1;

          return (
            <div key={round.name} className="flex items-start">
              <div style={{ width: MATCH_WIDTH }}>
                <div style={{ height: LABEL_HEIGHT }} className="flex items-start justify-center pt-0.5">
                  <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">
                    {round.name}
                  </span>
                </div>
                {round.slots.map((slot, si) => (
                  <div key={si} style={{ height: slotHeight }} className="flex items-center">
                    <SlotCard
                      slot={slot}
                      onClick={slot.match && onMatchClick ? () => onMatchClick(slot.match!) : undefined}
                    />
                  </div>
                ))}
              </div>

              {!isLast && (
                <div>
                  <div style={{ height: LABEL_HEIGHT }} />
                  <BracketConnector matchCount={round.slots.length} slotHeight={slotHeight} />
                </div>
              )}
            </div>
          );
        })}

        {/* Şampiyon kartı */}
        <div
          className="flex items-center ml-5"
          style={{ paddingTop: LABEL_HEIGHT, height: totalSlotHeight }}
        >
          <div className={`rounded-2xl px-5 py-4 text-center shadow-lg min-w-[130px] ${champion ? "bg-[#052e16] text-white" : "bg-[#F4F6F9] border border-dashed border-[#D1D5DB]"}`}>
            <div className="text-2xl mb-1.5">🏆</div>
            <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${champion ? "text-[#6EE7B7]" : "text-[#9CA3AF]"}`}>
              Şampiyon
            </div>
            <div className={`font-bold text-sm ${champion ? "text-white" : "text-[#D1D5DB]"}`}>
              {champion ?? "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
