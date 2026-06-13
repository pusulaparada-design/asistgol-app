export const dynamic = "force-dynamic";
import { Calendar, MapPin, Zap } from "lucide-react";
import { PageContent, PageHeader, Card, CardHeader, ActionButton, StatusBadge, LiveBadge } from "@/components/ui/PageShell";
import { getTournamentMatches } from "@/lib/actions/match";
import { prisma } from "@/lib/prisma";

function fmtDate(d: Date | null) {
  if (!d) return "—";
  return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

type MatchRow = Awaited<ReturnType<typeof getTournamentMatches>>[number];

function MatchItem({ m }: { m: MatchRow }) {
  const isLive = m.status === "LIVE";
  const isPlayed = m.status === "PLAYED";
  return (
    <div className={`flex items-center gap-3 px-4 py-3 hover:bg-[#FAFAFA] transition-colors ${isLive ? "bg-[#FEF2F2]/30" : ""}`}>
      <span className="text-xs text-[#9CA3AF] w-12 shrink-0 font-mono">{m.time ?? "?"}</span>
      <div className="flex-1 grid grid-cols-3 items-center gap-2">
        <span className={`text-sm font-medium text-right ${isPlayed && (m.homeScore ?? 0) > (m.awayScore ?? 0) ? "text-[#059669]" : "text-[#111827]"}`}>
          {m.homeTeam.name}
        </span>
        <div className="text-center">
          {isLive ? (
            <LiveBadge />
          ) : isPlayed ? (
            <span className="font-mono font-bold text-sm text-[#111827]">{m.homeScore} - {m.awayScore}</span>
          ) : (
            <span className="text-xs text-[#9CA3AF]">vs</span>
          )}
        </div>
        <span className={`text-sm font-medium ${isPlayed && (m.awayScore ?? 0) > (m.homeScore ?? 0) ? "text-[#059669]" : "text-[#111827]"}`}>
          {m.awayTeam.name}
        </span>
      </div>
      <div className="shrink-0 text-right">
        <div className="text-xs text-[#9CA3AF]">{fmtDate(m.date)}</div>
        {m.venue && <div className="flex items-center justify-end gap-0.5 text-[10px] text-[#C4C9D4] mt-0.5"><MapPin size={9} />{m.venue}</div>}
      </div>
    </div>
  );
}

export default async function FixturePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [matches, tournament] = await Promise.all([
    getTournamentMatches(id).catch(() => []),
    prisma.tournament.findUnique({ where: { id }, select: { name: true } }),
  ]);

  // Separate group and knockout matches
  const groupMatches = matches.filter((m) => m.groupId !== null);
  const knockoutMatches = matches.filter((m) => m.groupId === null);

  // Group by group name
  const groupMap = new Map<string, MatchRow[]>();
  for (const m of groupMatches) {
    const name = m.group?.name ?? "Grup";
    if (!groupMap.has(name)) groupMap.set(name, []);
    groupMap.get(name)!.push(m);
  }

  // Group knockout by round
  const roundMap = new Map<string, MatchRow[]>();
  for (const m of knockoutMatches) {
    const round = m.round ?? "Eleme";
    if (!roundMap.has(round)) roundMap.set(round, []);
    roundMap.get(round)!.push(m);
  }

  return (
    <PageContent>
      <PageHeader
        title="Fikstür"
        subtitle={tournament?.name ?? "—"}
        actions={
          <ActionButton variant="primary" icon={Zap} size="sm">
            Otomatik Fikstür Oluştur
          </ActionButton>
        }
      />

      {groupMap.size > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[#374151] mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#3B82F6]" /> Grup Aşaması
          </h2>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {Array.from(groupMap.entries()).map(([groupName, gMatches]) => (
              <Card key={groupName}>
                <CardHeader
                  title={groupName}
                  subtitle={`${gMatches.filter((m) => m.status === "PLAYED").length}/${gMatches.length} maç oynandı`}
                  actions={<ActionButton variant="ghost" size="sm" icon={Calendar}>Tarih Ata</ActionButton>}
                />
                <div className="divide-y divide-[#F3F4F6]">
                  {gMatches.map((m) => <MatchItem key={m.id} m={m} />)}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {roundMap.size > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[#374151] mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Eleme Aşaması
          </h2>
          <div className="space-y-5">
            {Array.from(roundMap.entries()).map(([round, rMatches]) => (
              <Card key={round}>
                <CardHeader title={round} />
                <div className="divide-y divide-[#F3F4F6]">
                  {rMatches.map((m) => <MatchItem key={m.id} m={m} />)}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {matches.length === 0 && (
        <div className="py-12 text-center text-sm text-[#9CA3AF]">Henüz maç eklenmemiş</div>
      )}
    </PageContent>
  );
}
