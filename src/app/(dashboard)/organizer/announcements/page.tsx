export const dynamic = "force-dynamic";
import { getOrganizerAnnouncements, getOrganizerTournamentsWithTeams } from "@/lib/actions/announcement";
import AnnouncementsClient from "./AnnouncementsClient";

export default async function AnnouncementsPage() {
  const [announcements, tournaments] = await Promise.all([
    getOrganizerAnnouncements().catch(() => []),
    getOrganizerTournamentsWithTeams().catch(() => []),
  ]);

  return <AnnouncementsClient announcements={announcements} tournaments={tournaments} />;
}
