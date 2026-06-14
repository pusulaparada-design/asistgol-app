export const dynamic = "force-dynamic";
import { Bell, CheckCircle2, XCircle, Trophy, Megaphone, ClipboardList } from "lucide-react";
import { PageContent, PageHeader, Card } from "@/components/ui/PageShell";
import { getUserNotifications } from "@/lib/actions/notification";
import type { NotificationType } from "@prisma/client";
import { MarkAllReadButton } from "../../../(dashboard)/captain/notifications/MarkAllReadButton";
import { NotificationItem } from "@/components/notification/NotificationItem";

function fmtDate(d: Date) {
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const TYPE_META: Record<NotificationType, { icon: React.ReactNode; bg: string }> = {
  REGISTRATION_APPROVED: { icon: <CheckCircle2 size={18} className="text-[#059669]" />, bg: "bg-[#ECFDF5]" },
  REGISTRATION_REJECTED: { icon: <XCircle size={18} className="text-[#DC2626]" />,     bg: "bg-[#FEF2F2]" },
  REGISTRATION_RECEIVED: { icon: <ClipboardList size={18} className="text-[#2563EB]" />, bg: "bg-[#EFF6FF]" },
  MATCH_RESULT:          { icon: <Trophy size={18} className="text-[#F59E0B]" />,       bg: "bg-[#FEF3C7]" },
  ANNOUNCEMENT:          { icon: <Megaphone size={18} className="text-[#6B21A8]" />,    bg: "bg-[#F5F3FF]" },
};

export default async function OrganizerNotificationsPage() {
  const notifications = await getUserNotifications().catch(() => []);
  const unread = notifications.filter(n => !n.read).length;

  return (
    <PageContent>
      <PageHeader
        title="Bildirimler"
        subtitle={unread > 0 ? `${unread} okunmamış bildirim` : `${notifications.length} bildirim`}
      />

      {unread > 0 && (
        <div className="flex justify-end">
          <MarkAllReadButton />
        </div>
      )}

      <Card>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#F4F6F9] flex items-center justify-center mb-4">
              <Bell size={24} className="text-[#9CA3AF]" />
            </div>
            <div className="text-sm font-semibold text-[#374151]">Bildirim yok</div>
            <div className="text-xs text-[#9CA3AF] mt-1">Turnuva başvuruları burada görünecek</div>
          </div>
        ) : (
          <div className="divide-y divide-[#F3F4F6]">
            {notifications.map((n) => {
              const meta = TYPE_META[n.type];
              return (
                <NotificationItem
                  key={n.id}
                  id={n.id}
                  title={n.title}
                  body={n.body}
                  link={n.link}
                  read={n.read}
                  date={fmtDate(n.createdAt)}
                  icon={meta.icon}
                  iconBg={meta.bg}
                />
              );
            })}
          </div>
        )}
      </Card>
    </PageContent>
  );
}
