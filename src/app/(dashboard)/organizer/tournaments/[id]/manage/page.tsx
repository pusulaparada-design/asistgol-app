import { getTournamentMatches, getTournamentRegistrations, getGroupsWithTeams } from "@/lib/actions/tournament";
import ManageClient from "./ManageClient";

export const dynamic = "force-dynamic";

export default async function ManagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [matches, registrations, groups] = await Promise.all([
    getTournamentMatches(id),
    getTournamentRegistrations(id),
    getGroupsWithTeams(id),
  ]);
  return <ManageClient tournamentId={id} matches={matches} registrations={registrations} groups={groups} />;
}
