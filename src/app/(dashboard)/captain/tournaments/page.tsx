import { getMyTeams } from "@/lib/actions/team";
import { getTournaments } from "@/lib/actions/tournament";
import TournamentsClient from "./TournamentsClient";

export default async function CaptainTournamentsPage() {
  const [myTeams, allTournaments] = await Promise.all([
    getMyTeams().catch(() => []),
    getTournaments(),
  ]);

  return <TournamentsClient myTeams={myTeams} allTournaments={allTournaments} />;
}
