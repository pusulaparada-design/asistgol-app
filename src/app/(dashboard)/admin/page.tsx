export const dynamic = "force-dynamic";
import { Trophy, Users, Swords, ShieldCheck, TrendingUp, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { PageContent, PageHeader, StatCard, Card, CardHeader, TableHeader, StatusBadge, ActionButton } from "@/components/ui/PageShell";
import { getPlatformStats, getAllTournaments, getAllOrganizers } from "@/lib/actions/admin";

const activityFeed = [
  { icon: Trophy, text: "Yeni turnuva oluşturuldu: Ramazan Kupası 2026", time: "5dk önce", color: "text-[#3B82F6]" },
  { icon: Users, text: "Çınar FC turnuvaya kaydoldu", time: "18dk önce", color: "text-[#10B981]" },
  { icon: Swords, text: "Maç sonucu: Aslan FC 3 - 1 Kaplan SK", time: "1sa önce", color: "text-[#F59E0B]" },
  { icon: AlertTriangle, text: "Ceza: Emre Çelik (3. sarı kart)", time: "2sa önce", color: "text-[#EF4444]" },
  { icon: CheckCircle, text: "Bahar Kupası tamamlandı — Şampiyon: Rüzgar FC", time: "1g önce", color: "text-[#10B981]" },
];

const emptyStats = { activeTournaments: 0, totalTeams: 0, todayMatches: 0, pendingOrganizers: 0, completedTournaments: 0, totalPlayers: 0 };

export default async function AdminDashboard() {
  const [stats, tournaments, organizers] = await Promise.all([
    getPlatformStats().catch(() => emptyStats),
    getAllTournaments().catch(() => []),
    getAllOrganizers().catch(() => []),
  ]);

  const statCards = [
    { label: "Aktif Turnuva", value: stats.activeTournaments, icon: Trophy, color: "blue" as const, trend: "up" as const, trendLabel: "canlı" },
    { label: "Toplam Takım", value: stats.totalTeams, icon: Users, color: "gold" as const },
    { label: "Bugünkü Maç", value: stats.todayMatches, icon: Swords, color: "green" as const },
    { label: "Organizatör", value: stats.pendingOrganizers, icon: ShieldCheck, color: "orange" as const },
    { label: "Tamamlanan", value: stats.completedTournaments, icon: CheckCircle, color: "teal" as const },
    { label: "Toplam Oyuncu", value: stats.totalPlayers, icon: TrendingUp, color: "purple" as const },
  ];

  return (
    <PageContent>
      <PageHeader
        title="Platform Dashboard"
        subtitle="Genel platform özeti"
        actions={
          <div className="flex items-center gap-2 text-xs text-[#6B7280] bg-white border border-[#E5E7EB] rounded-lg px-3 py-2">
            <Clock size={13} /><span>Canlı veri</span>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Organizatörler */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader
              title="Organizatörler"
              subtitle={`${organizers.length} kayıtlı`}
              actions={<ActionButton href="/admin/organizers" variant="ghost" size="sm">Tümünü Gör</ActionButton>}
            />
            <table className="w-full">
              <TableHeader columns={["Organizatör", "Turnuva", "Durum"]} />
              <tbody className="divide-y divide-[#F3F4F6]">
                {organizers.slice(0, 6).map((org) => (
                  <tr key={org.id} className="hover:bg-[#FAFAFA]">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-[#111827]">{org.name}</div>
                      <div className="text-xs text-[#9CA3AF]">{org.email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#374151]">{org._count.organizedTournaments}</td>
                    <td className="px-4 py-3">
                      <StatusBadge label="Onaylı" variant="green" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Aktivite */}
        <Card>
          <CardHeader title="Son Aktiviteler" />
          <div className="divide-y divide-[#F3F4F6]">
            {activityFeed.map((a, i) => (
              <div key={i} className="flex gap-3 px-4 py-3">
                <div className="w-7 h-7 rounded-lg bg-[#F4F6F9] flex items-center justify-center shrink-0 mt-0.5">
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

      {/* Turnuvalar */}
      <Card>
        <CardHeader
          title="Tüm Turnuvalar"
          subtitle={`${tournaments.length} turnuva`}
          actions={<ActionButton href="/admin/tournaments" variant="ghost" size="sm">Tümünü Gör</ActionButton>}
        />
        <table className="w-full">
          <TableHeader columns={["Turnuva", "Organizatör", "Takım", "Durum"]} />
          <tbody className="divide-y divide-[#F3F4F6]">
            {tournaments.slice(0, 8).map((t) => (
              <tr key={t.id} className="hover:bg-[#FAFAFA]">
                <td className="px-4 py-3 text-sm font-medium text-[#111827]">{t.name}</td>
                <td className="px-4 py-3 text-sm text-[#6B7280]">{t.organizer.name}</td>
                <td className="px-4 py-3 text-sm font-mono text-[#374151]">{t._count.registrations}/{t.maxTeams}</td>
                <td className="px-4 py-3">
                  <StatusBadge
                    label={t.status === "ACTIVE" ? "Aktif" : t.status === "REGISTRATION" ? "Kayıt Açık" : t.status === "COMPLETED" ? "Tamamlandı" : "Taslak"}
                    variant={t.status === "ACTIVE" ? "green" : t.status === "REGISTRATION" ? "blue" : t.status === "COMPLETED" ? "gray" : "orange"}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tournaments.length === 0 && (
          <div className="py-10 text-center text-sm text-[#9CA3AF]">Henüz turnuva yok</div>
        )}
      </Card>
    </PageContent>
  );
}
