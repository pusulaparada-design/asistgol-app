"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Users, Shuffle } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/PageShell";
import { redistributeGroups, moveTeamToGroup } from "@/lib/actions/tournament";
import type { getGroupsWithTeams, getTournamentRegistrations } from "@/lib/actions/tournament";

type Groups = Awaited<ReturnType<typeof getGroupsWithTeams>>;
type Registrations = Awaited<ReturnType<typeof getTournamentRegistrations>>;

export default function GroupsTab({
  groups,
  registrations,
  tournamentId,
}: {
  groups: Groups;
  registrations: Registrations;
  tournamentId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const approvedRegs = registrations.filter(r => r.status === "APPROVED");
  const ungrouped = approvedRegs.filter(r => !r.groupTeam);

  function handleRedistribute() {
    startTransition(async () => {
      await redistributeGroups(tournamentId);
      router.refresh();
    });
  }

  function handleMove(registrationId: string, newGroupId: string) {
    startTransition(async () => {
      await moveTeamToGroup(registrationId, newGroupId);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#6B7280]">
          {approvedRegs.length} onaylı takım · {groups.length} grup
          {ungrouped.length > 0 && (
            <span className="ml-2 text-[#EF4444] font-medium">({ungrouped.length} takım gruba atanmadı)</span>
          )}
        </p>
        <button
          onClick={handleRedistribute}
          disabled={isPending || approvedRegs.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-[#0F1F47] text-white text-sm font-semibold rounded-lg hover:bg-[#1A2F5A] disabled:opacity-40 transition-colors"
        >
          <Shuffle size={14} />
          Otomatik Dağıt
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map(group => (
          <Card key={group.id}>
            <CardHeader
              title={group.name}
              subtitle={`${group.teams.length} takım`}
            />
            <div className="divide-y divide-[#F3F4F6]">
              {group.teams.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-[#9CA3AF]">Takım yok</div>
              )}
              {group.teams.map(gt => {
                const reg = registrations.find(r => r.teamId === gt.teamId);
                const otherGroups = groups.filter(g => g.id !== group.id);
                return (
                  <div key={gt.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 bg-[#EFF6FF] rounded-lg flex items-center justify-center shrink-0">
                      <Users size={13} className="text-[#3B82F6]" />
                    </div>
                    <span className="flex-1 text-sm font-medium text-[#111827]">{gt.team.name}</span>
                    {reg && otherGroups.length > 0 && (
                      <select
                        disabled={isPending}
                        defaultValue=""
                        onChange={e => e.target.value && handleMove(reg.id, e.target.value)}
                        className="text-xs border border-[#E5E7EB] rounded-lg px-2 py-1.5 bg-white text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#F59E0B] disabled:opacity-50"
                      >
                        <option value="">Taşı →</option>
                        {otherGroups.map(g => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      {ungrouped.length > 0 && (
        <Card>
          <CardHeader title="Gruba Atanmamış" subtitle={`${ungrouped.length} takım`} />
          <div className="divide-y divide-[#F3F4F6]">
            {ungrouped.map(reg => (
              <div key={reg.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 bg-[#FEF3C7] rounded-lg flex items-center justify-center shrink-0">
                  <Users size={13} className="text-[#D97706]" />
                </div>
                <span className="flex-1 text-sm font-medium text-[#111827]">{reg.team.name}</span>
                {groups.length > 0 && (
                  <select
                    disabled={isPending}
                    defaultValue=""
                    onChange={e => e.target.value && handleMove(reg.id, e.target.value)}
                    className="text-xs border border-[#E5E7EB] rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#F59E0B]"
                  >
                    <option value="">Gruba Ekle</option>
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
