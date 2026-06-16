import { Plus, Users, Trophy } from "lucide-react";
import Image from "next/image";
import { PageContent, PageHeader, ActionButton, Card, StatusBadge } from "@/components/ui/PageShell";
import Link from "next/link";
import { getMyTeams } from "@/lib/actions/team";

export default async function MyTeamsPage() {
  const teams = await getMyTeams();

  return (
    <PageContent>
      <PageHeader
        title="Takımlarım"
        subtitle={`${teams.length} takım`}
        actions={
          <ActionButton href="/captain/my-teams/create" variant="primary" icon={Plus}>
            Yeni Takım Oluştur
          </ActionButton>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {teams.map((t) => {
          const approvedRegs = t.registrations.filter(r => r.tournament.status === "ACTIVE" || r.tournament.status === "REGISTRATION");
          const activeReg = approvedRegs[0];
          const colors = t.color ? t.color.split(",") : [];

          return (
            <Card key={t.id} className="hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[#E5E7EB]">
                      {t.logoUrl ? (
                        <Image src={t.logoUrl} alt={t.name} width={48} height={48} className="w-full h-full object-cover" />
                      ) : colors.length > 0 ? (
                        <div className="flex h-full">
                          {colors.map(c => (
                            <div key={c} className="flex-1" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      ) : (
                        <div className="w-full h-full bg-[#EFF6FF] flex items-center justify-center">
                          <span className="text-lg font-extrabold text-[#3B82F6]">{t.name[0]}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#111827]">{t.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                        <Users size={11} /> {t._count.players} oyuncu
                      </div>
                    </div>
                  </div>
                  <StatusBadge label={activeReg ? "Aktif" : "Boşta"} variant={activeReg ? "green" : "gray"} />
                </div>

                {activeReg ? (
                  <div className="p-3 bg-[#FEF3C7]/60 rounded-xl mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy size={13} className="text-[#D97706]" />
                      <span className="text-xs font-semibold text-[#D97706]">{activeReg.tournament.name}</span>
                    </div>
                    <div className="text-xs text-[#6B7280]">
                      {activeReg.groupTeam?.group?.name ?? "Grup atanmadı"}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-[#F4F6F9] rounded-xl mb-4 text-xs text-[#9CA3AF] text-center">
                    Aktif turnuva yok
                  </div>
                )}

                <div className="flex gap-2">
                  <Link href={`/captain/my-teams/${t.id}`} className="flex-1 text-center text-sm font-semibold py-2 rounded-lg bg-[#0F1F47] text-white hover:bg-[#1A2F5A] transition-colors">
                    Takımı Yönet
                  </Link>
                  <Link href="/captain/tournaments" className="px-4 py-2 text-sm font-medium rounded-lg bg-[#F4F6F9] text-[#374151] hover:bg-[#E5E7EB] transition-colors">
                    Kayıt Ol
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}

        <Link href="/captain/my-teams/create" className="border-2 border-dashed border-[#E5E7EB] rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-[#F59E0B] hover:bg-[#FFFBEB] transition-all group">
          <div className="w-12 h-12 bg-[#F4F6F9] group-hover:bg-[#FEF3C7] rounded-xl flex items-center justify-center transition-colors">
            <Plus size={22} className="text-[#9CA3AF] group-hover:text-[#D97706] transition-colors" />
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-[#374151] group-hover:text-[#D97706] transition-colors">Yeni Takım Oluştur</div>
            <div className="text-xs text-[#9CA3AF] mt-0.5">Oyuncularınızı ekleyin, turnuvalara katılın</div>
          </div>
        </Link>
      </div>
    </PageContent>
  );
}
