import { Search, MapPin, Calendar } from "lucide-react";
import { PageContent, PageHeader, Card, TableHeader, StatusBadge, ProgressBar } from "@/components/ui/PageShell";

const tournaments = [
  { id: 1, name: "Ramazan Kupası 2026", organizer: "Bosphorus Arena", city: "İstanbul", format: "Grup + Eleme", teams: 12, maxTeams: 16, status: "active", startDate: "2026-05-20", endDate: "2026-06-30" },
  { id: 2, name: "Yaz Ligi 2026", organizer: "Yıldız Spor", city: "Ankara", format: "Sadece Lig", teams: 8, maxTeams: 8, status: "active", startDate: "2026-06-01", endDate: "2026-07-15" },
  { id: 3, name: "İstanbul City Cup", organizer: "Arena Spor", city: "İstanbul", format: "Sadece Eleme", teams: 6, maxTeams: 8, status: "registration", startDate: "2026-06-20", endDate: "2026-07-05" },
  { id: 4, name: "Gençlik Turnuvası", organizer: "Anadolu SK", city: "Ankara", format: "Grup + Eleme", teams: 10, maxTeams: 12, status: "active", startDate: "2026-06-10", endDate: "2026-07-20" },
  { id: 5, name: "Bahar Kupası", organizer: "Ege FC", city: "İzmir", format: "Grup + Eleme", teams: 8, maxTeams: 8, status: "completed", startDate: "2026-04-01", endDate: "2026-05-15" },
  { id: 6, name: "Kış Ligi 2025", organizer: "Karadeniz Spor", city: "Trabzon", format: "Sadece Lig", teams: 10, maxTeams: 10, status: "completed", startDate: "2025-12-01", endDate: "2026-02-28" },
];

const statusMap = {
  active: { label: "Aktif", variant: "green" as const },
  registration: { label: "Kayıt Açık", variant: "blue" as const },
  completed: { label: "Tamamlandı", variant: "gray" as const },
  draft: { label: "Taslak", variant: "orange" as const },
};

export default function AdminTournamentsPage() {
  return (
    <PageContent>
      <PageHeader title="Tüm Turnuvalar" subtitle={`${tournaments.length} turnuva kayıtlı`} />

      <div className="flex gap-1 bg-white border border-[#E5E7EB] rounded-xl p-1 w-fit">
        {["Tümü", "Aktif", "Kayıt Açık", "Tamamlandı"].map((tab, i) => (
          <button
            key={tab}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
              i === 0 ? "bg-[#0F1F47] text-white" : "text-[#6B7280] hover:text-[#374151] hover:bg-[#F4F6F9]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <Card>
        <div className="p-4 border-b border-[#E5E7EB] flex gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input placeholder="Turnuva ara..." className="w-full pl-8 pr-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" />
          </div>
          <select className="px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]">
            <option>Tüm Şehirler</option>
            <option>İstanbul</option>
            <option>Ankara</option>
            <option>İzmir</option>
          </select>
        </div>

        <table className="w-full">
          <TableHeader columns={["Turnuva", "Organizatör", "Format", "Doluluk", "Tarihler", "Durum"]} />
          <tbody className="divide-y divide-[#F3F4F6]">
            {tournaments.map((t) => {
              const s = statusMap[t.status as keyof typeof statusMap];
              return (
                <tr key={t.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-[#111827]">{t.name}</div>
                    <div className="flex items-center gap-1 text-xs text-[#9CA3AF] mt-0.5">
                      <MapPin size={11} /> {t.city}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#6B7280]">{t.organizer}</td>
                  <td className="px-4 py-3 text-xs text-[#6B7280]">{t.format}</td>
                  <td className="px-4 py-3 min-w-[140px]">
                    <div className="text-xs text-[#374151] mb-1 font-medium">{t.teams}/{t.maxTeams} takım</div>
                    <ProgressBar value={t.teams} max={t.maxTeams} color={t.teams === t.maxTeams ? "gold" : "blue"} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                      <Calendar size={11} /> {t.startDate}
                    </div>
                    <div className="text-xs text-[#9CA3AF] mt-0.5 pl-3.5">— {t.endDate}</div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge label={s.label} variant={s.variant} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </PageContent>
  );
}
