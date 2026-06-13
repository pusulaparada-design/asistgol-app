export const dynamic = "force-dynamic";
import { Search, MapPin, Calendar } from "lucide-react";
import { PageContent, PageHeader, Card, TableHeader, StatusBadge, ProgressBar } from "@/components/ui/PageShell";
import { getAllTournaments } from "@/lib/actions/admin";

const formatLabel: Record<string, string> = {
  GROUP_KNOCKOUT: "Grup + Eleme",
  GROUP_ONLY: "Sadece Lig",
  KNOCKOUT_ONLY: "Sadece Eleme",
};

const statusMap: Record<string, { label: string; variant: "green" | "blue" | "gray" | "orange" }> = {
  ACTIVE: { label: "Aktif", variant: "green" },
  REGISTRATION: { label: "Kayıt Açık", variant: "blue" },
  COMPLETED: { label: "Tamamlandı", variant: "gray" },
  DRAFT: { label: "Taslak", variant: "orange" },
};

function fmt(d: Date | null) {
  if (!d) return "—";
  return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default async function AdminTournamentsPage() {
  const tournaments = await getAllTournaments().catch(() => []);

  return (
    <PageContent>
      <PageHeader title="Tüm Turnuvalar" subtitle={`${tournaments.length} turnuva kayıtlı`} />

      <Card>
        <div className="p-4 border-b border-[#E5E7EB] flex gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input placeholder="Turnuva ara..." className="w-full pl-8 pr-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" />
          </div>
        </div>

        <table className="w-full">
          <TableHeader columns={["Turnuva", "Organizatör", "Format", "Doluluk", "Tarihler", "Durum"]} />
          <tbody className="divide-y divide-[#F3F4F6]">
            {tournaments.map((t) => {
              const s = statusMap[t.status] ?? { label: t.status, variant: "gray" as const };
              return (
                <tr key={t.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-[#111827]">{t.name}</div>
                    <div className="flex items-center gap-1 text-xs text-[#9CA3AF] mt-0.5">
                      <MapPin size={11} /> {t.city}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#6B7280]">{t.organizer.name}</td>
                  <td className="px-4 py-3 text-xs text-[#6B7280]">{formatLabel[t.format] ?? t.format}</td>
                  <td className="px-4 py-3 min-w-[140px]">
                    <div className="text-xs text-[#374151] mb-1 font-medium">
                      {t._count.registrations}/{t.maxTeams} takım
                    </div>
                    <ProgressBar value={t._count.registrations} max={t.maxTeams} color={t._count.registrations >= t.maxTeams ? "gold" : "blue"} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                      <Calendar size={11} /> {fmt(t.startDate)}
                    </div>
                    <div className="text-xs text-[#9CA3AF] mt-0.5 pl-3.5">— {fmt(t.endDate)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge label={s.label} variant={s.variant} />
                  </td>
                </tr>
              );
            })}
            {tournaments.length === 0 && (
              <tr><td colSpan={6} className="py-10 text-center text-sm text-[#9CA3AF]">Henüz turnuva yok</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </PageContent>
  );
}
