import { notFound } from "next/navigation";
import { getTournament } from "@/lib/actions/tournament";
import { getMyTeams } from "@/lib/actions/team";
import TournamentDetailClient from "@/components/tournament/TournamentDetailClient";

export const dynamic = "force-dynamic";

export default async function CaptainTournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [tournament, myTeams] = await Promise.all([
    getTournament(id),
    getMyTeams().catch(() => []),
  ]);
  if (!tournament) notFound();
  return <TournamentDetailClient tournament={tournament} myTeams={myTeams} isOrganizer={false} />;
}
