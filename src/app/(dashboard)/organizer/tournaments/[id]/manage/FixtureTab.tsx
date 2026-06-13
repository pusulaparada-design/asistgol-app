"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Play, Save, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/PageShell";
import { saveGeneratedFixtures } from "@/lib/actions/tournament";
import type { getGroupsWithTeams } from "@/lib/actions/tournament";
import type { MatchWeek } from "./ScheduleTab";

type Groups = Awaited<ReturnType<typeof getGroupsWithTeams>>;

interface GeneratedMatch {
  homeTeamId: string;
  homeTeamName: string;
  awayTeamId: string;
  awayTeamName: string;
  groupId: string;
  groupName: string;
  round: string;
  date: string | null;
  time: string | null;
}

function bergerRounds(teams: { id: string; name: string }[]): [string, string, string, string][][] {
  const n = teams.length;
  if (n < 2) return [];
  const t = n % 2 === 0 ? [...teams] : [...teams, { id: "__BYE__", name: "BYE" }];
  const m = t.length;
  const rest = t.slice(1);
  const rounds: [string, string, string, string][][] = [];

  for (let r = 0; r < m - 1; r++) {
    const rotated = r === 0 ? [...rest] : [...rest.slice(-r), ...rest.slice(0, rest.length - r)];
    const slot = [t[0], ...rotated];
    const round: [string, string, string, string][] = [];
    for (let i = 0; i < m / 2; i++) {
      const home = slot[i];
      const away = slot[m - 1 - i];
      if (home.id !== "__BYE__" && away.id !== "__BYE__") {
        round.push([home.id, home.name, away.id, away.name]);
      }
    }
    rounds.push(round);
  }
  return rounds;
}

function buildFixtures(groups: Groups): GeneratedMatch[] {
  const groupRounds: GeneratedMatch[][][] = groups.map(group => {
    const teams = group.teams.map(gt => ({ id: gt.team.id, name: gt.team.name }));
    return bergerRounds(teams).map((round, ri) =>
      round.map(([hId, hName, aId, aName]) => ({
        homeTeamId: hId,
        homeTeamName: hName,
        awayTeamId: aId,
        awayTeamName: aName,
        groupId: group.id,
        groupName: group.name,
        round: `Hafta ${ri + 1}`,
        date: null,
        time: null,
      }))
    );
  });

  const maxRounds = Math.max(...groupRounds.map(g => g.length), 0);
  const all: GeneratedMatch[] = [];
  for (let r = 0; r < maxRounds; r++) {
    for (const gRounds of groupRounds) {
      if (gRounds[r]) all.push(...gRounds[r]);
    }
  }
  return all;
}

// Her hafta için sıralı slot listesi döner
function buildWeekSlots(weeks: MatchWeek[]): { date: string; time: string }[][] {
  return weeks.map(week => {
    const slots: { date: string; time: string }[] = [];
    for (const day of [...week.days].sort((a, b) => a.date.localeCompare(b.date))) {
      for (const t of [...day.times].sort()) {
        slots.push({ date: day.date, time: t });
      }
    }
    return slots;
  });
}

function fmtDate(date: string) {
  return new Date(date + "T12:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

export default function FixtureTab({
  groups,
  matchWeeks,
  tournamentId,
}: {
  groups: Groups;
  matchWeeks: MatchWeek[];
  tournamentId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<GeneratedMatch[] | null>(null);
  const [saved, setSaved] = useState(false);

  const totalSlots = matchWeeks.reduce((s, w) => s + w.days.reduce((ds, d) => ds + d.times.length, 0), 0);
  const hasGroups = groups.some(g => g.teams.length >= 2);

  function handleGenerate() {
    const fixtures = buildFixtures(groups);
    const weekSlots = buildWeekSlots(matchWeeks);

    // Tüm benzersiz round isimlerini sırayla bul (Hafta 1, Hafta 2, ...)
    const rounds = [...new Set(fixtures.map(f => f.round))];

    // Her round'un maçlarını karşılık gelen haftanın slotlarına ata
    const assigned = fixtures.map(f => ({ ...f }));
    rounds.forEach((round, ri) => {
      const slots = weekSlots[ri] ?? [];
      let slotIdx = 0;
      for (const f of assigned) {
        if (f.round === round) {
          f.date = slots[slotIdx]?.date ?? null;
          f.time = slots[slotIdx]?.time ?? null;
          slotIdx++;
        }
      }
    });

    setPreview(assigned);
    setSaved(false);
  }

  function handleSave() {
    if (!preview) return;
    startTransition(async () => {
      await saveGeneratedFixtures(
        tournamentId,
        preview.map(f => ({
          homeTeamId: f.homeTeamId,
          awayTeamId: f.awayTeamId,
          groupId: f.groupId,
          round: f.round,
          date: f.date,
          time: f.time,
        }))
      );
      setSaved(true);
      router.refresh();
    });
  }

  const unassigned = preview?.filter(f => !f.date).length ?? 0;

  return (
    <div className="space-y-4">
      {/* Özet kartlar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {groups.map(g => (
          <div key={g.id} className="bg-white rounded-xl border border-[#E5E7EB] px-4 py-3">
            <div className="text-xs text-[#9CA3AF] mb-1">{g.name}</div>
            <div className="text-lg font-bold text-[#111827]">{g.teams.length} takım</div>
            {g.teams.length >= 2 && (
              <div className="text-[10px] text-[#6B7280] mt-0.5">
                {g.teams.length - 1} tur · {(g.teams.length * (g.teams.length - 1)) / 2} maç
              </div>
            )}
          </div>
        ))}
        <div className="bg-white rounded-xl border border-[#E5E7EB] px-4 py-3">
          <div className="text-xs text-[#9CA3AF] mb-1">Maç Slotu</div>
          <div className="text-lg font-bold text-[#111827]">{totalSlots}</div>
          <div className="text-[10px] text-[#6B7280] mt-0.5">{matchWeeks.length} hafta</div>
        </div>
      </div>

      {!hasGroups && (
        <div className="flex items-center gap-2.5 p-4 bg-[#FEF3C7] border border-[#FCD34D] rounded-xl text-sm text-[#92400E]">
          <AlertTriangle size={16} className="shrink-0" />
          Fikstür oluşturmak için önce gruplara en az 2 takım atayın.
        </div>
      )}

      {/* Aksiyon butonları */}
      <div className="flex flex-wrap gap-3 items-center">
        <button
          onClick={handleGenerate}
          disabled={!hasGroups}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0F1F47] text-white text-sm font-semibold rounded-lg hover:bg-[#1A2F5A] disabled:opacity-40 transition-colors"
        >
          <Play size={14} />
          Fikstür Oluştur
        </button>

        {preview && !saved && (
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#059669] text-white text-sm font-semibold rounded-lg hover:bg-[#047857] disabled:opacity-50 transition-colors"
          >
            <Save size={14} />
            {isPending ? "Kaydediliyor..." : `${preview.length} Maçı Kaydet`}
          </button>
        )}

        {saved && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-[#059669]">
            <CheckCircle size={16} /> Fikstür kaydedildi
          </span>
        )}
      </div>

      {/* Önizleme */}
      {preview && (
        <Card>
          <CardHeader
            title="Fikstür Önizlemesi"
            subtitle={`${preview.length} maç · ${preview.length - unassigned} tarih atandı`}
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                  {["#", "Grup", "Tur", "Ev Sahibi", "", "Deplasman", "Tarih", "Saat"].map((h, i) => (
                    <th key={i} className={`px-3 py-2.5 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider ${
                      i === 3 ? "text-right" : i === 4 ? "text-center" : "text-left"
                    }`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {preview.map((m, i) => (
                  <tr key={i} className="hover:bg-[#FAFAFA]">
                    <td className="px-3 py-2.5 text-xs text-[#9CA3AF]">{i + 1}</td>
                    <td className="px-3 py-2.5">
                      <span className="text-[10px] bg-[#EFF6FF] text-[#2563EB] px-2 py-0.5 rounded-md font-semibold whitespace-nowrap">
                        {m.groupName}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-[#6B7280] whitespace-nowrap">{m.round}</td>
                    <td className="px-3 py-2.5 text-sm font-medium text-[#111827] text-right whitespace-nowrap">{m.homeTeamName}</td>
                    <td className="px-3 py-2.5 text-xs text-[#D1D5DB] text-center font-bold">–</td>
                    <td className="px-3 py-2.5 text-sm font-medium text-[#111827] whitespace-nowrap">{m.awayTeamName}</td>
                    <td className="px-3 py-2.5 text-xs text-[#6B7280] whitespace-nowrap">
                      {m.date ? fmtDate(m.date) : <span className="text-[#D1D5DB]">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-[#6B7280]">
                      {m.time ?? <span className="text-[#D1D5DB]">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {unassigned > 0 && (
            <div className="px-5 py-3 border-t border-[#F3F4F6] flex items-center gap-2 text-xs text-[#D97706]">
              <AlertTriangle size={13} />
              {unassigned} maç için tarih/saat slotu yetmedi. Maç Günleri sekmesinden slot ekleyin.
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
