"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Users, CheckCircle, XCircle, Search, ChevronDown, ChevronUp,
  Shirt, Phone, User,
} from "lucide-react";
import { PageContent, PageHeader, Card, StatusBadge } from "@/components/ui/PageShell";
import { approveRegistration, rejectRegistration } from "@/lib/actions/tournament";
import type { getTournamentRegistrations } from "@/lib/actions/tournament";

type Registrations = Awaited<ReturnType<typeof getTournamentRegistrations>>;
type Reg = Registrations[number];

type Tab = "all" | "pending" | "approved" | "rejected";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Onay Bekliyor",
  APPROVED: "Onaylı",
  REJECTED: "Reddedildi",
};
const STATUS_VARIANT: Record<string, "green" | "orange" | "gray"> = {
  PENDING: "orange",
  APPROVED: "green",
  REJECTED: "gray",
};
const POSITION_LABEL: Record<string, string> = {
  GK: "Kaleci", DEF: "Defans", MID: "Orta Saha", FWD: "Forvet",
};

function PlayerStatus({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    ACTIVE:    { label: "Aktif",    cls: "bg-[#ECFDF5] text-[#059669]" },
    SUSPENDED: { label: "Cezalı",  cls: "bg-[#FEF3C7] text-[#D97706]" },
    INJURED:   { label: "Sakatık", cls: "bg-[#FEF2F2] text-[#DC2626]" },
  };
  const s = map[status] ?? map.ACTIVE;
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${s.cls}`}>
      {s.label}
    </span>
  );
}

function TeamRow({
  reg,
  expanded,
  onToggle,
}: {
  reg: Reg;
  expanded: boolean;
  onToggle: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const isPending = reg.status === "PENDING";

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
    <>
      {/* Ana satır */}
      <div
        className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer select-none transition-colors
          ${expanded ? "bg-[#FAFAFA]" : "hover:bg-[#FAFAFA]"}
          ${reg.status === "PENDING" ? "border-l-2 border-[#F59E0B]" : "border-l-2 border-transparent"}`}
        onClick={onToggle}
      >
        {/* İkon */}
        <div className="w-9 h-9 bg-[#EFF6FF] rounded-xl flex items-center justify-center shrink-0">
          <Users size={15} className="text-[#3B82F6]" />
        </div>

        {/* İsim + kaptan */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-[#111827]">{reg.team.name}</div>
          <div className="flex items-center gap-2 text-xs text-[#9CA3AF] mt-0.5">
            <User size={10} />
            <span>{reg.team.captain?.name ?? "—"}</span>
            {reg.team.captain?.phone && (
              <>
                <Phone size={10} className="ml-1" />
                <span className="font-mono">{reg.team.captain.phone}</span>
              </>
            )}
          </div>
        </div>

        {/* Oyuncu sayısı */}
        <div className="text-center hidden sm:block shrink-0">
          <div className="text-sm font-bold text-[#111827]">{reg.team.players.length}</div>
          <div className="text-[10px] text-[#9CA3AF]">Oyuncu</div>
        </div>

        {/* Grup */}
        <div className="text-center hidden md:block shrink-0 w-16">
          <div className="text-xs text-[#6B7280]">{reg.groupTeam?.group.name ?? "—"}</div>
          <div className="text-[10px] text-[#9CA3AF]">Grup</div>
        </div>

        {/* Durum */}
        <StatusBadge
          label={STATUS_LABEL[reg.status] ?? reg.status}
          variant={STATUS_VARIANT[reg.status] ?? "gray"}
          dot={false}
        />

        {/* Onayla / Reddet */}
        {isPending && (
          <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleApprove}
              disabled={pending}
              title="Onayla"
              className="p-1.5 rounded-lg bg-[#ECFDF5] text-[#059669] hover:bg-[#D1FAE5] disabled:opacity-40 transition-colors"
            >
              <CheckCircle size={16} />
            </button>
            <button
              onClick={handleReject}
              disabled={pending}
              title="Reddet"
              className="p-1.5 rounded-lg bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2] disabled:opacity-40 transition-colors"
            >
              <XCircle size={16} />
            </button>
          </div>
        )}

        {/* Expand toggle */}
        <div className="shrink-0 text-[#9CA3AF]">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Oyuncu listesi (expanded) */}
      {expanded && (
        <div className="bg-[#F8FAFC] border-t border-[#F3F4F6] px-4 py-3">
          {reg.team.players.length === 0 ? (
            <p className="text-xs text-[#9CA3AF] py-2">Bu takımın oyuncusu bulunmuyor.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {reg.team.players.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2.5 bg-white rounded-lg px-3 py-2 border border-[#E5E7EB]"
                >
                  <div className="w-7 h-7 bg-[#0F1F47] rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-white text-[10px] font-bold">
                      {p.number ?? <Shirt size={11} />}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-[#111827] truncate">{p.name}</div>
                    <div className="text-[10px] text-[#9CA3AF]">
                      {POSITION_LABEL[p.position ?? ""] ?? p.position ?? "—"}
                    </div>
                  </div>
                  <PlayerStatus status={p.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default function TeamsClient({
  tournamentId,
  registrations,
}: {
  tournamentId: string;
  registrations: Registrations;
}) {
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const pending  = registrations.filter(r => r.status === "PENDING");
  const approved = registrations.filter(r => r.status === "APPROVED");
  const rejected = registrations.filter(r => r.status === "REJECTED");

  const filtered = registrations
    .filter(r => {
      if (tab === "pending")  return r.status === "PENDING";
      if (tab === "approved") return r.status === "APPROVED";
      if (tab === "rejected") return r.status === "REJECTED";
      return true;
    })
    .filter(r =>
      !search ||
      r.team.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.team.captain?.name ?? "").toLowerCase().includes(search.toLowerCase())
    );

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "all",      label: "Tümü",           count: registrations.length },
    { key: "pending",  label: "Onay Bekliyor",  count: pending.length },
    { key: "approved", label: "Onaylı",         count: approved.length },
    { key: "rejected", label: "Reddedildi",     count: rejected.length },
  ];

  return (
    <PageContent>
      <PageHeader
        title="Takım Başvuruları"
        subtitle={`${approved.length} onaylı · ${pending.length} bekliyor`}
      />

      {/* Tab bar */}
      <div className="flex gap-1 bg-white border border-[#E5E7EB] rounded-xl p-1 w-fit flex-wrap">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
              tab === t.key ? "bg-[#0F1F47] text-white" : "text-[#6B7280] hover:bg-[#F4F6F9]"
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                tab === t.key
                  ? "bg-white/20 text-white"
                  : t.key === "pending"
                  ? "bg-[#EF4444] text-white"
                  : "bg-[#E5E7EB] text-[#6B7280]"
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <Card>
        {/* Arama */}
        <div className="p-4 border-b border-[#E5E7EB]">
          <div className="relative max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Takım veya kaptan ara..."
              className="w-full pl-8 pr-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]"
            />
          </div>
        </div>

        {/* Başlık */}
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 px-4 py-2 bg-[#F8FAFC] border-b border-[#E5E7EB]">
          <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Takım / Kaptan</span>
          <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider hidden sm:block">Oyuncu</span>
          <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider hidden md:block w-16 text-center">Grup</span>
          <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Durum</span>
          <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">İşlem</span>
        </div>

        {/* Satırlar */}
        <div className="divide-y divide-[#F3F4F6]">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#9CA3AF]">Kayıt bulunamadı.</div>
          ) : (
            filtered.map(reg => (
              <TeamRow
                key={reg.id}
                reg={reg}
                expanded={expandedId === reg.id}
                onToggle={() => setExpandedId(prev => prev === reg.id ? null : reg.id)}
              />
            ))
          )}
        </div>
      </Card>
    </PageContent>
  );
}
