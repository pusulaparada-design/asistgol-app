import { notFound } from "next/navigation";
import { getTournament } from "@/lib/actions/tournament";
import { getMyTeams } from "@/lib/actions/team";
import TournamentDetailClient from "./TournamentDetailClient";

export default async function TournamentPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [tournament, myTeams] = await Promise.all([
    getTournament(id),
    getMyTeams().catch(() => []),
  ]);

  if (!tournament) notFound();

  return <TournamentDetailClient tournament={tournament} myTeams={myTeams} />;
}
