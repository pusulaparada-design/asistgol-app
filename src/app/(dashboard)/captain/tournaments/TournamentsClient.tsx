"use client";
import { useState } from "react";
import { MapPin, Calendar, Search, Trophy } from "lucide-react";
import { PageContent, PageHeader, Card, StatusBadge, ProgressBar } from "@/components/ui/PageShell";
import Link from "next/link";
import RegisterTournamentModal from "@/components/tournament/RegisterTournamentModal";
import type { getMyTeams } from "@/lib/actions/team";
import type { getTournaments } from "@/lib/actions/tournament";

type MyTeams = Awaited<ReturnType<typeof getMyTeams>>;
type AllTournaments = Awaited<ReturnType<typeof getTournaments>>;
type Tournament = AllTournaments[number];

const FORMAT_LABELS: Record<string, string> = {
  GROUP_KNOCKOUT: "Grup + Eleme",
  GROUP_ONLY:     "Sadece Lig",
  KNOCKOUT_ONLY:  "Sadece Eleme",
};

const STATUS_MAP: Record<string, { label: string; variant: "green" | "blue" | "gray" | "orange" }> = {
  REGISTRATION: { label: "Talep Topluyor", variant: "green" },
  ACTIVE:       { label: "Devam Ediyor",   variant: "blue"  },
  COMPLETED:    { label: "Bitti",          variant: "gray"  },
  DRAFT:        { label: "Taslak",         variant: "orange"},
};

const REG_STATUS: Record<string, { label: string; variant: "green" | "blue" | "gray" | "orange" }> = {
  PENDING:  { label: "Onay Bekliyor", variant: "orange" },
  APPROVED: { label: "Onaylandı",    variant: "green"  },
  REJECTED: { label: "Reddedildi",   variant: "gray"   },
};

function formatDate(d: Date | null | undefined): string {
  if (!d) return "—";
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

export default function TournamentsClient({
  myTeams,
  allTournaments,
}: {
  myTeams: MyTeams;
  allTournaments: AllTournaments;
}) {
  const [cityFilter, setCityFilter] = useState("");
  const [search, setSearch] = useState("");
  const [registerModal, setRegisterModal] = useState<Tournament | null>(null);

  // Kaptanın tüm kayıtları (takım + turnuva + durum)
  const myRegistrations = myTeams.flatMap(team =>
    team.registrations.map(reg => ({ team, reg }))
  );

  // Bekleyen kayıtlar
  const pendingRegs = myRegistrations.filter(r => r.reg.tournament.status !== "COMPLETED");

  // Benzersiz şehirler
  const cities = Array.from(new Set(allTournaments.map(t => t.city).filter(Boolean))).sort();

  // Filtreli turnuvalar
  const filtered = allTournaments.filter(t => {
    const matchCity = !cityFilter || t.city === cityFilter;
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.city?.toLowerCase().includes(search.toLowerCase());
    return matchCity && matchSearch;
  });

  return (
    <PageContent>
      <PageHeader title="Turnuva Keşfet" subtitle={`${allTournaments.length} turnuva`} />

      {/* 2 özet kart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Kart 1: Turnuvalarım */}
        <Card>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={16} className="text-[#F59E0B]" />
              <h3 className="text-sm font-bold text-[#111827]">Turnuvalarım</h3>
              <span className="ml-auto text-xs text-[#9CA3AF]">{myRegistrations.length} kayıt</span>
            </div>

            {myRegistrations.length === 0 ? (
              <p className="text-sm text-[#9CA3AF] text-center py-4">Henüz hiçbir turnuvaya kayıt yaptırmadınız.</p>
            ) : (
              <div className="space-y-2">
                {myRegistrations.slice(0, 5).map(({ team, reg }) => {
                  const ts = STATUS_MAP[reg.tournament.status] ?? STATUS_MAP.DRAFT;
                  const rs = REG_STATUS[reg.status] ?? REG_STATUS.PENDING;
                  return (
                    <Link key={reg.id} href={`/captain/tournaments/${reg.tournament.id}`} className="flex items-center justify-between gap-2 py-2 border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAFA] -mx-2 px-2 rounded-lg transition-colors">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-[#111827] truncate">{reg.tournament.name}</div>
                        <div className="text-xs text-[#9CA3AF]">{team.name}</div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <StatusBadge label={rs.label} variant={rs.variant} dot={false} />
                        <StatusBadge label={ts.label} variant={ts.variant} dot={false} />
                      </div>
                    </Link>
                  );
                })}
                {myRegistrations.length > 5 && (
                  <p className="text-xs text-[#9CA3AF] text-center pt-1">+{myRegistrations.length - 5} kayıt daha</p>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Kart 2: Bekleyen / Özet */}
        <Card>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
              <h3 className="text-sm font-bold text-[#111827]">Genel Durum</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Kayıtlı Turnuva",  val: myRegistrations.length,                                           color: "text-[#0F1F47]"  },
                { label: "Onay Bekliyor",     val: myRegistrations.filter(r => r.reg.status === "PENDING").length,  color: "text-[#F59E0B]"  },
                { label: "Onaylandı",         val: myRegistrations.filter(r => r.reg.status === "APPROVED").length, color: "text-[#10B981]"  },
                { label: "Açık Turnuva",      val: allTournaments.filter(t => t.status === "REGISTRATION").length,  color: "text-[#3B82F6]"  },
              ].map(s => (
                <div key={s.label} className="text-center p-3 bg-[#F4F6F9] rounded-xl">
                  <div className={`text-2xl font-bold ${s.color}`}>{s.val}</div>
                  <div className="text-xs text-[#9CA3AF] mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Tüm Turnuvalar */}
      <div>
        <h2 className="text-sm font-bold text-[#111827] mb-3">Tüm Turnuvalar</h2>

        {/* Filtreler */}
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Turnuva veya şehir ara..."
              className="w-full pl-8 pr-4 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]"
            />
          </div>
          <select
            value={cityFilter}
            onChange={e => setCityFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]"
          >
            <option value="">Tüm Şehirler</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {filtered.length === 0 && (
          <Card>
            <div className="p-10 text-center text-sm text-[#9CA3AF]">Filtreyle eşleşen turnuva bulunamadı.</div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((t) => {
            const approvedCount = t.registrations.length;
            const spotsLeft = t.maxTeams - approvedCount;
            const isFull = approvedCount >= t.maxTeams;
            const canRegister = t.status === "REGISTRATION" && !isFull;
            const isUrgent = spotsLeft <= 2 && canRegister;
            const s = (t.status === "REGISTRATION" && isFull)
              ? { label: "Hazırlanıyor", variant: "orange" as const }
              : STATUS_MAP[t.status] ?? STATUS_MAP.DRAFT;

            return (
              <Card key={t.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <Link href={`/captain/tournaments/${t.id}`} className="block p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-sm font-bold text-[#111827] truncate">{t.name}</h3>
                        <StatusBadge label={s.label} variant={s.variant} dot={false} />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                        <MapPin size={11} /> {t.city} · {t.organizer.name}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="text-center p-2 bg-[#F4F6F9] rounded-lg">
                      <div className="text-xs text-[#9CA3AF]">Format</div>
                      <div className="text-xs font-semibold text-[#374151] mt-0.5">{FORMAT_LABELS[t.format] ?? t.format}</div>
                    </div>
                    <div className="text-center p-2 bg-[#F4F6F9] rounded-lg">
                      <div className="text-xs text-[#9CA3AF]">Ödül</div>
                      <div className="text-xs font-semibold text-[#F59E0B] mt-0.5">{t.prize ?? "—"}</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#9CA3AF]">Doluluk</span>
                      <span className={`font-semibold ${isFull ? "text-[#EF4444]" : isUrgent ? "text-[#F59E0B]" : "text-[#374151]"}`}>
                        {approvedCount}/{t.maxTeams} takım{isFull ? " — Dolu" : isUrgent ? ` — Son ${spotsLeft} yer!` : ""}
                      </span>
                    </div>
                    <ProgressBar value={approvedCount} max={t.maxTeams} color={isFull ? "red" : isUrgent ? "red" : "gold"} />
                  </div>

                  <div className="flex items-center gap-1 text-xs text-[#9CA3AF] mb-4">
                    <Calendar size={11} /> {formatDate(t.startDate)}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[#9CA3AF]">Kayıt Ücreti</span>
                      <div className="text-sm font-bold text-[#111827]">{t.fee ? `₺${t.fee}` : "Ücretsiz"}</div>
                    </div>
                    {canRegister && (
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setRegisterModal(t); }}
                        className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#0F1F47] text-white hover:bg-[#1a2f5e] transition-colors"
                      >
                        Kayıt Ol
                      </button>
                    )}
                  </div>
                </Link>
              </Card>
            );
          })}
        </div>
      </div>

      {registerModal && (
        <RegisterTournamentModal
          tournament={registerModal}
          myTeams={myTeams}
          onClose={() => setRegisterModal(null)}
        />
      )}
    </PageContent>
  );
}
