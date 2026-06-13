import { notFound } from "next/navigation";
import { getTournament } from "@/lib/actions/tournament";
import TournamentDetailClient from "./TournamentDetailClient";

export default async function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tournament = await getTournament(id);
  if (!tournament) notFound();
  return <TournamentDetailClient tournament={tournament} />;
}
