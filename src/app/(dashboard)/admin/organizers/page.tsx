export const dynamic = "force-dynamic";
import { Search, Eye, MapPin } from "lucide-react";
import { PageContent, PageHeader, Card, TableHeader, ScrollTable, StatusBadge } from "@/components/ui/PageShell";
import { getAllOrganizers } from "@/lib/actions/admin";

export default async function AdminOrganizersPage() {
  const organizers = await getAllOrganizers().catch(() => []);

  return (
    <PageContent>
      <PageHeader title="Organizatörler" subtitle={`${organizers.length} organizatör kayıtlı`} />

      <Card>
        <div className="p-4 border-b border-[#E5E7EB]">
          <div className="relative max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input placeholder="Organizatör ara..." className="w-full pl-8 pr-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" />
          </div>
        </div>

        <ScrollTable>
        <table className="w-full">
          <TableHeader columns={["Organizatör", "Şehir", "Turnuva", "İşlem"]} />
          <tbody className="divide-y divide-[#F3F4F6]">
            {organizers.map((org) => (
              <tr key={org.id} className="hover:bg-[#FAFAFA] transition-colors">
                <td className="px-4 py-3">
                  <div className="text-sm font-semibold text-[#111827]">{org.name}</div>
                  <div className="text-xs text-[#9CA3AF]">{org.email ?? "—"}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-sm text-[#6B7280]">
                    <MapPin size={12} /> {org.city ?? "—"}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-[#374151]">{org._count.organizedTournaments}</td>
                <td className="px-4 py-3">
                  <StatusBadge label="Onaylı" variant="green" />
                </td>
              </tr>
            ))}
            {organizers.length === 0 && (
              <tr><td colSpan={4} className="py-10 text-center text-sm text-[#9CA3AF]">Henüz organizatör yok</td></tr>
            )}
          </tbody>
        </table>
        </ScrollTable>
      </Card>
    </PageContent>
  );
}
