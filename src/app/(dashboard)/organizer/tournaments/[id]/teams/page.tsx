import { getTournamentRegistrations } from "@/lib/actions/tournament";
import TeamsClient from "./TeamsClient";

export const dynamic = "force-dynamic";

export default async function TournamentTeamsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const registrations = await getTournamentRegistrations(id);

  return <TeamsClient tournamentId={id} registrations={registrations} />;
}
