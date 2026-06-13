import { Plus, Trophy, Users, Swords } from "lucide-react";
import { PageContent, PageHeader, Card, ActionButton, StatusBadge, ProgressBar } from "@/components/ui/PageShell";
import Link from "next/link";
import { getTournaments } from "@/lib/actions/tournament";
import { getSession } from "@/lib/auth";

const FORMAT_LABELS: Record<string, string> = {
  GROUP_KNOCKOUT: "Grup + Eleme",
  GROUP_ONLY: "Sadece Lig",
  KNOCKOUT_ONLY: "Sadece Eleme",
};

const STATUS_MAP: Record<string, { label: string; variant: "green" | "blue" | "gray" | "orange" }> = {
  ACTIVE:       { label: "Aktif",        variant: "green"  },
  REGISTRATION: { label: "Kayıt Açık",   variant: "blue"   },
  COMPLETED:    { label: "Tamamlandı",   variant: "gray"   },
  DRAFT:        { label: "Taslak",       variant: "orange" },
};

const PHASE_MAP: Record<string, string> = {
  DRAFT:        "Taslak",
  REGISTRATION: "Kayıt Açık",
  ACTIVE:       "Devam Ediyor",
  COMPLETED:    "Tamamlandı",
};

function formatDate(d: Date | null | undefined): string {
  if (!d) return "—";
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

export default async function OrganizerTournamentsPage() {
  const session = await getSession();
  const tournaments = await getTournaments(session?.userId);

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

      {tournaments.length === 0 && (
        <Card>
          <div className="p-10 text-center text-[#9CA3AF]">
            <Trophy size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">Henüz turnuva oluşturmadınız.</p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {tournaments.map((t) => {
          const s = STATUS_MAP[t.status] ?? STATUS_MAP.DRAFT;
          const registeredTeams = t._count.registrations;
          const totalMatches = t._count.matches;

          return (
            <Card key={t.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <Link href={`/organizer/tournaments/${t.id}`} className="block p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-base font-bold text-[#111827]">{t.name}</h3>
                      <StatusBadge label={s.label} variant={s.variant} dot={false} />
                    </div>
                    <div className="text-xs text-[#9CA3AF]">
                      {FORMAT_LABELS[t.format] ?? t.format} · {formatDate(t.startDate)} – {formatDate(t.endDate)}
                    </div>
                  </div>
                  {t.prize && (
                    <div className="shrink-0 text-right">
                      <div className="text-xs text-[#9CA3AF]">Ödül</div>
                      <div className="text-sm font-bold text-[#F59E0B]">{t.prize}</div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-2 bg-[#F4F6F9] rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-[#9CA3AF] mb-1"><Users size={12} /></div>
                    <div className="text-sm font-bold text-[#111827]">{registeredTeams}/{t.maxTeams}</div>
                    <div className="text-[10px] text-[#9CA3AF]">Takım</div>
                  </div>
                  <div className="text-center p-2 bg-[#F4F6F9] rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-[#9CA3AF] mb-1"><Swords size={12} /></div>
                    <div className="text-sm font-bold text-[#111827]">{totalMatches}</div>
                    <div className="text-[10px] text-[#9CA3AF]">Maç</div>
                  </div>
                  <div className="text-center p-2 bg-[#F4F6F9] rounded-lg">
                    <div className="text-sm font-bold text-[#111827]">{PHASE_MAP[t.status]}</div>
                    <div className="text-[10px] text-[#9CA3AF] mt-1">Aşama</div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-[#9CA3AF] mb-1">
                    <span>Kayıt Doluluk</span>
                    <span>{registeredTeams}/{t.maxTeams} takım</span>
                  </div>
                  <ProgressBar value={registeredTeams} max={t.maxTeams} color={t.status === "COMPLETED" ? "green" : "blue"} />
                </div>
              </Link>
            </Card>
          );
        })}
      </div>
    </PageContent>
  );
}
