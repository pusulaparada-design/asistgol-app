import { LayoutShell } from "@/components/layout/LayoutShell";
import { getSession } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <LayoutShell user={session ? { name: session.name, role: session.role } : null}>
      {children}
    </LayoutShell>
  );
}
