import { getTournamentMatches } from "@/lib/actions/tournament";
import MatchesClient from "./MatchesClient";

export const dynamic = "force-dynamic";

export default async function MatchesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const matches = await getTournamentMatches(id);
  return <MatchesClient tournamentId={id} matches={matches} />;
}
