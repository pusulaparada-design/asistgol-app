import { notFound } from "next/navigation";
import { getTournament } from "@/lib/actions/tournament";
import TournamentDetailClient from "@/components/tournament/TournamentDetailClient";

export const dynamic = "force-dynamic";

export default async function AdminTournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tournament = await getTournament(id);
  if (!tournament) notFound();
  return <TournamentDetailClient tournament={tournament} isOrganizer={false} basePath="/admin/tournaments" />;
}
