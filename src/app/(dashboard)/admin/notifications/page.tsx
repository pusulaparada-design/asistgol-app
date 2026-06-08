import { Trophy, Users, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { PageContent, PageHeader, Card, ActionButton } from "@/components/ui/PageShell";

const notifications = [
  { id: 1, type: "organizer", icon: Users, title: "Yeni Organizatör Başvurusu", body: "Karadeniz Spor Kulübü platformumuza organizatör olarak başvurdu.", time: "5 dakika önce", read: false, color: "text-[#3B82F6]", bg: "bg-[#EFF6FF]" },
  { id: 2, type: "organizer", icon: Users, title: "Yeni Organizatör Başvurusu", body: "Çukurova Arena turnuva organizatörlüğü için başvurdu.", time: "23 dakika önce", read: false, color: "text-[#3B82F6]", bg: "bg-[#EFF6FF]" },
  { id: 3, type: "tournament", icon: Trophy, title: "Turnuva Tamamlandı", body: "Bahar Kupası 2026 sona erdi. Şampiyon: Rüzgar Spor.", time: "2 saat önce", read: false, color: "text-[#F59E0B]", bg: "bg-[#FEF3C7]" },
  { id: 4, type: "alert", icon: AlertTriangle, title: "Sistem Uyarısı", body: "Yaz Ligi fikstüründe 2 maç çakışması tespit edildi.", time: "5 saat önce", read: false, color: "text-[#EF4444]", bg: "bg-[#FEF2F2]" },
  { id: 5, type: "info", icon: Info, title: "Platform Raporu", body: "Haziran ayı platform raporu hazır. Bu ay 12 turnuva düzenlendi.", time: "1 gün önce", read: true, color: "text-[#6B7280]", bg: "bg-[#F3F4F6]" },
  { id: 6, type: "tournament", icon: CheckCircle, title: "Organizatör Onaylandı", body: "Marmara Spor Kulübü başvurusu onaylandı.", time: "2 gün önce", read: true, color: "text-[#10B981]", bg: "bg-[#ECFDF5]" },
];

export default function AdminNotificationsPage() {
  return (
    <PageContent>
      <PageHeader
        title="Bildirimler"
        subtitle="4 okunmamış bildirim"
        actions={<ActionButton variant="secondary" size="sm">Tümünü Okundu İşaretle</ActionButton>}
      />

      <Card>
        <div className="divide-y divide-[#F3F4F6]">
          {notifications.map((n) => (
            <div key={n.id} className={`flex gap-4 px-5 py-4 transition-colors hover:bg-[#FAFAFA] ${!n.read ? "bg-[#FFFBEB]/30" : ""}`}>
              <div className={`w-10 h-10 rounded-xl ${n.bg} flex items-center justify-center shrink-0`}>
                <n.icon size={18} className={n.color} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#111827]">{n.title}</span>
                  {!n.read && <span className="w-2 h-2 bg-[#F59E0B] rounded-full shrink-0" />}
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
