import { requireRole } from "@/lib/auth";

export default async function CaptainLayout({ children }: { children: React.ReactNode }) {
  await requireRole("CAPTAIN");
  return <>{children}</>;
}
