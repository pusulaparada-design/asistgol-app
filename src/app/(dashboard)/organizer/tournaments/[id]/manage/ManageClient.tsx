"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle, XCircle, Trophy,
  Calendar, Users, Phone, CreditCard, User,
  LayoutGrid, CalendarDays, Zap, Info,
} from "lucide-react";
import { PageContent, PageHeader, Card, StatusBadge } from "@/components/ui/PageShell";
import {
  approveRegistration,
  rejectRegistration,
  togglePayment,
  getTournamentMatches,
  getTournamentRegistrations,
  getGroupsWithTeams,
  getTournament,
  updateTournamentDetails,
} from "@/lib/actions/tournament";
import MatchModal, { type SaveResult } from "../MatchModal";
import GroupsTab from "./GroupsTab";
import ScheduleTab, { type MatchWeek } from "./ScheduleTab";
import FixtureTab from "./FixtureTab";

type Matches = Awaited<ReturnType<typeof getTournamentMatches>>;
type TMatch = Matches[number];
type Registrations = Awaited<ReturnType<typeof getTournamentRegistrations>>;
type Reg = Registrations[number] & { paid: boolean };
type Groups = Awaited<ReturnType<typeof getGroupsWithTeams>>;

type Tab = "matches" | "registrations" | "groups" | "schedule" | "fixture" | "info";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "matches",       label: "Maçlar",          icon: <Trophy size={14} /> },
  { id: "registrations", label: "Başvurular",       icon: <Users size={14} /> },
  { id: "groups",        label: "Gruplar",          icon: <LayoutGrid size={14} /> },
  { id: "schedule",      label: "Maç Günleri",      icon: <CalendarDays size={14} /> },
  { id: "fixture",       label: "Fikstür",           icon: <Zap size={14} /> },
  { id: "info",          label: "Turnuva Bilgileri", icon: <Info size={14} /> },
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
        {reg.note && (
          <div className="ml-9 mt-1 text-[10px] text-[#6B7280] italic truncate max-w-[260px]">Not: {reg.note}</div>
        )}
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
  const sorted = [...matches].sort((a, b) => {
    const da = a.date ? a.date.getTime() : 0;
    const db = b.date ? b.date.getTime() : 0;
    if (da !== db) return da - db;
    return (a.time ?? "").localeCompare(b.time ?? "");
  });

  return (
    <Card>
      <div className="overflow-x-auto">
      <div className="min-w-[560px]">
      <div className="grid grid-cols-[12px_80px_1fr_96px_1fr_80px] items-center gap-2 px-4 py-2 bg-[#F8FAFC] border-b border-[#E5E7EB]">
        <span />
        <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Tarih</span>
        <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider text-right">Ev Sahibi</span>
        <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider text-center">Skor</span>
        <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Deplasman</span>
        <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider text-center">Tur</span>
      </div>
      <div className="divide-y divide-[#F3F4F6]">
        {sorted.length === 0 && (
          <div className="py-10 text-center text-sm text-[#9CA3AF]">Henüz maç oluşturulmadı.</div>
        )}
        {sorted.map(m => {
          const isPlayed = m.status === "PLAYED";
          const isLive   = m.status === "LIVE";
          return (
            <div
              key={m.id}
              onClick={() => onScore(m)}
              className="grid grid-cols-[12px_80px_1fr_96px_1fr_80px] items-center gap-2 px-4 py-3 hover:bg-[#F4F6F9] cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-center">
                {isLive ? (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10B981]" />
                  </span>
                ) : isPlayed ? (
                  <span className="inline-flex rounded-full h-2.5 w-2.5 bg-[#D1D5DB]" />
                ) : null}
              </div>
              <div className="text-xs text-[#9CA3AF]">
                <div className="flex items-center gap-1"><Calendar size={10} />{fmt(m.date)}</div>
                {m.time && <div className="ml-3.5 text-[10px]">{m.time}</div>}
              </div>
              <div className="text-sm font-semibold text-[#111827] text-right truncate">{m.homeTeam.name}</div>
              <div className="text-center">
                {isPlayed
                  ? <span className="font-mono font-extrabold text-sm text-[#111827]">{m.homeScore} – {m.awayScore}</span>
                  : isLive
                    ? <span className="font-mono font-extrabold text-sm text-[#F59E0B]">{m.homeScore ?? 0} – {m.awayScore ?? 0}</span>
                    : <span className="text-xs text-[#D1D5DB]">vs</span>
                }
              </div>
              <div className="text-sm font-semibold text-[#111827] truncate">{m.awayTeam.name}</div>
              <div className="text-center">
                <span className="text-[10px] bg-[#F4F6F9] text-[#6B7280] px-2 py-0.5 rounded-md font-medium">{matchLabel(m)}</span>
              </div>
            </div>
          );
        })}
      </div>
      </div>
      </div>
    </Card>
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

type Tournament = NonNullable<Awaited<ReturnType<typeof getTournament>>>;

const inputCls = "w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]";

function toDateInput(d: Date | null | undefined) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}
function toDisplay(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const pickerRef = useRef<HTMLInputElement>(null);
  const display = toDisplay(value);
  const handlePicker = (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value);
  const handleText = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
    if (v.length > 5) v = v.slice(0, 5) + "/" + v.slice(5, 9);
    if (v.length === 10) { const [d, m, y] = v.split("/"); onChange(`${y}-${m}-${d}`); }
    else if (v.length === 0) onChange("");
  };
  return (
    <div>
      <label className="block text-xs font-medium text-[#374151] mb-1.5">{label}</label>
      <div className="relative">
        <input type="text" defaultValue={display} onChange={handleText} maxLength={10} placeholder="GG/AA/YYYY"
          className={inputCls + " pr-9"} />
        <button type="button" onClick={() => pickerRef.current?.showPicker()}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151]">
          <Calendar size={14} />
        </button>
        <input ref={pickerRef} type="date" value={value} onChange={handlePicker}
          className="absolute inset-0 opacity-0 pointer-events-none" />
      </div>
    </div>
  );
}

function TournamentInfoTab({ tournament, tournamentId }: { tournament: Tournament; tournamentId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [name, setName] = useState(tournament.name);
  const [description, setDescription] = useState(tournament.description ?? "");
  const [venue, setVenue] = useState(tournament.venue ?? "");
  const [startDate, setStartDate] = useState(toDateInput(tournament.startDate));
  const [endDate, setEndDate] = useState(toDateInput(tournament.endDate));
  const [fee, setFee] = useState(tournament.fee?.toString() ?? "");
  const [prize, setPrize] = useState(tournament.prize ?? "");

  const isLocked = tournament.status === "ACTIVE" || tournament.status === "COMPLETED";

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    startTransition(async () => {
      const result = await updateTournamentDetails(tournamentId, { name, description, venue, startDate, endDate, fee, prize });
      setMsg(result.ok
        ? { ok: true, text: "Turnuva bilgileri güncellendi." }
        : { ok: false, text: (result as { ok: false; error: string }).error });
      if (result.ok) router.refresh();
    });
  }

  return (
    <Card>
      {isLocked && (
        <div className="px-5 py-3 bg-[#FEF3C7] border-b border-[#FCD34D] text-xs text-[#92400E] flex items-center gap-2">
          <Info size={13} className="shrink-0" />
          Turnuva başladığı için bilgiler düzenlenemez.
        </div>
      )}
      <form onSubmit={handleSave} className="p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#374151] mb-1.5">Turnuva Adı *</label>
          <input value={name} onChange={e => setName(e.target.value)} disabled={isLocked}
            className={inputCls + (isLocked ? " bg-[#F9FAFB] text-[#9CA3AF]" : "")} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#374151] mb-1.5">Kurallar / Açıklama</label>
          <textarea rows={5} value={description} onChange={e => setDescription(e.target.value)} disabled={isLocked}
            className={inputCls + " resize-none" + (isLocked ? " bg-[#F9FAFB] text-[#9CA3AF]" : "")}
            placeholder="Turnuva kuralları, katılım koşulları..." />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1.5">Saha Adı</label>
            <input value={venue} onChange={e => setVenue(e.target.value)} disabled={isLocked}
              className={inputCls + (isLocked ? " bg-[#F9FAFB] text-[#9CA3AF]" : "")} placeholder="Yıldız Halı Saha" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1.5">Kayıt Ücreti (₺)</label>
            <input type="number" value={fee} onChange={e => setFee(e.target.value)} disabled={isLocked}
              className={inputCls + (isLocked ? " bg-[#F9FAFB] text-[#9CA3AF]" : "")} placeholder="0" />
          </div>
          <DateField label="Başlangıç Tarihi" value={startDate} onChange={setStartDate} />
          <DateField label="Bitiş Tarihi" value={endDate} onChange={setEndDate} />
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-[#374151] mb-1.5">Ödül / Kupa Bilgisi</label>
            <input value={prize} onChange={e => setPrize(e.target.value)} disabled={isLocked}
              className={inputCls + (isLocked ? " bg-[#F9FAFB] text-[#9CA3AF]" : "")} placeholder="₺5.000 veya Kupa" />
          </div>
        </div>

        {msg && (
          <p className={`text-xs rounded-lg px-3 py-2 border flex items-center gap-2 ${msg.ok ? "text-[#059669] bg-[#ECFDF5] border-[#A7F3D0]" : "text-[#EF4444] bg-[#FEF2F2] border-[#FECACA]"}`}>
            {msg.ok ? <CheckCircle size={13} /> : <XCircle size={13} />}
            {msg.text}
          </p>
        )}

        {!isLocked && (
          <button type="submit" disabled={isPending}
            className="bg-[#0F1F47] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#1A2F5A] transition-colors disabled:opacity-60">
            {isPending ? "Kaydediliyor..." : "Kaydet"}
          </button>
        )}
      </form>
    </Card>
  );
}

/* ── Ana bileşen ──────────────────────────────────────────── */
export default function ManageClient({
  tournamentId,
  matches,
  registrations,
  groups,
  tournament,
}: {
  tournamentId: string;
  matches: Matches;
  registrations: Registrations;
  groups: Groups;
  tournament: Tournament;
}) {
  const [tab, setTab] = useState<Tab>("matches");
  const [localMatches, setLocalMatches] = useState(matches);
  const [scoreMatch, setScoreMatch] = useState<TMatch | null>(null);
  const [matchWeeks, setMatchWeeks] = useState<MatchWeek[]>([]);
  const router = useRouter();

  useEffect(() => { setLocalMatches(matches); }, [matches]);

  function handleSaved(result: SaveResult) {
    setLocalMatches(prev => prev.map(m =>
      m.id === result.matchId
        ? { ...m, status: result.status, homeScore: result.homeScore, awayScore: result.awayScore }
        : m
    ));
    setScoreMatch(null);
  }

  const pendingCount = registrations.filter(r => r.status === "PENDING").length;
  const playedCount = localMatches.filter(m => m.homeScore !== null).length;
  const isCompleted = tournament.status === "COMPLETED";

  return (
    <PageContent>
      <PageHeader
        title="Yönetim"
        subtitle={`${localMatches.length} maç · ${playedCount} oynandı · ${registrations.length} başvuru`}
        actions={isCompleted ? (
          <span className="flex items-center gap-2 px-4 py-2 bg-[#F4F6F9] text-[#6B7280] text-sm font-semibold rounded-lg">
            <CheckCircle size={15} />
            Tamamlandı
          </span>
        ) : undefined}
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
        <MatchesTab matches={localMatches} onScore={setScoreMatch} />
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
        <FixtureTab
          groups={groups}
          matchWeeks={matchWeeks}
          tournamentId={tournamentId}
          matches={localMatches}
          advanceCount={tournament.advanceCount ?? 0}
          winPoints={tournament.winPoints}
        />
      )}
      {tab === "info" && (
        <TournamentInfoTab tournament={tournament} tournamentId={tournamentId} />
      )}

      {scoreMatch && <MatchModal match={scoreMatch} onClose={() => setScoreMatch(null)} onSaved={handleSaved} />}
    </PageContent>
  );
}
