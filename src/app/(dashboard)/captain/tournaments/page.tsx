import { Search, MapPin, Calendar, Trophy, Filter } from "lucide-react";
import { PageContent, PageHeader, Card, StatusBadge, ProgressBar } from "@/components/ui/PageShell";
import Link from "next/link";

const tournaments = [
  { id: 1, name: "Akşam Kupası", organizer: "Bosphorus Arena", city: "İstanbul", format: "Sadece Eleme", teams: 4, maxTeams: 8, fee: "₺500", prize: "₺2.000", startDate: "20 Haz 2026", deadline: "18 Haz 2026", status: "registration" },
  { id: 2, name: "Temmuz Ligi", organizer: "Yıldız Spor", city: "İstanbul", format: "Sadece Lig", teams: 2, maxTeams: 8, fee: "Ücretsiz", prize: "Kupa", startDate: "1 Tem 2026", deadline: "25 Haz 2026", status: "registration" },
  { id: 3, name: "Boğaz Kupası 2026", organizer: "Anadolu SK", city: "İstanbul", format: "Grup + Eleme", teams: 0, maxTeams: 16, fee: "₺750", prize: "₺5.000", startDate: "15 Tem 2026", deadline: "10 Tem 2026", status: "registration" },
  { id: 4, name: "Ankara Summer Cup", organizer: "Başkent Arena", city: "Ankara", format: "Grup + Eleme", teams: 8, maxTeams: 12, fee: "₺400", prize: "₺3.000", startDate: "5 Tem 2026", deadline: "30 Haz 2026", status: "registration" },
  { id: 5, name: "Ramazan Kupası 2026", organizer: "Bosphorus Arena", city: "İstanbul", format: "Grup + Eleme", teams: 12, maxTeams: 16, fee: "₺600", prize: "₺4.000", startDate: "20 May 2026", deadline: null, status: "active" },
  { id: 6, name: "İzmir Sahil Ligi", organizer: "Ege Spor", city: "İzmir", format: "Sadece Lig", teams: 6, maxTeams: 8, fee: "₺300", prize: "Kupa", startDate: "8 Tem 2026", deadline: "5 Tem 2026", status: "registration" },
];

const statusMap = {
  registration: { label: "Kayıt Açık", variant: "green" as const },
  active: { label: "Devam Ediyor", variant: "blue" as const },
  completed: { label: "Tamamlandı", variant: "gray" as const },
};

export default function CaptainTournamentsPage() {
  const open = tournaments.filter(t => t.status === "registration");

  return (
    <PageContent>
      <PageHeader title="Turnuva Keşfet" subtitle={`${open.length} turnuvada kayıt açık`} />

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input placeholder="Turnuva veya şehir ara..." className="w-full pl-8 pr-4 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" />
        </div>
        <select className="px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none">
          <option>Tüm Şehirler</option>
          <option>İstanbul</option>
          <option>Ankara</option>
          <option>İzmir</option>
        </select>
        <select className="px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none">
          <option>Tüm Formatlar</option>
          <option>Grup + Eleme</option>
          <option>Sadece Lig</option>
          <option>Sadece Eleme</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {tournaments.map((t) => {
          const s = statusMap[t.status as keyof typeof statusMap];
          const spotsLeft = t.maxTeams - t.teams;
          const isUrgent = spotsLeft <= 2 && t.status === "registration";

          return (
            <Card key={t.id} className="hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-[#111827]">{t.name}</h3>
                      <StatusBadge label={s.label} variant={s.variant} dot={false} />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                      <MapPin size={11} /> {t.city} · {t.organizer}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="text-center p-2 bg-[#F4F6F9] rounded-lg">
                    <div className="text-xs text-[#9CA3AF]">Format</div>
                    <div className="text-xs font-semibold text-[#374151] mt-0.5">{t.format}</div>
                  </div>
                  <div className="text-center p-2 bg-[#F4F6F9] rounded-lg">
                    <div className="text-xs text-[#9CA3AF]">Ödül</div>
                    <div className="text-xs font-semibold text-[#F59E0B] mt-0.5">{t.prize}</div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#9CA3AF]">Doluluk</span>
                    <span className={`font-semibold ${isUrgent ? "text-[#EF4444]" : "text-[#374151]"}`}>
                      {t.teams}/{t.maxTeams} takım
                      {isUrgent && ` — Son ${spotsLeft} yer!`}
                    </span>
                  </div>
                  <ProgressBar value={t.teams} max={t.maxTeams} color={isUrgent ? "red" : "gold"} />
                </div>

                <div className="flex items-center justify-between text-xs mb-4">
                  <div className="flex items-center gap-1 text-[#9CA3AF]">
                    <Calendar size={11} /> {t.startDate}
                  </div>
                  {t.deadline && (
                    <span className="text-[#EF4444] font-medium">Son: {t.deadline}</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#9CA3AF]">Kayıt Ücreti</span>
                    <div className="text-sm font-bold text-[#111827]">{t.fee}</div>
                  </div>
                  <Link
                    href={`/captain/tournaments/${t.id}`}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                      t.status === "registration"
                        ? "bg-[#0F1F47] text-white hover:bg-[#1A2F5A]"
                        : "bg-[#F4F6F9] text-[#6B7280] hover:bg-[#E5E7EB]"
                    }`}
                  >
                    {t.status === "registration" ? "Kayıt Ol" : "İncele"}
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </PageContent>
  );
}
