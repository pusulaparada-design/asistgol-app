import { Trophy, Users, Swords, ShieldCheck, TrendingUp, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { PageContent, PageHeader, StatCard, Card, CardHeader, TableHeader, StatusBadge, ActionButton } from "@/components/ui/PageShell";

const stats = [
  { label: "Aktif Turnuva", value: 12, icon: Trophy, color: "blue" as const, trend: "up" as const, trendLabel: "+3 bu ay" },
  { label: "Toplam Takım", value: 148, icon: Users, color: "gold" as const, trend: "up" as const, trendLabel: "+22 bu hafta" },
  { label: "Bu Haftaki Maç", value: 34, icon: Swords, color: "green" as const, sublabel: "3 canlı" },
  { label: "Onay Bekleyen Org.", value: 5, icon: ShieldCheck, color: "orange" as const },
  { label: "Tamamlanan Turnuva", value: 47, icon: CheckCircle, color: "teal" as const },
  { label: "Toplam Oyuncu", value: "1.842", icon: TrendingUp, color: "purple" as const },
];

const pendingOrganizers = [
  { name: "Yıldız Spor Kulübü", contact: "Ahmet Kaya", city: "İstanbul", date: "2026-06-06", tournaments: 0 },
  { name: "Bosphorus FC", contact: "Mehmet Demir", city: "İstanbul", date: "2026-06-07", tournaments: 0 },
  { name: "Anadolu Arena", contact: "Ali Yılmaz", city: "Ankara", date: "2026-06-07", tournaments: 2 },
  { name: "Karadeniz Spor", contact: "Hasan Çelik", city: "Trabzon", date: "2026-06-08", tournaments: 0 },
  { name: "Ege Futbol Kulübü", contact: "Can Şahin", city: "İzmir", date: "2026-06-08", tournaments: 1 },
];

const recentActivity = [
  { icon: Trophy, text: "Yeni turnuva oluşturuldu: Ramazan Kupası 2026", time: "5dk önce", color: "text-[#3B82F6]" },
  { icon: Users, text: "Çınar FC turnuvaya kaydoldu", time: "18dk önce", color: "text-[#10B981]" },
  { icon: Swords, text: "Maç sonucu girildi: Aslan FC 3 - 1 Kaplan SK", time: "1sa önce", color: "text-[#F59E0B]" },
  { icon: AlertTriangle, text: "Sarı kart cezası: Emre Çelik (2. kart)", time: "2sa önce", color: "text-[#EF4444]" },
  { icon: ShieldCheck, text: "Bosphorus Arena organizatör onaylandı", time: "3sa önce", color: "text-[#8B5CF6]" },
  { icon: CheckCircle, text: "Bahar Kupası tamamlandı — Şampiyon: Rüzgar FC", time: "1g önce", color: "text-[#10B981]" },
];

const activeTournaments = [
  { name: "Ramazan Kupası 2026", organizer: "Bosphorus Arena", teams: "12/16", phase: "Grup Aşaması", status: "active" },
  { name: "Yaz Ligi 2026", organizer: "Yıldız Spor", teams: "8/8", phase: "Eleme", status: "active" },
  { name: "İstanbul Cup", organizer: "Arena Spor", teams: "6/8", phase: "Kayıt Açık", status: "registration" },
  { name: "Gençlik Turnuvası", organizer: "Anadolu SK", teams: "10/12", phase: "Grup Aşaması", status: "active" },
];

export default function AdminDashboard() {
  return (
    <PageContent>
      <PageHeader
        title="Platform Dashboard"
        subtitle="Genel platform özeti ve bekleyen işlemler"
        actions={
          <div className="flex items-center gap-2 text-xs text-[#6B7280] bg-white border border-[#E5E7EB] rounded-lg px-3 py-2">
            <Clock size={13} />
            <span>Son güncelleme: şimdi</span>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Pending organizers */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader
              title="Onay Bekleyen Organizatörler"
              subtitle="5 başvuru inceleme bekliyor"
              actions={<ActionButton href="/admin/organizers" variant="ghost" size="sm">Tümünü Gör</ActionButton>}
            />
            <table className="w-full">
              <TableHeader columns={["Organizasyon", "Yetkili", "Şehir", "Tarih", "İşlem"]} />
              <tbody className="divide-y divide-[#F3F4F6]">
                {pendingOrganizers.map((org) => (
                  <tr key={org.name} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-[#111827]">{org.name}</div>
                      {org.tournaments > 0 && <div className="text-xs text-[#9CA3AF]">{org.tournaments} önceki turnuva</div>}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#6B7280]">{org.contact}</td>
                    <td className="px-4 py-3 text-sm text-[#6B7280]">{org.city}</td>
                    <td className="px-4 py-3 text-xs text-[#9CA3AF]">{org.date}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#ECFDF5] text-[#059669] text-xs font-medium rounded-md hover:bg-[#D1FAE5] transition-colors">
                          <CheckCircle size={11} /> Onayla
                        </button>
                        <button className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FEF2F2] text-[#DC2626] text-xs font-medium rounded-md hover:bg-[#FEE2E2] transition-colors">
                          <XCircle size={11} /> Reddet
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Activity feed */}
        <div>
          <Card>
            <CardHeader title="Son Aktiviteler" subtitle="Tüm platformdaki işlemler" />
            <div className="divide-y divide-[#F3F4F6]">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex gap-3 px-4 py-3">
                  <div className={`w-7 h-7 rounded-lg bg-[#F4F6F9] flex items-center justify-center shrink-0 mt-0.5`}>
                    <a.icon size={14} className={a.color} />
                  </div>
                  <div>
                    <div className="text-xs text-[#374151] leading-relaxed">{a.text}</div>
                    <div className="text-[10px] text-[#9CA3AF] mt-0.5">{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Active tournaments */}
      <Card>
        <CardHeader
          title="Aktif Turnuvalar"
          subtitle="Devam eden ve kayıt açık turnuvalar"
          actions={<ActionButton href="/admin/tournaments" variant="ghost" size="sm">Tümünü Gör</ActionButton>}
        />
        <table className="w-full">
          <TableHeader columns={["Turnuva", "Organizatör", "Takımlar", "Aşama", "Durum"]} />
          <tbody className="divide-y divide-[#F3F4F6]">
            {activeTournaments.map((t) => (
              <tr key={t.name} className="hover:bg-[#FAFAFA] transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-[#111827]">{t.name}</td>
                <td className="px-4 py-3 text-sm text-[#6B7280]">{t.organizer}</td>
                <td className="px-4 py-3 text-sm font-mono text-[#374151]">{t.teams}</td>
                <td className="px-4 py-3 text-sm text-[#6B7280]">{t.phase}</td>
                <td className="px-4 py-3">
                  <StatusBadge
                    label={t.status === "active" ? "Aktif" : "Kayıt Açık"}
                    variant={t.status === "active" ? "green" : "blue"}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </PageContent>
  );
}
