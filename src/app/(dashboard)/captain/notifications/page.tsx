import { Trophy, Swords, AlertTriangle, CheckCircle, Megaphone } from "lucide-react";
import { PageContent, PageHeader, Card, ActionButton } from "@/components/ui/PageShell";

const notifications = [
  { id: 1, icon: CheckCircle, title: "Başvurunuz Onaylandı", body: "Aslan FC, Akşam Kupası turnuvasına kaydınız onaylandı.", time: "1 saat önce", read: false, color: "text-[#10B981]", bg: "bg-[#ECFDF5]" },
  { id: 2, icon: Megaphone, title: "Turnuva Duyurusu", body: "Bosphorus Arena: Ramazan Kupası fikstür güncellendi. 8 Haziran maçlarını kontrol edin.", time: "3 saat önce", read: false, color: "text-[#3B82F6]", bg: "bg-[#EFF6FF]" },
  { id: 3, icon: AlertTriangle, title: "Ceza Uyarısı", body: "Alp Kaya 3. sarı kartını aldı. Bir sonraki maçta oynayamaz.", time: "5 saat önce", read: false, color: "text-[#D97706]", bg: "bg-[#FEF3C7]" },
  { id: 4, icon: Swords, title: "Maç Hatırlatması", body: "Yarın 19:00 — Aslan FC vs Kaplan SK. Bosphorus Saha 1.", time: "8 saat önce", read: true, color: "text-[#F59E0B]", bg: "bg-[#FEF3C7]" },
  { id: 5, icon: Trophy, title: "Puan Tablosu Güncellendi", body: "Ramazan Kupası Grup A güncel durum: Aslan FC 1. sırada.", time: "1 gün önce", read: true, color: "text-[#6B7280]", bg: "bg-[#F3F4F6]" },
];

export default function CaptainNotificationsPage() {
  return (
    <PageContent>
      <PageHeader
        title="Bildirimler"
        subtitle="3 okunmamış bildirim"
        actions={<ActionButton variant="secondary" size="sm">Tümünü Okundu İşaretle</ActionButton>}
      />
      <Card>
        <div className="divide-y divide-[#F3F4F6]">
          {notifications.map((n) => (
            <div key={n.id} className={`flex gap-4 px-5 py-4 hover:bg-[#FAFAFA] transition-colors ${!n.read ? "bg-[#FFFBEB]/20" : ""}`}>
              <div className={`w-10 h-10 rounded-xl ${n.bg} flex items-center justify-center shrink-0`}>
                <n.icon size={18} className={n.color} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#111827]">{n.title}</span>
                  {!n.read && <span className="w-2 h-2 bg-[#F59E0B] rounded-full" />}
                </div>
                <p className="text-sm text-[#6B7280] mt-0.5">{n.body}</p>
                <span className="text-xs text-[#9CA3AF] mt-1 block">{n.time}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </PageContent>
  );
}
