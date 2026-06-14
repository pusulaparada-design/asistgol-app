import { notFound } from "next/navigation";
import { getTeamTournamentStats } from "@/lib/actions/tournament";
import TeamStatsClient from "@/components/tournament/TeamStatsClient";

export const dynamic = "force-dynamic";

export default async function OrganizerTeamStatsPage({
  params,
}: {
  params: Promise<{ id: string; teamId: string }>;
}) {
  const { id, teamId } = await params;
  const data = await getTeamTournamentStats(id, teamId);
  if (!data.team) notFound();
  return <TeamStatsClient data={data} backHref={`/organizer/tournaments/${id}`} />;
}
