import { requireRole } from "@/lib/auth";

export default async function OrganizerLayout({ children }: { children: React.ReactNode }) {
  await requireRole("ORGANIZER");
  return <>{children}</>;
}
