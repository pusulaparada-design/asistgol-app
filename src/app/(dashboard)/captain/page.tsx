import { Users, Calendar, Trophy, Swords, MapPin, Clock } from "lucide-react";
import { PageContent, PageHeader, StatCard, Card, CardHeader, ActionButton, StatusBadge, LiveBadge } from "@/components/ui/PageShell";
import Link from "next/link";

const stats = [
  { label: "Aktif Takımım", value: 2, icon: Users, color: "blue" as const },
  { label: "Bu Haftaki Maç", value: 3, icon: Calendar, color: "gold" as const },
  { label: "Turnuva Kaydım", value: 4, icon: Trophy, color: "green" as const },
  { label: "Toplam Gol (Sezon)", value: 28, icon: Swords, color: "teal" as const },
];

const upcomingMatches = [
  { team: "Aslan FC", tournament: "Ramazan Kupası 2026", phase: "Grup A", opponent: "Kaplan SK", date: "2026-06-08", time: "19:00", venue: "Bosphorus Saha 1", status: "scheduled" },
  { team: "Aslan FC", tournament: "Ramazan Kupası 2026", phase: "Grup A", opponent: "Çınar FC", date: "2026-06-12", time: "18:00", venue: "Bosphorus Saha 2", status: "scheduled" },
  { team: "Yıldız SK", tournament: "Yaz Ligi 2026", phase: "3. Hafta", opponent: "Bordo FC", date: "2026-06-10", time: "20:00", venue: "Yıldız Arena", status: "scheduled" },
];

const myTeams = [
  { id: 1, name: "Aslan FC", players: 12, tournament: "Ramazan Kupası 2026", position: 1, group: "Grup A", pts: 10 },
  { id: 2, name: "Yıldız SK", players: 11, tournament: "Yaz Ligi 2026", position: 3, group: null, pts: 6 },
];

const openTournaments = [
  { id: 1, name: "Akşam Kupası", organizer: "Bosphorus Arena", city: "İstanbul", format: "Eleme", spots: 4, deadline: "2026-06-18" },
  { id: 2, name: "Temmuz Ligi", organizer: "Yıldız Spor", city: "İstanbul", format: "Lig", spots: 6, deadline: "2026-06-25" },
];

export default function CaptainDashboard() {
  return (
    <PageContent>
      <PageHeader
        title="Dashboard"
        subtitle="Takımlarınızın durumu"
        actions={
          <ActionButton href="/captain/tournaments" variant="primary" icon={Trophy}>
            Turnuva Keşfet
          </ActionButton>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Upcoming matches */}
          <Card>
            <CardHeader title="Yaklaşan Maçlarım" actions={<ActionButton href="/captain/schedule" variant="ghost" size="sm">Tümünü Gör</ActionButton>} />
            <div className="divide-y divide-[#F3F4F6]">
              {upcomingMatches.map((m, i) => (
                <div key={i} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-[#F4F6F9] text-[#6B7280] px-2 py-0.5 rounded-md font-medium">{m.team}</span>
                      <span className="text-xs text-[#9CA3AF]">{m.tournament} · {m.phase}</span>
                    </div>
                    <StatusBadge label="Planlandı" variant="blue" dot={false} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-[#111827]">vs {m.opponent}</div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs text-[#374151]"><Clock size={11} /> {m.date} · {m.time}</div>
                      <div className="flex items-center gap-1 text-[10px] text-[#9CA3AF] justify-end mt-0.5"><MapPin size={10} /> {m.venue}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* My teams performance */}
          <Card>
            <CardHeader title="Takımlarımın Durumu" actions={<ActionButton href="/captain/my-teams" variant="ghost" size="sm">Yönet</ActionButton>} />
            <div className="divide-y divide-[#F3F4F6]">
              {myTeams.map((t) => (
                <Link key={t.id} href={`/captain/my-teams/${t.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-[#FAFAFA] transition-colors">
                  <div className="w-10 h-10 bg-[#EFF6FF] rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-[#3B82F6]">{t.name[0]}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-[#111827]">{t.name}</div>
                    <div className="text-xs text-[#9CA3AF]">{t.players} oyuncu · {t.tournament}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[#9CA3AF]">{t.group ? t.group : "Lig"} Sıralaması</div>
                    <div className="text-lg font-bold text-[#111827]">#{t.position}</div>
                    <div className="text-xs text-[#9CA3AF]">{t.pts} puan</div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Open tournaments */}
          <Card>
            <CardHeader title="Kayıt Açık Turnuvalar" subtitle="Takımınızı kaydettirin" />
            <div className="divide-y divide-[#F3F4F6]">
              {openTournaments.map((t) => (
                <div key={t.id} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="text-sm font-semibold text-[#111827]">{t.name}</div>
                      <div className="text-xs text-[#9CA3AF]">{t.organizer} · {t.city}</div>
                    </div>
                    <span className="text-xs bg-[#ECFDF5] text-[#059669] px-2 py-0.5 rounded-full font-medium shrink-0">{t.spots} yer</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-[#9CA3AF]">Son: {t.deadline}</div>
                    <Link href={`/captain/tournaments/${t.id}`} className="text-xs font-semibold text-[#F59E0B] hover:text-[#D97706]">
                      Detay →
                    </Link>
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
                { label: "Takım Oluştur", href: "/captain/my-teams/create" },
                { label: "Turnuva Bul", href: "/captain/tournaments" },
                { label: "Maç Takvim", href: "/captain/schedule" },
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
