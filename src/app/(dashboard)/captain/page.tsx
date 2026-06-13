import { Users, Calendar, Trophy, Search, Plus } from "lucide-react";
import { PageContent, PageHeader, StatCard, Card, CardHeader, ActionButton, StatusBadge, ProgressBar } from "@/components/ui/PageShell";
export const dynamic = "force-dynamic";
import { getMyTeams } from "@/lib/actions/team";
import { getOpenTournaments } from "@/lib/actions/tournament";
import { getSession } from "@/lib/auth";
import Link from "next/link";

export default async function CaptainDashboard() {
  const session = await getSession();
  const [myTeams, openTournaments] = await Promise.all([
    getMyTeams().catch(() => []),
    getOpenTournaments().catch(() => []),
  ]);

  const activeRegs = myTeams.flatMap(t => t.registrations.filter(r => r.status === "APPROVED"));
  const pendingRegs = myTeams.flatMap(t => t.registrations.filter(r => r.status === "PENDING"));

  return (
    <PageContent>
      <PageHeader
        title="Ana Sayfa"
        subtitle={`Merhaba, ${session?.name ?? "Kaptan"}`}
        actions={
          <ActionButton href="/captain/tournaments" variant="primary" icon={Search}>
            Turnuva Keşfet
          </ActionButton>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Takımlarım" value={myTeams.length} icon={Users} color="blue" />
        <StatCard label="Aktif Kayıt" value={activeRegs.length} icon={Trophy} color="gold" />
        <StatCard label="Bekleyen Kayıt" value={pendingRegs.length} icon={Calendar} color="orange" />
        <StatCard label="Açık Turnuva" value={openTournaments.length} icon={Trophy} color="green" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Takımlarım */}
          <Card>
            <CardHeader
              title="Takımlarım"
              actions={<ActionButton href="/captain/my-teams" variant="ghost" size="sm">Tümünü Gör</ActionButton>}
            />
            {myTeams.length === 0 ? (
              <div className="py-10 text-center">
                <Users size={28} className="text-[#E5E7EB] mx-auto mb-2" />
                <p className="text-sm text-[#9CA3AF]">Henüz takım oluşturmadınız</p>
                <Link href="/captain/my-teams/create" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#F59E0B] hover:text-[#D97706]">
                  <Plus size={14} /> Takım Oluştur
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#F3F4F6]">
                {myTeams.map((t) => {
                  const activeReg = t.registrations.find(r => r.status === "APPROVED");
                  return (
                    <Link key={t.id} href={`/captain/my-teams/${t.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-[#FAFAFA] transition-colors">
                      <div className="w-10 h-10 bg-[#EFF6FF] rounded-xl flex items-center justify-center shrink-0">
                        <span className="text-sm font-extrabold text-[#3B82F6]">{t.name[0]}</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-[#111827]">{t.name}</div>
                        <div className="text-xs text-[#9CA3AF]">{t._count.players} oyuncu{t.city ? ` · ${t.city}` : ""}</div>
                        {activeReg && (
                          <div className="text-xs text-[#D97706] mt-0.5">{activeReg.tournament.name}</div>
                        )}
                      </div>
                      <StatusBadge label="Aktif" variant="green" dot={false} />
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          {/* Açık turnuvalar */}
          <Card>
            <CardHeader
              title="Kayıt Açık Turnuvalar"
              subtitle={`${openTournaments.length} turnuva`}
              actions={<ActionButton href="/captain/tournaments" variant="ghost" size="sm">Tümünü Gör</ActionButton>}
            />
            {openTournaments.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#9CA3AF]">Şu an açık turnuva yok</div>
            ) : (
              <div className="divide-y divide-[#F3F4F6]">
                {openTournaments.slice(0, 4).map((t) => (
                  <div key={t.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="text-sm font-semibold text-[#111827]">{t.name}</div>
                      <span className="text-xs bg-[#ECFDF5] text-[#059669] px-2 py-0.5 rounded-full font-medium shrink-0">
                        {t.maxTeams - t._count.registrations} yer
                      </span>
                    </div>
                    <div className="text-xs text-[#9CA3AF] mb-2">{t.organizer.name} · {t.city}</div>
                    <ProgressBar value={t._count.registrations} max={t.maxTeams} color="gold" />
                    <div className="mt-2 flex justify-end">
                      <Link href={`/captain/tournaments/${t.id}`} className="text-xs font-semibold text-[#F59E0B] hover:text-[#D97706]">
                        Kayıt Ol →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Hızlı işlemler */}
          <Card>
            <CardHeader title="Hızlı İşlemler" border={false} />
            <div className="px-4 pb-4 grid grid-cols-2 gap-2">
              {[
                { label: "Takım Oluştur", href: "/captain/my-teams/create" },
                { label: "Turnuva Bul", href: "/captain/tournaments" },
                { label: "Kayıtlarım", href: "/captain/registrations" },
                { label: "Sıralamalar", href: "/captain/leaderboard" },
              ].map((a) => (
                <Link key={a.label} href={a.href} className="flex items-center justify-center p-3 rounded-xl bg-[#F4F6F9] hover:bg-[#E5E7EB] transition-colors text-xs font-medium text-[#374151] text-center">
                  {a.label}
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PageContent>
  );
}
