import { Bell } from "lucide-react";
import { PageContent, PageHeader, Card } from "@/components/ui/PageShell";

export default function AdminNotificationsPage() {
  return (
    <PageContent>
      <PageHeader title="Bildirimler" subtitle="Platform bildirimleri" />
      <Card>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#F4F6F9] flex items-center justify-center mb-4">
            <Bell size={24} className="text-[#9CA3AF]" />
          </div>
          <div className="text-sm font-semibold text-[#374151]">Bildirim yok</div>
          <div className="text-xs text-[#9CA3AF] mt-1">Platform bildirimleri burada görünecek</div>
        </div>
      </Card>
    </PageContent>
  );
}
