import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAdminLogs } from "@/lib/actions/admin";
import { PageContent, PageHeader } from "@/components/ui/PageShell";
import { LogsClient } from "./LogsClient";

export const dynamic = "force-dynamic";

export default async function AdminLogsPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const { logs, total } = await getAdminLogs({ limit: 100, skip: 0 });

  return (
    <PageContent>
      <PageHeader title="Sistem Logları" subtitle="Tüm kullanıcı aktiviteleri ve hata kayıtları" />
      <LogsClient initialLogs={logs as any} initialTotal={total} />
    </PageContent>
  );
}
