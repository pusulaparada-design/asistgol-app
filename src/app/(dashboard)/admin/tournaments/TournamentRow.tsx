"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, Pencil, X } from "lucide-react";
import { StatusBadge, ProgressBar } from "@/components/ui/PageShell";
import { getAllTournaments, updateTournamentName } from "@/lib/actions/admin";

type Tournament = Awaited<ReturnType<typeof getAllTournaments>>[number];

const formatLabel: Record<string, string> = {
  GROUP_KNOCKOUT: "Grup + Eleme",
  GROUP_ONLY: "Sadece Lig",
  KNOCKOUT_ONLY: "Sadece Eleme",
};

const statusMap: Record<string, { label: string; variant: "green" | "blue" | "gray" | "orange" }> = {
  ACTIVE: { label: "Aktif", variant: "green" },
  REGISTRATION: { label: "Kayıt Açık", variant: "blue" },
  COMPLETED: { label: "Tamamlandı", variant: "gray" },
  DRAFT: { label: "Taslak", variant: "orange" },
};

function fmt(d: Date | null) {
  if (!d) return "—";
  return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function RenameModal({ t, onClose }: { t: Tournament; onClose: () => void }) {
  const [name, setName] = useState(t.name);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    start(async () => {
      const result = await updateTournamentName(t.id, name);
      if (result.ok) onClose();
      else setMsg(result.error);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={(e) => { e.stopPropagation(); onClose(); }}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-sm font-semibold text-[#111827]">Turnuva İsmini Değiştir</h3>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#111827]"><X size={18} /></button>
        </div>
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1.5">Turnuva İsmi</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]"
            />
          </div>

          {msg && (
            <p className="text-xs rounded-lg px-3 py-2 border text-[#EF4444] bg-[#FEF2F2] border-[#FECACA]">{msg}</p>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="text-sm font-medium px-4 py-2 rounded-lg border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]">
              İptal
            </button>
            <button type="submit" disabled={pending} className="bg-[#0F1F47] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#1A2F5A] transition-colors disabled:opacity-60">
              {pending ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TournamentRow({ t }: { t: Tournament }) {
  const router = useRouter();
  const [renaming, setRenaming] = useState(false);
  const s = statusMap[t.status] ?? { label: t.status, variant: "gray" as const };

  return (
    <tr
      onClick={() => router.push(`/admin/tournaments/${t.id}`)}
      className="hover:bg-[#FAFAFA] transition-colors cursor-pointer"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-[#111827]">{t.name}</span>
          <button
            onClick={(e) => { e.stopPropagation(); setRenaming(true); }}
            title="İsmi değiştir"
            className="p-1 rounded-md text-[#9CA3AF] hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors"
          >
            <Pencil size={13} />
          </button>
        </div>
        <div className="flex items-center gap-1 text-xs text-[#9CA3AF] mt-0.5">
          <MapPin size={11} /> {t.city}
        </div>
        {renaming && <RenameModal t={t} onClose={() => setRenaming(false)} />}
      </td>
      <td className="px-4 py-3 text-sm text-[#6B7280]">{t.organizer.name}</td>
      <td className="px-4 py-3 text-xs text-[#6B7280]">{formatLabel[t.format] ?? t.format}</td>
      <td className="px-4 py-3 min-w-[140px]">
        <div className="text-xs text-[#374151] mb-1 font-medium">
          {t._count.registrations}/{t.maxTeams} takım
        </div>
        <ProgressBar value={t._count.registrations} max={t.maxTeams} color={t._count.registrations >= t.maxTeams ? "gold" : "blue"} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 text-xs text-[#9CA3AF]">
          <Calendar size={11} /> {fmt(t.startDate)}
        </div>
        <div className="text-xs text-[#9CA3AF] mt-0.5 pl-3.5">— {fmt(t.endDate)}</div>
      </td>
      <td className="px-4 py-3">
        <StatusBadge label={s.label} variant={s.variant} />
      </td>
    </tr>
  );
}
