export const dynamic = "force-dynamic";
import { getAllTeams } from "@/lib/actions/admin";
import AdminTeamsClient from "./TeamsClient";

export default async function AdminTeamsPage() {
  const teams = await getAllTeams().catch(() => []);
  return <AdminTeamsClient teams={teams} />;
}
