"use client";

import { useState } from "react";
import { Users, ChevronDown, ChevronUp, Shirt } from "lucide-react";
import { PageContent, PageHeader, Card } from "@/components/ui/PageShell";
import type { getAllTeams } from "@/lib/actions/admin";

type Teams = Awaited<ReturnType<typeof getAllTeams>>;
type Team = Teams[number];

const POSITION_LABEL: Record<string, string> = {
  Kaleci: "Kaleci", Defans: "Defans", "Orta Saha": "Orta Saha", Forvet: "Forvet",
  GK: "Kaleci", DEF: "Defans", MID: "Orta Saha", FWD: "Forvet",
};

const STATUS_CLS: Record<string, string> = {
  ACTIVE:    "bg-[#ECFDF5] text-[#059669]",
  SUSPENDED: "bg-[#FEF3C7] text-[#D97706]",
  INJURED:   "bg-[#FEF2F2] text-[#DC2626]",
};
const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Aktif", SUSPENDED: "Cezalı", INJURED: "Sakatık",
};

function TeamRow({ team }: { team: Team }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <tr
        className="hover:bg-[#FAFAFA] transition-colors cursor-pointer select-none"
        onClick={() => setOpen((o) => !o)}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#EFF6FF] rounded-lg flex items-center justify-center shrink-0">
              <Users size={13} className="text-[#3B82F6]" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#111827]">{team.name}</div>
              <div className="text-xs text-[#9CA3AF]">Kpt: {team.captain.name}</div>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-[#6B7280]">{team.city ?? "—"}</td>
        <td className="px-4 py-3 text-sm text-[#374151]">{team.players.length}</td>
        <td className="px-4 py-3 text-sm text-[#374151]">{team._count.registrations}</td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669]">Aktif</span>
            <span className="text-[#9CA3AF] ml-3">{open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</span>
          </div>
        </td>
      </tr>

      {open && (
        <tr>
          <td colSpan={5} className="bg-[#F8FAFC] px-4 py-3 border-b border-[#E5E7EB]">
            {team.players.length === 0 ? (
              <p className="text-xs text-[#9CA3AF]">Bu takımda oyuncu yok.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                {team.players.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-[#E5E7EB]"
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
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${STATUS_CLS[p.status] ?? STATUS_CLS.ACTIVE}`}>
                      {STATUS_LABEL[p.status] ?? "Aktif"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminTeamsClient({ teams }: { teams: Teams }) {
  const [search, setSearch] = useState("");

  const filtered = teams.filter(
    (t) =>
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.captain.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <PageContent>
      <PageHeader title="Tüm Takımlar" subtitle={`${teams.length} takım kayıtlı`} />

      <Card>
        <div className="p-4 border-b border-[#E5E7EB]">
          <div className="relative max-w-xs">
            <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Takım veya kaptan ara..."
              className="w-full pl-8 pr-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
              {["Takım / Kaptan", "Şehir", "Oyuncu", "Turnuva", "Durum"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F4F6]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-sm text-[#9CA3AF]">
                  Takım bulunamadı.
                </td>
              </tr>
            ) : (
              filtered.map((t) => <TeamRow key={t.id} team={t} />)
            )}
          </tbody>
        </table>
        </div>
      </Card>
    </PageContent>
  );
}
