import { Trophy, Users, Swords, Calendar, Settings, BarChart2, AlertTriangle, CheckCircle } from "lucide-react";
import { PageContent, PageHeader, Card, CardHeader, StatCard, ActionButton, StatusBadge } from "@/components/ui/PageShell";
import Link from "next/link";

const tabs = [
  { label: "Özet", href: "", icon: Trophy },
  { label: "Takımlar", href: "teams", icon: Users },
  { label: "Fikstür", href: "fixture", icon: Calendar },
  { label: "Puan Tablosu", href: "standings", icon: BarChart2 },
  { label: "Maçlar", href: "matches", icon: Swords },
  { label: "İstatistikler", href: "stats", icon: BarChart2 },
  { label: "Cezalılar", href: "penalties", icon: AlertTriangle },
];

const recentMatches = [
  { home: "Aslan FC", away: "Kaplan SK", homeScore: 3, awayScore: 1, date: "7 Haz", group: "Grup A" },
  { home: "Çınar FC", away: "Rüzgar Spor", homeScore: 2, awayScore: 2, date: "7 Haz", group: "Grup B" },
  { home: "Ateş FC", away: "Demir SK", homeScore: 1, awayScore: 0, date: "6 Haz", group: "Grup A" },
];

const pendingTeams = [
  { name: "Yıldırım SK", captain: "Hüseyin Koç", players: 11 },
  { name: "Şimşek FC", captain: "Deniz Ak", players: 10 },
];

export default function TournamentDetailPage({ params }: { params: { id: string } }) {
  const id = params.id;
  return (
    <PageContent>
      <PageHeader
        title="Ramazan Kupası 2026"
        subtitle="Grup + Eleme · İstanbul · 16 takım"
        actions={
          <div className="flex gap-2">
            <StatusBadge label="Aktif" variant="green" />
            <ActionButton variant="secondary" size="sm" icon={Settings}>Düzenle</ActionButton>
          </div>
        }
      />

      {/* Sub-navigation */}
      <div className="flex gap-1 bg-white border border-[#E5E7EB] rounded-xl p-1 overflow-x-auto">
        {tabs.map((tab, i) => (
          <Link
            key={tab.href}
            href={`/organizer/tournaments/${id}/${tab.href}`}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
              i === 0 ? "bg-[#0F1F47] text-white" : "text-[#6B7280] hover:text-[#374151] hover:bg-[#F4F6F9]"
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Kayıtlı Takım" value="12/16" icon={Users} color="blue" />
        <StatCard label="Oynanan Maç" value="18/48" icon={Swords} color="gold" />
        <StatCard label="Toplam Gol" value={52} icon={Trophy} color="green" />
        <StatCard label="Cezalı Oyuncu" value={2} icon={AlertTriangle} color="red" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent matches */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader
              title="Son Maçlar"
              actions={<ActionButton href={`/organizer/tournaments/${id}/matches`} variant="ghost" size="sm">Tümünü Gör</ActionButton>}
            />
            <div className="divide-y divide-[#F3F4F6]">
              {recentMatches.map((m, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                  <span className="text-xs bg-[#F4F6F9] rounded-md px-2 py-1 text-[#6B7280] font-medium shrink-0">{m.group}</span>
                  <div className="flex-1 grid grid-cols-3 items-center gap-2">
                    <span className="text-sm font-medium text-[#111827] text-right">{m.home}</span>
                    <span className="text-center font-mono font-bold text-sm text-[#111827]">{m.homeScore} - {m.awayScore}</span>
                    <span className="text-sm font-medium text-[#111827]">{m.away}</span>
                  </div>
                  <span className="text-xs text-[#9CA3AF] shrink-0">{m.date}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Group standings preview */}
          <Card className="mt-6">
            <CardHeader
              title="Grup A — Puan Durumu"
              actions={<ActionButton href={`/organizer/tournaments/${id}/standings`} variant="ghost" size="sm">Tümünü Gör</ActionButton>}
            />
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  {["#", "Takım", "O", "G", "B", "M", "AG", "YG", "A", "P"].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-center text-xs font-semibold text-[#9CA3AF]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {[
                  { pos: 1, name: "Aslan FC", p: 4, g: 3, b: 1, m: 0, ag: 10, yg: 4, av: 6, pts: 10 },
                  { pos: 2, name: "Çınar FC", p: 4, g: 2, b: 1, m: 1, ag: 8, yg: 6, av: 2, pts: 7 },
                  { pos: 3, name: "Kaplan SK", p: 4, g: 1, b: 1, m: 2, ag: 5, yg: 8, av: -3, pts: 4 },
                  { pos: 4, name: "Ateş FC", p: 4, g: 0, b: 1, m: 3, ag: 2, yg: 7, av: -5, pts: 1 },
                ].map((row) => (
                  <tr key={row.name} className={`hover:bg-[#FAFAFA] ${row.pos <= 2 ? "bg-[#FFFBEB]/50" : ""}`}>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-xs font-bold ${row.pos <= 2 ? "bg-[#FEF3C7] text-[#D97706]" : "bg-[#F3F4F6] text-[#9CA3AF]"}`}>{row.pos}</span>
                    </td>
                    <td className="px-3 py-2.5 text-sm font-medium text-[#111827]">{row.name}</td>
                    {[row.p, row.g, row.b, row.m, row.ag, row.yg].map((v, i) => (
                      <td key={i} className="px-3 py-2.5 text-center text-xs text-[#6B7280]">{v}</td>
                    ))}
                    <td className="px-3 py-2.5 text-center text-xs font-medium text-[#374151]">{row.av > 0 ? `+${row.av}` : row.av}</td>
                    <td className="px-3 py-2.5 text-center text-sm font-bold text-[#111827]">{row.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-2.5 flex items-center gap-2 border-t border-[#F3F4F6]">
              <div className="w-3 h-3 rounded-sm bg-[#FEF3C7] border border-[#F59E0B]/30" />
              <span className="text-xs text-[#9CA3AF]">Üst 2 takım elemeye katılır</span>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          {/* Pending teams */}
          {pendingTeams.length > 0 && (
            <Card>
              <CardHeader title="Onay Bekleyen Takımlar" subtitle={`${pendingTeams.length} başvuru`} />
              <div className="divide-y divide-[#F3F4F6]">
                {pendingTeams.map((t) => (
                  <div key={t.name} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 bg-[#EFF6FF] rounded-lg flex items-center justify-center">
                      <Users size={14} className="text-[#3B82F6]" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-[#111827]">{t.name}</div>
                      <div className="text-xs text-[#9CA3AF]">{t.players} oyuncu · Kpt: {t.captain}</div>
                    </div>
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded-md bg-[#ECFDF5] text-[#059669] hover:bg-[#D1FAE5]"><CheckCircle size={13} /></button>
                      <button className="p-1.5 rounded-md bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2]"><AlertTriangle size={13} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Quick nav */}
          <Card>
            <CardHeader title="Hızlı Erişim" border={false} />
            <div className="px-4 pb-4 grid grid-cols-2 gap-2">
              {tabs.slice(1).map((tab) => (
                <Link
                  key={tab.href}
                  href={`/organizer/tournaments/${id}/${tab.href}`}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-[#F4F6F9] hover:bg-[#E5E7EB] transition-colors"
                >
                  <tab.icon size={16} className="text-[#6B7280]" />
                  <span className="text-xs font-medium text-[#374151]">{tab.label}</span>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PageContent>
  );
}
