import { getTournamentMatches, getTournamentRegistrations, getGroupsWithTeams, getTournament } from "@/lib/actions/tournament";
import ManageClient from "./ManageClient";

export const dynamic = "force-dynamic";

export default async function ManagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [matches, registrations, groups, tournament] = await Promise.all([
    getTournamentMatches(id),
    getTournamentRegistrations(id),
    getGroupsWithTeams(id),
    getTournament(id),
  ]);
  if (!tournament) return <div className="p-8 text-sm text-[#9CA3AF]">Turnuva bulunamadı.</div>;
  return <ManageClient tournamentId={id} matches={matches} registrations={registrations} groups={groups} tournament={tournament} />;
}
