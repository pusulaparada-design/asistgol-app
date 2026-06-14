export const dynamic = "force-dynamic";
import { Trophy, Users, Swords, ShieldCheck, TrendingUp, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { PageContent, PageHeader, StatCard, Card, CardHeader, TableHeader, ScrollTable, StatusBadge, ActionButton } from "@/components/ui/PageShell";
import { getPlatformStats, getAllTournaments, getAllOrganizers, getRecentActivity } from "@/lib/actions/admin";

const emptyStats = { activeTournaments: 0, totalTeams: 0, todayMatches: 0, pendingOrganizers: 0, completedTournaments: 0, totalPlayers: 0 };

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "Az önce";
  if (mins < 60) return `${mins}dk önce`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}sa önce`;
  return `${Math.floor(hrs / 24)}g önce`;
}

function activityIcon(type: "match" | "reg" | "card") {
  if (type === "match") return { Icon: Swords,        color: "text-[#F59E0B]" };
  if (type === "reg")   return { Icon: Users,         color: "text-[#10B981]" };
  return                       { Icon: AlertTriangle, color: "text-[#EF4444]" };
}

export default async function AdminDashboard() {
  const [stats, tournaments, organizers, activity] = await Promise.all([
    getPlatformStats().catch(() => emptyStats),
    getAllTournaments().catch(() => []),
    getAllOrganizers().catch(() => []),
    getRecentActivity().catch(() => []),
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
        title="Ana Sayfa"
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
            <ScrollTable>
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
            </ScrollTable>
          </Card>
        </div>

        {/* Aktivite */}
        <Card>
          <CardHeader title="Son Aktiviteler" />
          <div className="divide-y divide-[#F3F4F6]">
            {activity.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#9CA3AF]">Henüz aktivite yok</div>
            ) : activity.map((a, i) => {
              const { Icon, color } = activityIcon(a.type);
              return (
                <div key={i} className="flex gap-3 px-4 py-3">
                  <div className="w-7 h-7 rounded-lg bg-[#F4F6F9] flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={14} className={color} />
                  </div>
                  <div>
                    <div className="text-xs text-[#374151] leading-relaxed">{a.text}</div>
                    <div className="text-[10px] text-[#9CA3AF] mt-0.5">{relativeTime(a.time)}</div>
                  </div>
                </div>
              );
            })}
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
        <ScrollTable>
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
        </ScrollTable>
        {tournaments.length === 0 && (
          <div className="py-10 text-center text-sm text-[#9CA3AF]">Henüz turnuva yok</div>
        )}
      </Card>
    </PageContent>
  );
}
