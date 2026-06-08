import { Plus, Users, Trophy, Target } from "lucide-react";
import { PageContent, PageHeader, ActionButton, Card, StatusBadge } from "@/components/ui/PageShell";
import Link from "next/link";

const teams = [
  {
    id: 1, name: "Aslan FC", players: 12,
    activeTournament: "Ramazan Kupası 2026",
    position: 1, group: "Grup A", pts: 10,
    wins: 3, draws: 1, losses: 0, goals: 10, goalsAgainst: 4,
    status: "active",
  },
  {
    id: 2, name: "Yıldız SK", players: 11,
    activeTournament: "Yaz Ligi 2026",
    position: 3, group: null, pts: 6,
    wins: 2, draws: 0, losses: 2, goals: 7, goalsAgainst: 8,
    status: "active",
  },
];

export default function MyTeamsPage() {
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
        {teams.map((t) => (
          <Card key={t.id} className="hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#EFF6FF] rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-lg font-extrabold text-[#3B82F6]">{t.name[0]}</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#111827]">{t.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                      <Users size={11} /> {t.players} oyuncu
                    </div>
                  </div>
                </div>
                <StatusBadge label="Aktif" variant="green" />
              </div>

              {/* Current tournament */}
              <div className="p-3 bg-[#FEF3C7]/60 rounded-xl mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy size={13} className="text-[#D97706]" />
                  <span className="text-xs font-semibold text-[#D97706]">{t.activeTournament}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#6B7280]">{t.group ?? "Lig"}</span>
                  <span className="text-xs font-bold text-[#111827]">#{t.position}. sıra</span>
                  <span className="text-xs text-[#9CA3AF]">{t.pts} puan</span>
                </div>
              </div>

              {/* Season stats */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { label: "G", val: t.wins, color: "text-[#10B981]" },
                  { label: "B", val: t.draws, color: "text-[#F59E0B]" },
                  { label: "M", val: t.losses, color: "text-[#EF4444]" },
                  { label: "Av", val: `+${t.goals - t.goalsAgainst}`, color: "text-[#3B82F6]" },
                ].map((s) => (
                  <div key={s.label} className="text-center p-2 bg-[#F4F6F9] rounded-lg">
                    <div className={`text-sm font-bold ${s.color}`}>{s.val}</div>
                    <div className="text-[10px] text-[#9CA3AF]">{s.label}</div>
                  </div>
                ))}
              </div>

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
        ))}

        {/* Create new team card */}
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
