import { Users, Calendar, Trophy, Search, Plus, ClipboardList } from "lucide-react";
import { PageContent, PageHeader, StatCard, Card, CardHeader, ActionButton, StatusBadge } from "@/components/ui/PageShell";
export const dynamic = "force-dynamic";
import { getMyTeams } from "@/lib/actions/team";
import { getOpenTournaments } from "@/lib/actions/tournament";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import OpenTournamentsCard from "./OpenTournamentsCard";

export default async function CaptainDashboard() {
  const session = await getSession();
  const [myTeams, openTournaments] = await Promise.all([
    getMyTeams().catch(() => []),
    getOpenTournaments().catch(() => []),
  ]);

  const allRegs = myTeams.flatMap(t => t.registrations.map(r => ({ ...r, teamName: t.name })));
  const activeRegs = allRegs.filter(r => r.status === "APPROVED");
  const pendingRegs = allRegs.filter(r => r.status === "PENDING");

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
          {/* Kayıtlı Turnuvalarım */}
          <Card>
            <CardHeader
              title="Kayıtlı Turnuvalarım"
              actions={<ActionButton href="/captain/tournaments" variant="ghost" size="sm">Tümünü Gör</ActionButton>}
            />
            {allRegs.length === 0 ? (
              <div className="py-10 text-center">
                <ClipboardList size={28} className="text-[#E5E7EB] mx-auto mb-2" />
                <p className="text-sm text-[#9CA3AF]">Henüz hiçbir turnuvaya kayıt yaptırmadınız</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F3F4F6]">
                {allRegs.map((r) => {
                  const regBadge =
                    r.status === "APPROVED" ? { label: "Onaylandı",      variant: "green"  as const } :
                    r.status === "PENDING"  ? { label: "Onay Bekliyor",  variant: "orange" as const } :
                                              { label: "Reddedildi",     variant: "gray"   as const };
                  const tsBadge =
                    r.tournament.status === "ACTIVE"       ? { label: "Devam Ediyor",   variant: "blue"   as const } :
                    r.tournament.status === "COMPLETED"    ? { label: "Bitti",          variant: "gray"   as const } :
                    r.tournament.status === "REGISTRATION" ? { label: "Talep Topluyor", variant: "green"  as const } :
                                                             { label: "Taslak",         variant: "orange" as const };
                  return (
                    <Link key={r.id} href={`/captain/tournaments/${r.tournament.id}`}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-[#FAFAFA] transition-colors">
                      <div className="w-10 h-10 bg-[#FFF7ED] rounded-xl flex items-center justify-center shrink-0">
                        <Trophy size={16} className="text-[#F59E0B]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[#111827] truncate">{r.tournament.name}</div>
                        <div className="text-xs text-[#9CA3AF] mt-0.5">{r.teamName}</div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <StatusBadge label={regBadge.label} variant={regBadge.variant} dot={false} />
                        <StatusBadge label={tsBadge.label} variant={tsBadge.variant} dot={false} />
                      </div>
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
            <OpenTournamentsCard tournaments={openTournaments} myTeams={myTeams} />
          </Card>

        </div>
      </div>
    </PageContent>
  );
}
