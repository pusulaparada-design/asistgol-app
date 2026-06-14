export const dynamic = "force-dynamic";
import { getAllMatchesAdmin } from "@/lib/actions/admin";
import AdminMatchesClient from "./AdminMatchesClient";

export default async function AdminMatchesPage() {
  const matches = await getAllMatchesAdmin().catch(() => []);

  return <AdminMatchesClient matches={matches} />;
}
