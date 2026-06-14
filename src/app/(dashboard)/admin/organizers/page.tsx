export const dynamic = "force-dynamic";
import { getAllOrganizers } from "@/lib/actions/admin";
import OrganizersClient from "./OrganizersClient";

export default async function AdminOrganizersPage() {
  const organizers = await getAllOrganizers().catch(() => []);

  return <OrganizersClient organizers={organizers} />;
}
