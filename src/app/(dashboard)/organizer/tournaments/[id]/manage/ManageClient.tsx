"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Edit2, CheckCircle, XCircle, Trophy,
  Calendar, Users, Phone, CreditCard, User,
  LayoutGrid, CalendarDays, Zap,
} from "lucide-react";
import { PageContent, PageHeader, Card, StatusBadge } from "@/components/ui/PageShell";
import {
  approveRegistration,
  rejectRegistration,
  togglePayment,
  getTournamentMatches,
  getTournamentRegistrations,
  getGroupsWithTeams,
} from "@/lib/actions/tournament";
import MatchModal from "../MatchModal";
import GroupsTab from "./GroupsTab";
import ScheduleTab, { type MatchWeek } from "./ScheduleTab";
import FixtureTab from "./FixtureTab";

type Matches = Awaited<ReturnType<typeof getTournamentMatches>>;
type TMatch = Matches[number];
type Registrations = Awaited<ReturnType<typeof getTournamentRegistrations>>;
type Reg = Registrations[number] & { paid: boolean };
type Groups = Awaited<ReturnType<typeof getGroupsWithTeams>>;

type Tab = "matches" | "registrations" | "groups" | "schedule" | "fixture";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "matches",       label: "Maçlar",          icon: <Trophy size={14} /> },
  { id: "registrations", label: "Başvurular",       icon: <Users size={14} /> },
  { id: "groups",        label: "Gruplar",          icon: <LayoutGrid size={14} /> },
  { id: "schedule",      label: "Maç Günleri",      icon: <CalendarDays size={14} /> },
  { id: "fixture",       label: "Fikstür Oluştur",  icon: <Zap size={14} /> },
];

const ROUND_LABEL: Record<string, string> = {
  ROUND_OF_32: "Son 32", ROUND_OF_16: "Son 16",
  QUARTER_FINAL: "Çeyrek Final", SEMI_FINAL: "Yarı Final",
  FINAL: "Final", THIRD_PLACE: "3. Yer",
};

function fmt(d: Date | null | undefined) {
  if (!d) return "—";
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

function matchLabel(m: TMatch) {
  if (m.group?.name) return m.group.name;
  if (m.round) return ROUND_LABEL[m.round] ?? m.round;
  return "Eleme";
}

/* ── Kayıt satırı ─────────────────────────────────────────── */
function RegRow({ reg }: { reg: Reg }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleTogglePay() {
    startTransition(async () => {
      await togglePayment(reg.id);
      router.refresh();
    });
  }
  function handleApprove() {
    startTransition(async () => {
      await approveRegistration(reg.id);
      router.refresh();
    });
  }
  function handleReject() {
    startTransition(async () => {
      await rejectRegistration(reg.id);
      router.refresh();
    });
  }

  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 hover:bg-[#FAFAFA] transition-colors ${pending ? "opacity-60" : ""}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-7 h-7 bg-[#EFF6FF] rounded-lg flex items-center justify-center shrink-0">
            <Users size={12} className="text-[#3B82F6]" />
          </div>
          <span className="text-sm font-semibold text-[#111827] truncate">{reg.team.name}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#9CA3AF] ml-9">
          {reg.team.captain && (
            <span className="flex items-center gap-1"><User size={10} />{reg.team.captain.name}</span>
          )}
          {reg.team.captain?.phone && (
            <span className="flex items-center gap-1"><Phone size={10} />{reg.team.captain.phone}</span>
          )}
        </div>
      </div>

      <div className="hidden md:block shrink-0 max-w-[120px]">
        <div className="text-[10px] text-[#9CA3AF]">{reg.groupTeam?.group.name ?? "Grup atanmadı"}</div>
      </div>

      <button
        onClick={handleTogglePay}
        disabled={pending}
        title="Ödeme durumunu değiştir"
        className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
          reg.paid
            ? "bg-[#ECFDF5] text-[#059669] hover:bg-[#D1FAE5]"
            : "bg-[#F4F6F9] text-[#9CA3AF] hover:bg-[#E5E7EB]"
        }`}
      >
        <CreditCard size={12} />
        {reg.paid ? "Ödendi" : "Ödenmedi"}
      </button>

      <StatusBadge
        label={reg.status === "PENDING" ? "Bekliyor" : reg.status === "APPROVED" ? "Onaylı" : "Reddedildi"}
        variant={reg.status === "PENDING" ? "orange" : reg.status === "APPROVED" ? "green" : "gray"}
        dot={false}
      />

      <div className="flex gap-1 shrink-0">
        {reg.status !== "APPROVED" && (
          <button onClick={handleApprove} disabled={pending} title="Onayla"
            className="p-1.5 rounded-lg bg-[#ECFDF5] text-[#059669] hover:bg-[#D1FAE5] disabled:opacity-40 transition-colors"
          >
            <CheckCircle size={15} />
          </button>
        )}
        {reg.status !== "REJECTED" && (
          <button onClick={handleReject} disabled={pending} title="Reddet"
            className="p-1.5 rounded-lg bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2] disabled:opacity-40 transition-colors"
          >
            <XCircle size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Maçlar sekmesi ───────────────────────────────────────── */
function MatchesTab({ matches, onScore }: { matches: Matches; onScore: (m: TMatch) => void }) {
  return (
    <div>
      <Card>
        <div className="grid grid-cols-[80px_1fr_96px_1fr_96px_auto] items-center gap-2 px-4 py-2 bg-[#F8FAFC] border-b border-[#E5E7EB]">
          <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Tarih</span>
          <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider text-right">Ev Sahibi</span>
          <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider text-center">Skor</span>
          <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Deplasman</span>
          <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Tur</span>
          <span />
        </div>
        <div className="divide-y divide-[#F3F4F6]">
          {matches.length === 0 && (
            <div className="py-10 text-center text-sm text-[#9CA3AF]">Henüz maç oluşturulmadı.</div>
          )}
          {matches.map(m => {
            const played = m.homeScore !== null;
            return (
              <div key={m.id} className="grid grid-cols-[80px_1fr_96px_1fr_96px_auto] items-center gap-2 px-4 py-3 hover:bg-[#FAFAFA] transition-colors">
                <div className="text-xs text-[#9CA3AF]">
                  <div className="flex items-center gap-1"><Calendar size={10} />{fmt(m.date)}</div>
                  {m.time && <div className="ml-3.5 text-[10px]">{m.time}</div>}
                </div>
                <div className="text-sm font-semibold text-[#111827] text-right truncate">{m.homeTeam.name}</div>
                <div className="text-center">
                  {played
                    ? <span className="font-mono font-extrabold text-sm text-[#111827]">{m.homeScore} – {m.awayScore}</span>
                    : <span className="text-xs text-[#D1D5DB]">vs</span>
                  }
                </div>
                <div className="text-sm font-semibold text-[#111827] truncate">{m.awayTeam.name}</div>
                <div>
                  <span className="text-[10px] bg-[#F4F6F9] text-[#6B7280] px-2 py-0.5 rounded-md font-medium">{matchLabel(m)}</span>
                </div>
                <button
                  onClick={() => onScore(m)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    played
                      ? "bg-[#F4F6F9] text-[#6B7280] hover:bg-[#E5E7EB]"
                      : "bg-[#FEF3C7] text-[#D97706] hover:bg-[#FDE68A]"
                  }`}
                >
                  <Edit2 size={11} />
                  {played ? "Düzenle" : "Skor Gir"}
                </button>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/* ── Başvurular sekmesi ───────────────────────────────────── */
function RegistrationsTab({ registrations }: { registrations: Registrations }) {
  const pending = registrations.filter(r => r.status === "PENDING");
  return (
    <Card>
      {pending.length > 0 && (
        <div className="px-4 py-2.5 bg-[#FEF3C7] border-b border-[#FCD34D] flex items-center gap-2">
          <span className="bg-[#F59E0B] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pending.length}</span>
          <span className="text-xs font-medium text-[#92400E]">onay bekleyen başvuru</span>
        </div>
      )}
      <div className="divide-y divide-[#F3F4F6]">
        {registrations.length === 0 && (
          <div className="py-10 text-center text-sm text-[#9CA3AF]">Henüz başvuru yok.</div>
        )}
        {registrations.map(reg => (
          <RegRow key={reg.id} reg={reg as Reg} />
        ))}
      </div>
    </Card>
  );
}

/* ── Ana bileşen ──────────────────────────────────────────── */
export default function ManageClient({
  tournamentId,
  matches,
  registrations,
  groups,
}: {
  tournamentId: string;
  matches: Matches;
  registrations: Registrations;
  groups: Groups;
}) {
  const [tab, setTab] = useState<Tab>("matches");
  const [scoreMatch, setScoreMatch] = useState<TMatch | null>(null);
  const [matchWeeks, setMatchWeeks] = useState<MatchWeek[]>([]);

  const pendingCount = registrations.filter(r => r.status === "PENDING").length;
  const playedCount = matches.filter(m => m.homeScore !== null).length;

  return (
    <PageContent>
      <PageHeader
        title="Yönetim"
        subtitle={`${matches.length} maç · ${playedCount} oynandı · ${registrations.length} başvuru`}
      />

      {/* Tab bar */}
      <div className="flex gap-1 bg-[#F4F6F9] p-1 rounded-xl overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all relative ${
              tab === t.id
                ? "bg-white text-[#0F1F47] shadow-sm"
                : "text-[#6B7280] hover:text-[#111827] hover:bg-white/60"
            }`}
          >
            {t.icon}
            {t.label}
            {t.id === "registrations" && pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab içerikleri */}
      {tab === "matches" && (
        <MatchesTab matches={matches} onScore={setScoreMatch} />
      )}
      {tab === "registrations" && (
        <RegistrationsTab registrations={registrations} />
      )}
      {tab === "groups" && (
        <GroupsTab groups={groups} registrations={registrations} tournamentId={tournamentId} />
      )}
      {tab === "schedule" && (
        <ScheduleTab weeks={matchWeeks} onChange={setMatchWeeks} />
      )}
      {tab === "fixture" && (
        <FixtureTab groups={groups} matchWeeks={matchWeeks} tournamentId={tournamentId} />
      )}

      {scoreMatch && <MatchModal match={scoreMatch} onClose={() => setScoreMatch(null)} />}
    </PageContent>
  );
}
