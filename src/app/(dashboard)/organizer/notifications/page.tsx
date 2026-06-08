import { Users, Trophy, AlertTriangle, CheckCircle } from "lucide-react";
import { PageContent, PageHeader, Card, ActionButton } from "@/components/ui/PageShell";

const notifications = [
  { id: 1, icon: Users, title: "Yeni Takım Başvurusu", body: "Yıldırım SK turnuvanıza katılmak istiyor. Başvuruyu inceleyin.", time: "12 dakika önce", read: false, color: "text-[#3B82F6]", bg: "bg-[#EFF6FF]" },
  { id: 2, icon: Users, title: "Yeni Takım Başvurusu", body: "Şimşek FC kayıt talebinde bulundu.", time: "45 dakika önce", read: false, color: "text-[#3B82F6]", bg: "bg-[#EFF6FF]" },
  { id: 3, icon: AlertTriangle, title: "Kart Cezası Uyarısı", body: "Kemal Yıldız (Ateş FC) 3. sarı kartını aldı. Otomatik olarak askıya alındı.", time: "2 saat önce", read: false, color: "text-[#D97706]", bg: "bg-[#FEF3C7]" },
  { id: 4, icon: CheckCircle, title: "Maç Sonucu Kaydedildi", body: "Aslan FC 3 - 1 Kaplan SK maçı sisteme kaydedildi.", time: "5 saat önce", read: false, color: "text-[#10B981]", bg: "bg-[#ECFDF5]" },
  { id: 5, icon: Trophy, title: "Turnuva İlerleme", body: "Ramazan Kupası grup aşaması %40 tamamlandı.", time: "1 gün önce", read: true, color: "text-[#F59E0B]", bg: "bg-[#FEF3C7]" },
  { id: 6, icon: Users, title: "Takım Profil Güncellendi", body: "Rüzgar Spor oyuncu kadrosunu güncelledi.", time: "2 gün önce", read: true, color: "text-[#6B7280]", bg: "bg-[#F3F4F6]" },
];

export default function OrganizerNotificationsPage() {
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
