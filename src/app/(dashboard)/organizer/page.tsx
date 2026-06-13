import { Trophy, Users, Clock, Plus, Calendar } from "lucide-react";
import { PageContent, PageHeader, StatCard, Card, CardHeader, ActionButton, StatusBadge, ProgressBar } from "@/components/ui/PageShell";
export const dynamic = "force-dynamic";
import { getTournaments } from "@/lib/actions/tournament";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function OrganizerDashboard() {
  const session = await getSession();
  const myTournaments = session ? await getTournaments(session.userId).catch(() => []) : [];

  const ongoing = myTournaments.filter(t => t.status !== "COMPLETED" && t.status !== "DRAFT");

  const [approvedCount, pendingCount] = session ? await Promise.all([
    prisma.teamRegistration.count({
      where: { tournament: { organizerId: session.userId }, status: "APPROVED" },
    }),
    prisma.teamRegistration.count({
      where: { tournament: { organizerId: session.userId }, status: "PENDING" },
    }),
  ]) : [0, 0];

  return (
    <PageContent>
      <PageHeader
        title="Ana Sayfa"
        subtitle={`Merhaba, ${session?.name ?? "Organizatör"}`}
        actions={
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-[#111827]">
                {new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </div>
            </div>
            <ActionButton href="/organizer/tournaments/create" variant="primary" icon={Plus}>
              Yeni Turnuva
            </ActionButton>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Süren Turnuva" value={ongoing.length} icon={Trophy} color="blue" sublabel="şampiyon bekleniyor" />
        <StatCard label="Onaylı Takım" value={approvedCount} icon={Users} color="gold" sublabel="tüm turnuvalarda" />
        <StatCard label="Onay Bekleyen" value={pendingCount} icon={Clock} color="orange" sublabel="başvuru" />
        <StatCard label="Toplam Turnuva" value={myTournaments.length} icon={Calendar} color="teal" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <Card>
            <CardHeader
              title="Turnuvalarım"
              actions={<ActionButton href="/organizer/tournaments" variant="ghost" size="sm">Tümünü Gör</ActionButton>}
            />
            {myTournaments.length === 0 ? (
              <div className="py-12 text-center">
                <Trophy size={32} className="text-[#E5E7EB] mx-auto mb-3" />
                <p className="text-sm text-[#9CA3AF]">Henüz turnuva oluşturmadınız</p>
                <Link href="/organizer/tournaments/create" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#F59E0B] hover:text-[#D97706]">
                  <Plus size={14} /> İlk turnuvayı oluştur
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#F3F4F6]">
                {myTournaments.slice(0, 5).map((t) => (
                  <Link key={t.id} href={`/organizer/tournaments/${t.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-[#FAFAFA] transition-colors">
                    <div className="w-10 h-10 bg-[#FEF3C7] rounded-xl flex items-center justify-center shrink-0">
                      <Trophy size={18} className="text-[#D97706]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-[#111827] truncate">{t.name}</span>
                        <StatusBadge
                          label={t.status === "ACTIVE" ? "Aktif" : t.status === "REGISTRATION" ? "Kayıt Açık" : t.status === "COMPLETED" ? "Tamamlandı" : "Taslak"}
                          variant={t.status === "ACTIVE" ? "green" : t.status === "REGISTRATION" ? "blue" : "gray"}
                          dot={false}
                        />
                      </div>
                      <div className="text-xs text-[#9CA3AF] mb-1.5">{t.city}</div>
                      <div className="flex items-center gap-2">
                        <ProgressBar value={t._count.registrations} max={t.maxTeams} color="gold" />
                        <span className="text-xs text-[#9CA3AF] shrink-0">{t._count.registrations}/{t.maxTeams}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          {/* Son turnuva özeti */}
          {myTournaments[0] && (
            <Card>
              <CardHeader title="Son Turnuva" subtitle={myTournaments[0].name} />
              <div className="p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">Kayıtlı Takım</span>
                  <span className="font-semibold text-[#111827]">{myTournaments[0]._count.registrations} / {myTournaments[0].maxTeams}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">Şehir</span>
                  <span className="font-semibold text-[#111827]">{myTournaments[0].city}</span>
                </div>
                <Link href={`/organizer/tournaments/${myTournaments[0].id}`} className="block w-full text-center text-sm font-semibold py-2 rounded-lg bg-[#0F1F47] text-white hover:bg-[#1A2F5A] transition-colors">
                  Yönet
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageContent>
  );
}
