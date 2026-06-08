import { Users, CheckCircle, XCircle, Search, Eye } from "lucide-react";
import { PageContent, PageHeader, Card, TableHeader, StatusBadge, ActionButton } from "@/components/ui/PageShell";

const teams = [
  { id: 1, name: "Aslan FC", captain: "Murat Arslan", phone: "0532 111 22 33", players: 12, appliedDate: "2026-05-20", group: "Grup A", status: "approved" },
  { id: 2, name: "Kaplan SK", captain: "Serdar Öz", phone: "0543 222 33 44", players: 11, appliedDate: "2026-05-21", group: "Grup A", status: "approved" },
  { id: 3, name: "Çınar FC", captain: "Baran Kurt", phone: "0555 333 44 55", players: 13, appliedDate: "2026-05-22", group: "Grup A", status: "approved" },
  { id: 4, name: "Rüzgar Spor", captain: "Tolga Ak", phone: "0506 444 55 66", players: 10, appliedDate: "2026-05-23", group: "Grup B", status: "approved" },
  { id: 5, name: "Ateş FC", captain: "Özgür Can", phone: "0532 555 66 77", players: 11, appliedDate: "2026-05-24", group: "Grup B", status: "approved" },
  { id: 6, name: "Demir SK", captain: "Emre Yol", phone: "0543 666 77 88", players: 9, appliedDate: "2026-05-25", group: "Grup C", status: "approved" },
  { id: 7, name: "Fırtına FC", captain: "Ali Güç", phone: "0555 777 88 99", players: 12, appliedDate: "2026-05-26", group: "Grup C", status: "approved" },
  { id: 8, name: "Şimşek SK", captain: "Veli Hız", phone: "0506 888 99 00", players: 10, appliedDate: "2026-05-27", group: "Grup D", status: "approved" },
  { id: 9, name: "Kar FC", captain: "Hakan Buz", phone: "0532 999 00 11", players: 11, appliedDate: "2026-06-01", group: "Grup D", status: "approved" },
  { id: 10, name: "Güneş Spor", captain: "Tarık Işık", phone: "0543 000 11 22", players: 12, appliedDate: "2026-06-02", group: "—", status: "approved" },
  { id: 11, name: "Bordo FC", captain: "Taner Gül", phone: "0555 111 22 33", players: 10, appliedDate: "2026-06-06", group: "—", status: "approved" },
  { id: 12, name: "Lacivert SK", captain: "Soner Mavi", phone: "0506 222 33 44", players: 11, appliedDate: "2026-06-07", group: "—", status: "approved" },
  { id: 13, name: "Yıldırım SK", captain: "Hüseyin Koç", phone: "0532 333 44 55", players: 11, appliedDate: "2026-06-07", group: "—", status: "pending" },
  { id: 14, name: "Şimşek FC", captain: "Deniz Ak", phone: "0543 444 55 66", players: 10, appliedDate: "2026-06-08", group: "—", status: "pending" },
  { id: 15, name: "Sarı Kanarya", captain: "Efe Sarı", phone: "0555 555 66 77", players: 9, appliedDate: "2026-06-08", group: "—", status: "rejected" },
];

export default function TournamentTeamsPage({ params }: { params: { id: string } }) {
  const pending = teams.filter(t => t.status === "pending");
  const approved = teams.filter(t => t.status === "approved");

  return (
    <PageContent>
      <PageHeader
        title="Takım Başvuruları"
        subtitle={`${approved.length}/16 onaylı · ${pending.length} bekliyor`}
      />

      <div className="flex gap-1 bg-white border border-[#E5E7EB] rounded-xl p-1 w-fit">
        {["Tümü", "Onay Bekliyor", "Onaylı", "Reddedildi"].map((tab, i) => (
          <button key={tab} className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
            i === 0 ? "bg-[#0F1F47] text-white" : "text-[#6B7280] hover:bg-[#F4F6F9]"
          }`}>
            {tab}
            {i === 1 && pending.length > 0 && (
              <span className="ml-1.5 bg-[#EF4444] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pending.length}</span>
            )}
          </button>
        ))}
      </div>

      <Card>
        <div className="p-4 border-b border-[#E5E7EB]">
          <div className="relative max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input placeholder="Takım ara..." className="w-full pl-8 pr-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" />
          </div>
        </div>

        <table className="w-full">
          <TableHeader columns={["Takım", "Kaptan", "Telefon", "Oyuncu", "Grup", "Başvuru", "Durum", "İşlem"]} />
          <tbody className="divide-y divide-[#F3F4F6]">
            {teams.map((t) => (
              <tr key={t.id} className={`hover:bg-[#FAFAFA] transition-colors ${t.status === "pending" ? "bg-[#FFFBEB]/30" : ""}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-[#EFF6FF] rounded-lg flex items-center justify-center shrink-0">
                      <Users size={13} className="text-[#3B82F6]" />
                    </div>
                    <span className="text-sm font-semibold text-[#111827]">{t.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-[#6B7280]">{t.captain}</td>
                <td className="px-4 py-3 text-xs text-[#9CA3AF] font-mono">{t.phone}</td>
                <td className="px-4 py-3 text-sm text-[#374151] font-medium">{t.players}</td>
                <td className="px-4 py-3 text-xs text-[#6B7280]">{t.group}</td>
                <td className="px-4 py-3 text-xs text-[#9CA3AF]">{t.appliedDate}</td>
                <td className="px-4 py-3">
                  <StatusBadge
                    label={t.status === "approved" ? "Onaylı" : t.status === "pending" ? "Bekliyor" : "Reddedildi"}
                    variant={t.status === "approved" ? "green" : t.status === "pending" ? "orange" : "red"}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded-md bg-[#F4F6F9] text-[#6B7280] hover:bg-[#E5E7EB]"><Eye size={13} /></button>
                    {t.status === "pending" && (
                      <>
                        <button className="p-1.5 rounded-md bg-[#ECFDF5] text-[#059669] hover:bg-[#D1FAE5]"><CheckCircle size={13} /></button>
                        <button className="p-1.5 rounded-md bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2]"><XCircle size={13} /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card>
        <div className="p-5">
          <h3 className="text-sm font-semibold text-[#111827] mb-4">Grup Dağılımı</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {["A", "B", "C", "D"].map((g) => {
              const groupTeams = teams.filter(t => t.group === `Grup ${g}`);
              return (
                <div key={g} className="p-3 bg-[#F4F6F9] rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#374151]">Grup {g}</span>
                    <span className="text-xs text-[#9CA3AF]">{groupTeams.length}/4</span>
                  </div>
                  <div className="space-y-1">
                    {groupTeams.map(t => (
                      <div key={t.name} className="text-xs text-[#6B7280] py-1 border-b border-white last:border-0">{t.name}</div>
                    ))}
                    {Array.from({ length: Math.max(0, 4 - groupTeams.length) }).map((_, i) => (
                      <div key={i} className="text-xs text-[#D1D5DB] py-1 border-b border-white last:border-0 italic">— Boş —</div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex justify-end">
            <ActionButton variant="secondary" size="sm">Grup Dağılımını Kaydet</ActionButton>
          </div>
        </div>
      </Card>
    </PageContent>
  );
}
