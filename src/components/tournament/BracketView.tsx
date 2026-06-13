"use client";

import type { getTournament } from "@/lib/actions/tournament";

type Tournament = NonNullable<Awaited<ReturnType<typeof getTournament>>>;
type TMatch = Tournament["matches"][number];

const MATCH_HEIGHT = 76;   // px per team row × 2 = card height
const MATCH_WIDTH  = 260;
const COL_GAP      = 48;   // width of SVG connector between columns
const LABEL_HEIGHT = 36;

const ROUND_ORDER: Record<string, number> = {
  ROUND_OF_32: 0, "Son 32": 0,
  ROUND_OF_16: 1, "Son 16": 1,
  QUARTER_FINAL: 2, "Çeyrek Final": 2,
  SEMI_FINAL: 3, "Yarı Final": 3,
  FINAL: 4, Final: 4,
};

const ROUND_LABELS: Record<string, string> = {
  ROUND_OF_32: "Son 32",
  ROUND_OF_16: "Son 16",
  QUARTER_FINAL: "Çeyrek Final",
  SEMI_FINAL: "Yarı Final",
  FINAL: "Final",
  THIRD_PLACE: "3. Yer",
};

function label(round: string) {
  return ROUND_LABELS[round] ?? round;
}

function MatchCard({ match }: { match: TMatch }) {
  const played = match.homeScore !== null && match.awayScore !== null;
  const homeWin = played && match.homeScore! > match.awayScore!;
  const awayWin = played && match.awayScore! > match.homeScore!;

  const row = (name: string | undefined, score: number | null, win: boolean, border: boolean) => (
    <div className={`flex items-center justify-between px-3 py-2.5 ${border ? "border-b border-[#E5E7EB]" : ""} ${win ? "bg-[#F0FDF4]" : ""}`}>
      <span className={`text-sm truncate leading-tight ${win ? "font-bold text-[#166534]" : "text-[#374151]"}`}>
        {name ?? "—"}
      </span>
      {played && (
        <span className={`font-mono font-bold text-base ml-3 shrink-0 ${win ? "text-[#166534]" : "text-[#9CA3AF]"}`}>
          {score}
        </span>
      )}
    </div>
  );

  return (
    <div className="w-full rounded-lg border border-[#E5E7EB] overflow-hidden bg-white shadow-sm">
      {row(match.homeTeam?.name, match.homeScore, homeWin, true)}
      {row(match.awayTeam?.name, match.awayScore, awayWin, false)}
    </div>
  );
}

function BracketConnector({ matchCount, slotHeight }: { matchCount: number; slotHeight: number }) {
  const height = matchCount * slotHeight;
  const halfW = COL_GAP / 2;
  const pairCount = Math.floor(matchCount / 2);

  return (
    <svg width={COL_GAP} height={height} style={{ display: "block", flexShrink: 0 }}>
      {Array.from({ length: pairCount }, (_, i) => {
        const topY    = (i * 2)     * slotHeight + slotHeight / 2;
        const bottomY = (i * 2 + 1) * slotHeight + slotHeight / 2;
        const midY    = (topY + bottomY) / 2;
        const props   = { stroke: "#CBD5E1", strokeWidth: 1.5, strokeLinecap: "round" as const };
        return [
          <line key={`ht-${i}`} x1={0}     y1={topY}    x2={halfW} y2={topY}    {...props} />,
          <line key={`v-${i}`}  x1={halfW} y1={topY}    x2={halfW} y2={bottomY} {...props} />,
          <line key={`hb-${i}`} x1={0}     y1={bottomY} x2={halfW} y2={bottomY} {...props} />,
          <line key={`hm-${i}`} x1={halfW} y1={midY}    x2={COL_GAP} y2={midY}  {...props} />,
        ];
      })}
    </svg>
  );
}

export function BracketView({ matches }: { matches: Tournament["matches"] }) {
  const knockoutMatches = matches.filter(m => !m.groupId && m.round);

  if (knockoutMatches.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-[#9CA3AF]">
        Henüz eleme aşaması fikstürü oluşturulmadı.
      </div>
    );
  }

  // Group by round
  const roundMap = new Map<string, TMatch[]>();
  for (const m of knockoutMatches) {
    const r = m.round!;
    if (!roundMap.has(r)) roundMap.set(r, []);
    roundMap.get(r)!.push(m);
  }

  // Sort rounds earliest → latest
  const sortedRounds = Array.from(roundMap.keys()).sort((a, b) => {
    const oa = ROUND_ORDER[a] ?? -1;
    const ob = ROUND_ORDER[b] ?? -1;
    if (oa !== -1 && ob !== -1) return oa - ob;
    return (roundMap.get(b)?.length ?? 0) - (roundMap.get(a)?.length ?? 0);
  });

  const BASE_UNIT       = MATCH_HEIGHT + 16; // slot height in first round
  const firstRoundCount = roundMap.get(sortedRounds[0])?.length ?? 1;
  const totalMatchHeight = firstRoundCount * BASE_UNIT;

  // Champion
  const finalMatch = roundMap.get(sortedRounds[sortedRounds.length - 1])?.[0];
  const champion = (() => {
    if (!finalMatch?.homeScore && finalMatch?.homeScore !== 0) return null;
    if (finalMatch.homeScore! > finalMatch.awayScore!) return finalMatch.homeTeam;
    if (finalMatch.awayScore! > finalMatch.homeScore!) return finalMatch.awayTeam;
    return null;
  })();

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex items-start p-2">
        {sortedRounds.map((round, roundIdx) => {
          const roundMatches = roundMap.get(round)!;
          const slotHeight   = BASE_UNIT * Math.pow(2, roundIdx);
          const isLast       = roundIdx === sortedRounds.length - 1;

          return (
            <div key={round} className="flex items-start">
              {/* Round column */}
              <div style={{ width: MATCH_WIDTH }}>
                <div
                  style={{ height: LABEL_HEIGHT }}
                  className="flex items-start justify-center pt-0.5"
                >
                  <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">
                    {label(round)}
                  </span>
                </div>

                {roundMatches.map(m => (
                  <div
                    key={m.id}
                    style={{ height: slotHeight }}
                    className="flex items-center"
                  >
                    <MatchCard match={m} />
                  </div>
                ))}
              </div>

              {/* Connector SVG */}
              {!isLast && (
                <div>
                  <div style={{ height: LABEL_HEIGHT }} />
                  <BracketConnector
                    matchCount={roundMatches.length}
                    slotHeight={slotHeight}
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* Şampiyon kartı */}
        <div
          className="flex items-center ml-5"
          style={{ paddingTop: LABEL_HEIGHT, height: totalMatchHeight }}
        >
          <div className={`rounded-2xl px-5 py-4 text-center shadow-lg min-w-[130px] ${champion ? "bg-[#052e16] text-white" : "bg-[#F4F6F9] border border-dashed border-[#D1D5DB]"}`}>
            <div className="text-2xl mb-1.5">{champion ? "🏆" : "🏆"}</div>
            <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${champion ? "text-[#6EE7B7]" : "text-[#9CA3AF]"}`}>
              Şampiyon
            </div>
            <div className={`font-bold text-sm ${champion ? "text-white" : "text-[#D1D5DB]"}`}>
              {champion?.name ?? "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
