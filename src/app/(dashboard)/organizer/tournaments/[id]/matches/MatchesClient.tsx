"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Play, Trophy } from "lucide-react";
import { PageContent, PageHeader, Card, StatusBadge } from "@/components/ui/PageShell";
import { getTournamentMatches } from "@/lib/actions/tournament";
import MatchModal, { type SaveResult } from "../MatchModal";

type Matches = Awaited<ReturnType<typeof getTournamentMatches>>;
type TMatch = Matches[number];

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

export default function MatchesClient({
  tournamentId: _tournamentId,
  matches: initialMatches,
}: {
  tournamentId: string;
  matches: Matches;
}) {
  const [matches, setMatches] = useState(initialMatches);
  const [selected, setSelected] = useState<TMatch | null>(null);
  const router = useRouter();

  function handleSaved({ matchId, status, homeScore, awayScore }: SaveResult) {
    setMatches(prev => prev.map(m =>
      m.id === matchId ? { ...m, status, homeScore, awayScore } : m
    ));
    router.refresh();
  }

  const played    = matches.filter(m => m.status === "PLAYED");
  const live      = matches.filter(m => m.status === "LIVE");
  const remaining = matches.filter(m => m.status === "SCHEDULED");

  const grouped = new Map<string, TMatch[]>();
  for (const m of matches) {
    const lbl = matchLabel(m);
    if (!grouped.has(lbl)) grouped.set(lbl, []);
    grouped.get(lbl)!.push(m);
  }

  return (
    <PageContent>
      <PageHeader
        title="Skor Girişi"
        subtitle={`${played.length} oynandı · ${live.length} devam ediyor · ${remaining.length} kalan`}
      />

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Toplam",       val: matches.length,   color: "text-[#0F1F47]" },
          { label: "Oynandı",      val: played.length,    color: "text-[#10B981]" },
          { label: "Devam Ediyor", val: live.length,      color: "text-[#F59E0B]" },
          { label: "Planlandı",    val: remaining.length, color: "text-[#6B7280]" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-[#E5E7EB] p-4 text-center">
            <div className={`text-2xl font-extrabold ${s.color}`}>{s.val}</div>
            <div className="text-xs text-[#9CA3AF] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {Array.from(grouped.entries()).map(([lbl, grpMatches]) => (
        <Card key={lbl}>
          <div className="px-5 py-3 border-b border-[#F3F4F6] flex items-center gap-2">
            <Trophy size={14} className="text-[#F59E0B]" />
            <span className="text-sm font-bold text-[#111827]">{lbl}</span>
            <span className="ml-auto text-xs text-[#9CA3AF]">
              {grpMatches.filter(m => m.homeScore !== null).length}/{grpMatches.length} oynandı
            </span>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {grpMatches.map(m => {
              const isPlayed    = m.status === "PLAYED";
              const isLive      = m.status === "LIVE";
              const isScheduled = m.status === "SCHEDULED";
              return (
                <div key={m.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-[#FAFAFA] transition-colors">
                  <div className="w-20 shrink-0 text-xs text-[#9CA3AF] leading-tight">
                    {fmt(m.date)}{m.time ? <><br /><span className="font-medium text-[#374151]">{m.time}</span></> : ""}
                  </div>
                  <div className="flex-1 text-right text-sm font-semibold text-[#111827] truncate">{m.homeTeam.name}</div>
                  <div className="w-20 text-center shrink-0">
                    {isPlayed
                      ? <span className="font-mono font-extrabold text-base text-[#111827]">{m.homeScore} – {m.awayScore}</span>
                      : isLive
                        ? <span className="font-mono font-extrabold text-base text-[#F59E0B]">{m.homeScore ?? 0} – {m.awayScore ?? 0}</span>
                        : <span className="text-xs text-[#D1D5DB] font-mono">vs</span>
                    }
                  </div>
                  <div className="flex-1 text-sm font-semibold text-[#111827] truncate">{m.awayTeam.name}</div>
                  <div className="shrink-0 flex items-center gap-2">
                    <StatusBadge
                      label={isPlayed ? "Oynandı" : isLive ? "Devam Ediyor" : "Planlandı"}
                      variant={isPlayed ? "gray" : isLive ? "gold" : "blue"}
                      dot={false}
                    />
                    {isPlayed ? (
                      <span className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-[#F3F4F6] text-[#6B7280]">
                        Oynandı
                      </span>
                    ) : isLive ? (
                      <button
                        onClick={() => setSelected(m)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] transition-colors"
                      >
                        <Edit2 size={11} />
                        Düzenle
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelected(m)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-[#ECFDF5] text-[#059669] hover:bg-[#D1FAE5] transition-colors"
                      >
                        <Play size={11} />
                        Başlat
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ))}

      {matches.length === 0 && (
        <Card>
          <div className="py-12 text-center text-sm text-[#9CA3AF]">Henüz maç oluşturulmadı.</div>
        </Card>
      )}

      {selected && (
        <MatchModal
          match={selected}
          onClose={() => setSelected(null)}
          onSaved={handleSaved}
        />
      )}
    </PageContent>
  );
}
