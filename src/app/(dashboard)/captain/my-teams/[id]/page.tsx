import { notFound } from "next/navigation";
import { getTeam } from "@/lib/actions/team";
import TeamDetailClient from "./TeamDetailClient";

export default async function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const team = await getTeam(id);
  if (!team) notFound();
  return <TeamDetailClient team={team} />;
}
