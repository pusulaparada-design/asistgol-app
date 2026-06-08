import { Plus, Trophy, Users, Swords } from "lucide-react";
import { PageContent, PageHeader, Card, ActionButton, StatusBadge, ProgressBar } from "@/components/ui/PageShell";
import Link from "next/link";

const tournaments = [
  {
    id: 1,
    name: "Ramazan Kupası 2026",
    format: "Grup + Eleme",
    teams: 12, maxTeams: 16,
    matches: { played: 18, total: 48 },
    phase: "Grup Aşaması (Tur 2)",
    status: "active",
    startDate: "20 May", endDate: "30 Haz",
    prize: "₺5.000",
  },
  {
    id: 2,
    name: "Yaz Ligi 2026",
    format: "Sadece Lig",
    teams: 8, maxTeams: 8,
    matches: { played: 28, total: 56 },
    phase: "5. Hafta",
    status: "active",
    startDate: "1 Haz", endDate: "15 Tem",
    prize: "Kupa",
  },
  {
    id: 3,
    name: "Akşam Kupası",
    format: "Sadece Eleme",
    teams: 4, maxTeams: 8,
    matches: { played: 0, total: 7 },
    phase: "Kayıt Açık",
    status: "registration",
    startDate: "20 Haz", endDate: "5 Tem",
    prize: "₺2.000",
  },
  {
    id: 4,
    name: "Bahar Kupası 2026",
    format: "Grup + Eleme",
    teams: 8, maxTeams: 8,
    matches: { played: 24, total: 24 },
    phase: "Tamamlandı",
    status: "completed",
    startDate: "1 Nis", endDate: "15 May",
    prize: "₺3.000",
    champion: "Rüzgar Spor",
  },
];

const statusMap = {
  active: { label: "Aktif", variant: "green" as const },
  registration: { label: "Kayıt Açık", variant: "blue" as const },
  completed: { label: "Tamamlandı", variant: "gray" as const },
  draft: { label: "Taslak", variant: "orange" as const },
};

export default function OrganizerTournamentsPage() {
  return (
    <PageContent>
      <PageHeader
        title="Turnuvalarım"
        subtitle={`${tournaments.length} turnuva`}
        actions={
          <ActionButton href="/organizer/tournaments/create" variant="primary" icon={Plus}>
            Yeni Turnuva Oluştur
          </ActionButton>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {tournaments.map((t) => {
          const s = statusMap[t.status as keyof typeof statusMap];
          return (
            <Card key={t.id} className="hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-[#111827]">{t.name}</h3>
                      <StatusBadge label={s.label} variant={s.variant} dot={false} />
                    </div>
                    <div className="text-xs text-[#9CA3AF]">{t.format} · {t.startDate} – {t.endDate}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-[#9CA3AF]">Ödül</div>
                    <div className="text-sm font-bold text-[#F59E0B]">{t.prize}</div>
                  </div>
                </div>

                {t.status === "completed" && t.champion && (
                  <div className="flex items-center gap-2 mb-4 p-2.5 bg-[#FEF3C7] rounded-lg">
                    <Trophy size={14} className="text-[#D97706]" />
                    <span className="text-xs font-semibold text-[#D97706]">Şampiyon: {t.champion}</span>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-2 bg-[#F4F6F9] rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-[#9CA3AF] mb-1"><Users size={12} /></div>
                    <div className="text-sm font-bold text-[#111827]">{t.teams}/{t.maxTeams}</div>
                    <div className="text-[10px] text-[#9CA3AF]">Takım</div>
                  </div>
                  <div className="text-center p-2 bg-[#F4F6F9] rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-[#9CA3AF] mb-1"><Swords size={12} /></div>
                    <div className="text-sm font-bold text-[#111827]">{t.matches.played}/{t.matches.total}</div>
                    <div className="text-[10px] text-[#9CA3AF]">Maç</div>
                  </div>
                  <div className="text-center p-2 bg-[#F4F6F9] rounded-lg">
                    <div className="text-sm font-bold text-[#111827]">{t.phase}</div>
                    <div className="text-[10px] text-[#9CA3AF] mt-1">Aşama</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-xs text-[#9CA3AF] mb-1">
                    <span>İlerleme</span>
                    <span>{t.matches.played}/{t.matches.total} maç</span>
                  </div>
                  <ProgressBar value={t.matches.played} max={t.matches.total} color={t.status === "completed" ? "green" : "blue"} />
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/organizer/tournaments/${t.id}`}
                    className="flex-1 text-center text-sm font-medium py-2 rounded-lg bg-[#0F1F47] text-white hover:bg-[#1A2F5A] transition-colors"
                  >
                    Yönet
                  </Link>
                  <Link
                    href={`/organizer/tournaments/${t.id}/fixture`}
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-[#F4F6F9] text-[#374151] hover:bg-[#E5E7EB] transition-colors"
                  >
                    Fikstür
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
