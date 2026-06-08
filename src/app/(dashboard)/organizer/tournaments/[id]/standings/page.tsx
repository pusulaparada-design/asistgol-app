import { Trophy } from "lucide-react";
import { PageContent, PageHeader, Card } from "@/components/ui/PageShell";

type Team = { pos: number; name: string; p: number; g: number; b: number; m: number; ag: number; yg: number; av: number; pts: number };

const groups: { name: string; advance: number; teams: Team[] }[] = [
  {
    name: "Grup A", advance: 2,
    teams: [
      { pos: 1, name: "Aslan FC", p: 4, g: 3, b: 1, m: 0, ag: 10, yg: 4, av: 6, pts: 10 },
      { pos: 2, name: "Çınar FC", p: 4, g: 2, b: 1, m: 1, ag: 8, yg: 6, av: 2, pts: 7 },
      { pos: 3, name: "Kaplan SK", p: 4, g: 1, b: 1, m: 2, ag: 5, yg: 8, av: -3, pts: 4 },
      { pos: 4, name: "Ateş FC", p: 4, g: 0, b: 1, m: 3, ag: 2, yg: 7, av: -5, pts: 1 },
    ],
  },
  {
    name: "Grup B", advance: 2,
    teams: [
      { pos: 1, name: "Rüzgar Spor", p: 4, g: 4, b: 0, m: 0, ag: 12, yg: 3, av: 9, pts: 12 },
      { pos: 2, name: "Demir SK", p: 4, g: 2, b: 1, m: 1, ag: 7, yg: 5, av: 2, pts: 7 },
      { pos: 3, name: "Fırtına FC", p: 4, g: 1, b: 0, m: 3, ag: 4, yg: 9, av: -5, pts: 3 },
      { pos: 4, name: "Şimşek SK", p: 4, g: 0, b: 1, m: 3, ag: 2, yg: 8, av: -6, pts: 1 },
    ],
  },
  {
    name: "Grup C", advance: 2,
    teams: [
      { pos: 1, name: "Kar FC", p: 3, g: 2, b: 1, m: 0, ag: 7, yg: 3, av: 4, pts: 7 },
      { pos: 2, name: "Güneş Spor", p: 3, g: 2, b: 0, m: 1, ag: 6, yg: 4, av: 2, pts: 6 },
      { pos: 3, name: "Bordo FC", p: 3, g: 1, b: 0, m: 2, ag: 3, yg: 6, av: -3, pts: 3 },
      { pos: 4, name: "Lacivert SK", p: 3, g: 0, b: 1, m: 2, ag: 2, yg: 5, av: -3, pts: 1 },
    ],
  },
  {
    name: "Grup D", advance: 2,
    teams: [
      { pos: 1, name: "Yıldırım SK", p: 2, g: 2, b: 0, m: 0, ag: 5, yg: 1, av: 4, pts: 6 },
      { pos: 2, name: "Fener SK", p: 2, g: 1, b: 0, m: 1, ag: 3, yg: 3, av: 0, pts: 3 },
      { pos: 3, name: "Galip FC", p: 2, g: 0, b: 1, m: 1, ag: 2, yg: 4, av: -2, pts: 1 },
      { pos: 4, name: "Çelik Spor", p: 2, g: 0, b: 1, m: 1, ag: 1, yg: 3, av: -2, pts: 1 },
    ],
  },
];

export default function StandingsPage({ params }: { params: { id: string } }) {
  return (
    <PageContent>
      <PageHeader title="Puan Tablosu" subtitle="Ramazan Kupası 2026 — Grup Aşaması" />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {groups.map((group) => (
          <Card key={group.name}>
            <div className="px-5 py-3 border-b border-[#E5E7EB] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#111827]">{group.name}</h3>
              <span className="text-xs text-[#9CA3AF]">İlk {group.advance} eleman geçer</span>
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
                {group.teams.map((row) => (
                  <tr
                    key={row.name}
                    className={`hover:bg-[#FAFAFA] transition-colors ${row.pos <= group.advance ? "bg-[#FFFBEB]/40" : ""}`}
                  >
                    <td className="px-2 py-2.5 text-center">
                      <span className={`w-5 h-5 inline-flex items-center justify-center rounded-full text-xs font-bold ${
                        row.pos === 1 ? "bg-[#FEF3C7] text-[#D97706]" : row.pos <= group.advance ? "bg-[#ECFDF5] text-[#059669]" : "bg-[#F3F4F6] text-[#9CA3AF]"
                      }`}>{row.pos}</span>
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex items-center gap-1.5">
                        {row.pos === 1 && <Trophy size={11} className="text-[#F59E0B] shrink-0" />}
                        <span className="text-sm font-medium text-[#111827]">{row.name}</span>
                      </div>
                    </td>
                    {[row.p, row.g, row.b, row.m, row.ag, row.yg].map((v, i) => (
                      <td key={i} className="px-2 py-2.5 text-center text-xs text-[#6B7280]">{v}</td>
                    ))}
                    <td className="px-2 py-2.5 text-center text-xs font-medium text-[#374151]">{row.av > 0 ? `+${row.av}` : row.av}</td>
                    <td className="px-2 py-2.5 text-center">
                      <span className="text-sm font-bold text-[#111827]">{row.pts}</span>
                    </td>
                  </tr>
                ))}
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
