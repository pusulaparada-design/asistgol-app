export const dynamic = "force-dynamic";
import { Search } from "lucide-react";
import { PageContent, PageHeader, Card, TableHeader, ScrollTable } from "@/components/ui/PageShell";
import { getAllTournaments } from "@/lib/actions/admin";
import TournamentRow from "./TournamentRow";

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

        <ScrollTable>
        <table className="w-full">
          <TableHeader columns={["Turnuva", "Organizatör", "Format", "Doluluk", "Tarihler", "Durum"]} />
          <tbody className="divide-y divide-[#F3F4F6]">
            {tournaments.map((t) => (
              <TournamentRow key={t.id} t={t} />
            ))}
            {tournaments.length === 0 && (
              <tr><td colSpan={6} className="py-10 text-center text-sm text-[#9CA3AF]">Henüz turnuva yok</td></tr>
            )}
          </tbody>
        </table>
        </ScrollTable>
      </Card>
    </PageContent>
  );
}
