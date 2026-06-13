export const dynamic = "force-dynamic";
import { Trophy } from "lucide-react";
import { PageContent, PageHeader, Card } from "@/components/ui/PageShell";
import { getStandings } from "@/lib/actions/match";
import { prisma } from "@/lib/prisma";

export default async function StandingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [groups, tournament] = await Promise.all([
    getStandings(id).catch(() => []),
    prisma.tournament.findUnique({ where: { id }, select: { name: true } }),
  ]);

  return (
    <PageContent>
      <PageHeader title="Puan Tablosu" subtitle={`${tournament?.name ?? "—"} — Grup Aşaması`} />

      {groups.length === 0 && (
        <div className="py-12 text-center text-sm text-[#9CA3AF]">Henüz grup oluşturulmamış</div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {groups.map(({ group, advance, standings }) => (
          <Card key={group}>
            <div className="px-5 py-3 border-b border-[#E5E7EB] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#111827]">{group}</h3>
              <span className="text-xs text-[#9CA3AF]">İlk {advance} eleman geçer</span>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F3F4F6]">
                  {["#", "Takım", "O", "G", "B", "M", "AG", "YG", "Av", "P"].map((h) => (
                    <th key={h} className="px-2 py-2 text-center text-[10px] font-semibold text-[#9CA3AF] uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {standings.map((row, i) => {
                  const pos = i + 1;
                  return (
                    <tr key={row.team.id} className={`hover:bg-[#FAFAFA] transition-colors ${pos <= advance ? "bg-[#FFFBEB]/40" : ""}`}>
                      <td className="px-2 py-2.5 text-center">
                        <span className={`w-5 h-5 inline-flex items-center justify-center rounded-full text-xs font-bold ${pos === 1 ? "bg-[#FEF3C7] text-[#D97706]" : pos <= advance ? "bg-[#ECFDF5] text-[#059669]" : "bg-[#F3F4F6] text-[#9CA3AF]"}`}>{pos}</span>
                      </td>
                      <td className="px-2 py-2.5">
                        <div className="flex items-center gap-1.5">
                          {pos === 1 && <Trophy size={11} className="text-[#F59E0B] shrink-0" />}
                          <span className="text-sm font-medium text-[#111827]">{row.team.name}</span>
                        </div>
                      </td>
                      {[row.p, row.w, row.d, row.l, row.gf, row.ga].map((v, j) => (
                        <td key={j} className="px-2 py-2.5 text-center text-xs text-[#6B7280]">{v}</td>
                      ))}
                      <td className="px-2 py-2.5 text-center text-xs font-medium text-[#374151]">{row.av > 0 ? `+${row.av}` : row.av}</td>
                      <td className="px-2 py-2.5 text-center">
                        <span className="text-sm font-bold text-[#111827]">{row.pts}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-4 py-2.5 flex items-center gap-4 bg-[#FAFAFA] border-t border-[#F3F4F6] rounded-b-xl">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-[#FEF3C7] border border-[#F59E0B]/30" />
                <span className="text-[10px] text-[#9CA3AF]">1. — Lider</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-[#ECFDF5] border border-[#10B981]/30" />
                <span className="text-[10px] text-[#9CA3AF]">Elemeye katılır</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </PageContent>
  );
}
