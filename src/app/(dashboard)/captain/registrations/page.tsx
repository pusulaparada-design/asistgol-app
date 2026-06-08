import { Trophy, Clock, CheckCircle, XCircle, Users } from "lucide-react";
import { PageContent, PageHeader, Card, StatusBadge } from "@/components/ui/PageShell";
import Link from "next/link";

const registrations = [
  { id: 1, tournament: "Ramazan Kupası 2026", organizer: "Bosphorus Arena", team: "Aslan FC", applied: "2026-05-20", status: "approved", phase: "Grup Aşaması", position: 1, group: "Grup A" },
  { id: 2, tournament: "Yaz Ligi 2026", organizer: "Yıldız Spor", team: "Yıldız SK", applied: "2026-05-28", status: "approved", phase: "5. Hafta", position: 3, group: null },
  { id: 3, tournament: "Akşam Kupası", organizer: "Bosphorus Arena", team: "Aslan FC", applied: "2026-06-06", status: "pending", phase: "Kayıt Bekliyor", position: null, group: null },
  { id: 4, tournament: "Bahar Kupası 2026", organizer: "Ege FC", team: "Aslan FC", applied: "2026-04-01", status: "approved", phase: "Tamamlandı — Çeyrek Final", position: null, group: null },
  { id: 5, tournament: "Kış Turnuvası", organizer: "Anadolu SK", team: "Yıldız SK", applied: "2026-01-10", status: "rejected", phase: "Reddedildi", position: null, group: null },
];

const statusMap = {
  approved: { label: "Onaylı", variant: "green" as const, icon: CheckCircle },
  pending: { label: "Bekliyor", variant: "orange" as const, icon: Clock },
  rejected: { label: "Reddedildi", variant: "red" as const, icon: XCircle },
};

export default function RegistrationsPage() {
  return (
    <PageContent>
      <PageHeader title="Kayıtlarım" subtitle="Tüm turnuva başvurularınız" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
        <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-4">
          <div className="text-2xl font-bold text-[#059669]">{registrations.filter(r => r.status === "approved").length}</div>
          <div className="text-sm text-[#059669] font-medium">Onaylı</div>
        </div>
        <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-xl p-4">
          <div className="text-2xl font-bold text-[#D97706]">{registrations.filter(r => r.status === "pending").length}</div>
          <div className="text-sm text-[#D97706] font-medium">Bekliyor</div>
        </div>
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-4">
          <div className="text-2xl font-bold text-[#DC2626]">{registrations.filter(r => r.status === "rejected").length}</div>
          <div className="text-sm text-[#DC2626] font-medium">Reddedildi</div>
        </div>
      </div>

      <Card>
        <div className="divide-y divide-[#F3F4F6]">
          {registrations.map((r) => {
            const s = statusMap[r.status as keyof typeof statusMap];
            return (
              <div key={r.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#FAFAFA] transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${r.status === "approved" ? "bg-[#ECFDF5]" : r.status === "pending" ? "bg-[#FEF3C7]" : "bg-[#FEF2F2]"}`}>
                  <Trophy size={18} className={r.status === "approved" ? "text-[#059669]" : r.status === "pending" ? "text-[#D97706]" : "text-[#DC2626]"} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-[#111827]">{r.tournament}</span>
                    <StatusBadge label={s.label} variant={s.variant} dot={false} />
                  </div>
                  <div className="text-xs text-[#9CA3AF]">
                    {r.organizer} · <span className="font-medium text-[#374151]">{r.team}</span>
                    {r.group && <span> · Grup A</span>}
                  </div>
                  {r.status === "approved" && r.position && (
                    <div className="text-xs text-[#6B7280] mt-0.5">{r.phase} — #{r.position}. sıra</div>
                  )}
                  {r.status === "pending" && (
                    <div className="text-xs text-[#D97706] mt-0.5">Organizatör onayı bekleniyor</div>
                  )}
                  {r.status === "rejected" && (
                    <div className="text-xs text-[#DC2626] mt-0.5">Başvurunuz onaylanmadı</div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-[#9CA3AF]">{r.applied}</div>
                  {r.status === "approved" && (
                    <Link href={`/captain/tournaments/${r.id}`} className="text-xs font-medium text-[#F59E0B] hover:text-[#D97706] mt-0.5 block">
                      Detay →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </PageContent>
  );
}
