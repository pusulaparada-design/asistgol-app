import { Sidebar } from "@/components/layout/Sidebar";
import { getSession } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F6F9]">
      <Sidebar user={session ? { name: session.name, role: session.role } : null} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
