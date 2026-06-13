import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PageContent, PageHeader } from "@/components/ui/PageShell";
import SettingsClient from "./SettingsClient";

export default async function OrganizerSettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true, phone: true, city: true },
  });
  if (!user) redirect("/login");

  return (
    <PageContent>
      <PageHeader title="Ayarlar" subtitle="Hesap ve organizasyon bilgileri" />
      <SettingsClient user={user} />
    </PageContent>
  );
}
