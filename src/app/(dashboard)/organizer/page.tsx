import { Trophy, Users, Swords, Clock, Plus, CheckCircle, AlertTriangle, Calendar } from "lucide-react";
import { PageContent, PageHeader, StatCard, Card, CardHeader, ActionButton, StatusBadge, ProgressBar, LiveBadge } from "@/components/ui/PageShell";
import Link from "next/link";

const stats = [
  { label: "Aktif Turnuva", value: 3, icon: Trophy, color: "blue" as const },
  { label: "Toplam Takım", value: 38, icon: Users, color: "gold" as const, sublabel: "bu turnuvalarda" },
  { label: "Bu Haftaki Maç", value: 8, icon: Swords, color: "green" as const, sublabel: "2 canlı" },
  { label: "Onay Bekleyen", value: 4, icon: Clock, color: "orange" as const },
];

const myTournaments = [
  { id: 1, name: "Ramazan Kupası 2026", format: "Grup + Eleme", teams: 12, maxTeams: 16, phase: "Grup Aşaması", status: "active", progress: 40 },
  { id: 2, name: "Yaz Ligi 2026", format: "Sadece Lig", teams: 8, maxTeams: 8, phase: "5. Hafta", status: "active", progress: 65 },
  { id: 3, name: "Akşam Kupası", format: "Sadece Eleme", teams: 4, maxTeams: 8, phase: "Kayıt Açık", status: "registration", progress: 50 },
];

const todayMatches = [
  { time: "18:00", home: "Aslan FC", away: "Kaplan SK", venue: "Bosphorus Saha 1", status: "live", homeScore: 2, awayScore: 1 },
  { time: "19:30", home: "Çınar FC", away: "Rüzgar Spor", venue: "Bosphorus Saha 2", status: "live", homeScore: 0, awayScore: 0 },
  { time: "21:00", home: "Ateş FC", away: "Demir SK", venue: "Bosphorus Saha 1", status: "scheduled", homeScore: null, awayScore: null },
];

const pendingTeams = [
  { name: "Yıldırım SK", captain: "Hüseyin Koç", applied: "1 saat önce" },
  { name: "Şimşek FC", captain: "Deniz Ak", applied: "3 saat önce" },
  { name: "Fırtına Spor", captain: "Cem Yol", applied: "5 saat önce" },
  { name: "Bordo FC", captain: "Taner Gül", applied: "1 gün önce" },
];

export default function OrganizerDashboard() {
  return (
    <PageContent>
      <PageHeader
        title="Dashboard"
        subtitle="Turnuvalarınızın genel durumu"
        actions={
          <ActionButton href="/organizer/tournaments/create" variant="primary" icon={Plus}>
            Yeni Turnuva
          </ActionButton>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Turnuvalar */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader title="Turnuvalarım" actions={<ActionButton href="/organizer/tournaments" variant="ghost" size="sm">Tümünü Gör</ActionButton>} />
            <div className="divide-y divide-[#F3F4F6]">
              {myTournaments.map((t) => (
                <Link key={t.id} href={`/organizer/tournaments/${t.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-[#FAFAFA] transition-colors">
                  <div className="w-10 h-10 bg-[#FEF3C7] rounded-xl flex items-center justify-center shrink-0">
                    <Trophy size={18} className="text-[#D97706]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-[#111827] truncate">{t.name}</span>
                      <StatusBadge label={t.status === "active" ? "Aktif" : "Kayıt Açık"} variant={t.status === "active" ? "green" : "blue"} dot={false} />
                    </div>
                    <div className="text-xs text-[#9CA3AF] mb-2">{t.format} · {t.phase}</div>
                    <div className="flex items-center gap-2">
                      <ProgressBar value={t.teams} max={t.maxTeams} color="gold" />
                      <span className="text-xs text-[#9CA3AF] shrink-0">{t.teams}/{t.maxTeams} takım</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          {/* Today's matches */}
          <Card className="mt-6">
            <CardHeader title="Bugünkü Maçlar" subtitle="8 Haziran 2026" />
            <div className="divide-y divide-[#F3F4F6]">
              {todayMatches.map((m, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                  <span className="text-xs font-mono text-[#6B7280] w-10 shrink-0">{m.time}</span>
                  <div className="flex-1 grid grid-cols-3 items-center gap-2">
                    <span className="text-sm font-medium text-[#111827] text-right">{m.home}</span>
                    <div className="text-center">
                      {m.status === "live"
                        ? <span className="font-mono font-bold text-sm">{m.homeScore} - {m.awayScore}</span>
                        : <span className="text-xs text-[#9CA3AF]">vs</span>
                      }
                    </div>
                    <span className="text-sm font-medium text-[#111827]">{m.away}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-[#9CA3AF] hidden lg:block">{m.venue}</span>
                    {m.status === "live" ? <LiveBadge /> : <StatusBadge label="Planlandı" variant="blue" dot={false} />}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Pending teams */}
          <Card>
            <CardHeader
              title="Onay Bekleyen Takımlar"
              subtitle={`${pendingTeams.length} başvuru`}
            />
            <div className="divide-y divide-[#F3F4F6]">
              {pendingTeams.map((t) => (
                <div key={t.name} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 bg-[#EFF6FF] rounded-lg flex items-center justify-center shrink-0">
                    <Users size={14} className="text-[#3B82F6]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#111827] truncate">{t.name}</div>
                    <div className="text-xs text-[#9CA3AF]">Kpt: {t.captain} · {t.applied}</div>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded-md bg-[#ECFDF5] text-[#059669] hover:bg-[#D1FAE5]">
                      <CheckCircle size={13} />
                    </button>
                    <button className="p-1.5 rounded-md bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2]">
                      <AlertTriangle size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick actions */}
          <Card>
            <CardHeader title="Hızlı İşlemler" border={false} />
            <div className="px-4 pb-4 grid grid-cols-2 gap-2">
              {[
                { label: "Skor Gir", icon: Swords, href: "/organizer/tournaments/1/matches" },
                { label: "Fikstür", icon: Calendar, href: "/organizer/tournaments/1/fixture" },
                { label: "Puan Tablosu", icon: Trophy, href: "/organizer/tournaments/1/standings" },
                { label: "İstatistikler", icon: CheckCircle, href: "/organizer/tournaments/1/stats" },
              ].map((a) => (
                <Link
                  key={a.label}
                  href={a.href}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-[#F4F6F9] hover:bg-[#E5E7EB] transition-colors text-center"
                >
                  <a.icon size={18} className="text-[#6B7280]" />
                  <span className="text-xs font-medium text-[#374151]">{a.label}</span>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PageContent>
  );
}
