"use client";
import { useState, useTransition } from "react";
import { Plus, Trash2, Trophy, Users } from "lucide-react";
import { PageContent, PageHeader, Card, CardHeader, StatusBadge } from "@/components/ui/PageShell";
import { addPlayerToTeam, removePlayerFromTeam } from "@/lib/actions/team";
import type { getTeam } from "@/lib/actions/team";

type Team = NonNullable<Awaited<ReturnType<typeof getTeam>>>;
type Player = Team["players"][number];

const STATUS_LABEL: Record<string, { label: string; variant: "green" | "red" | "orange" }> = {
  ACTIVE:    { label: "Aktif",    variant: "green"  },
  SUSPENDED: { label: "Cezalı",  variant: "red"    },
  INJURED:   { label: "Sakatlık",variant: "orange" },
};

function PlayerRow({ player, onRemove, removing }: {
  player: Player;
  onRemove: (id: string) => void;
  removing: boolean;
}) {
  const goals   = player.goals.length;
  const assists = player.assists.length;
  const yellow  = player.cards.filter(c => c.type === "YELLOW").length;
  const red     = player.cards.filter(c => c.type === "RED").length;
  const s = STATUS_LABEL[player.status] ?? STATUS_LABEL.ACTIVE;

  return (
    <tr className={`hover:bg-[#FAFAFA] transition-colors ${player.status === "SUSPENDED" ? "bg-[#FEF2F2]/20" : ""}`}>
      <td className="px-3 py-2.5 text-xs font-mono text-[#9CA3AF] w-10">{player.number ?? "—"}</td>
      <td className="px-3 py-2.5 text-sm font-medium text-[#111827]">{player.name}</td>
      <td className="px-3 py-2.5 text-sm font-semibold text-[#10B981]">{goals}</td>
      <td className="px-3 py-2.5 text-sm font-semibold text-[#3B82F6]">{assists}</td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          {yellow > 0 && <div className="flex items-center gap-0.5"><div className="w-3 h-4 bg-[#F59E0B] rounded-sm" /><span className="text-xs text-[#D97706]">{yellow}</span></div>}
          {red > 0 && <div className="flex items-center gap-0.5"><div className="w-3 h-4 bg-[#EF4444] rounded-sm" /><span className="text-xs text-[#DC2626]">{red}</span></div>}
          {yellow === 0 && red === 0 && <span className="text-xs text-[#D1D5DB]">—</span>}
        </div>
      </td>
      <td className="px-3 py-2.5">
        <StatusBadge label={s.label} variant={s.variant} dot={false} />
      </td>
      <td className="px-3 py-2.5">
        <button
          onClick={() => onRemove(player.id)}
          disabled={removing}
          className="p-1.5 text-[#9CA3AF] hover:text-[#EF4444] transition-colors disabled:opacity-40"
          title="Oyuncuyu çıkar"
        >
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  );
}

export default function TeamDetailClient({ team }: { team: Team }) {
  const [tab, setTab] = useState<"kadro" | "istatistik">("kadro");
  const [players, setPlayers] = useState<Player[]>(team.players);
  const [isPending, startTransition] = useTransition();

  // Oyuncu ekleme formu
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [addError, setAddError] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  const isLocked = team.registrations.length > 0;
  const colors = team.color ? team.color.split(",") : [];
  const activeReg = team.registrations.find(
    r => r.tournament.status === "ACTIVE" || r.tournament.status === "REGISTRATION"
  );

  const handleAdd = () => {
    if (!newName.trim()) { setAddError("Oyuncu adı zorunludur."); return; }
    setAddError("");
    startTransition(async () => {
      try {
        const p = await addPlayerToTeam(team.id, {
          name: newName.trim(),
          number: newNumber ? Number(newNumber) : undefined,
        });
        setPlayers(prev => [...prev, p as Player]);
        setNewName("");
        setNewNumber("");
        setAdding(false);
      } catch (e: unknown) {
        setAddError(e instanceof Error ? e.message : "Hata oluştu.");
      }
    });
  };

  const handleRemove = (playerId: string) => {
    setRemovingId(playerId);
    startTransition(async () => {
      try {
        await removePlayerFromTeam(playerId);
        setPlayers(prev => prev.filter(p => p.id !== playerId));
      } catch {
        // hata sessizce geç
      } finally {
        setRemovingId(null);
      }
    });
  };

  const totalGoals   = players.reduce((s, p) => s + p.goals.length, 0);
  const totalAssists = players.reduce((s, p) => s + p.assists.length, 0);
  const totalYellow  = players.reduce((s, p) => s + p.cards.filter(c => c.type === "YELLOW").length, 0);
  const totalRed     = players.reduce((s, p) => s + p.cards.filter(c => c.type === "RED").length, 0);

  return (
    <PageContent>
      <PageHeader
        title={team.name}
        subtitle={`${players.length} oyuncu · Kaptan: ${team.captain.name}`}
      />

      {/* Sekmeler */}
      <div className="flex gap-1 p-1 bg-[#F4F6F9] rounded-xl w-fit">
        {([
          { key: "kadro",      label: "Oyuncu Kadrosu" },
          { key: "istatistik", label: "Takım İstatistikleri" },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === t.key
                ? "bg-white text-[#111827] shadow-sm"
                : "text-[#6B7280] hover:text-[#374151]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "kadro" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <Card>
              <CardHeader
                title="Oyuncu Kadrosu"
                subtitle={`${players.filter(p => p.status === "ACTIVE").length} aktif · ${players.filter(p => p.status === "SUSPENDED").length} cezalı`}
                actions={
                  !isLocked ? (
                    <button
                      onClick={() => setAdding(v => !v)}
                      className="flex items-center gap-1 text-xs font-medium text-[#3B82F6] hover:text-[#2563EB]"
                    >
                      <Plus size={13} /> Oyuncu Ekle
                    </button>
                  ) : undefined
                }
              />

              <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5E7EB]">
                    {["#", "Oyuncu", "G", "A", "Kart", "Durum", ""].map((h, i) => (
                      <th key={i} className="px-3 py-2.5 text-left text-xs font-semibold text-[#9CA3AF] uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {players.map(p => (
                    <PlayerRow
                      key={p.id}
                      player={p}
                      onRemove={handleRemove}
                      removing={removingId === p.id || isLocked}
                    />
                  ))}
                </tbody>
              </table>
              </div>

              {/* Kilitli uyarısı */}
              {isLocked && (
                <div className="border-t border-[#E5E7EB] px-4 py-3 bg-[#FEF3C7]/50 flex items-center gap-2">
                  <span className="text-xs text-[#D97706]">Bu takım bir turnuvaya kayıtlı olduğu için düzenlenemez. Yeni kadro için yeni takım oluşturun.</span>
                </div>
              )}

              {/* Oyuncu ekleme formu */}
              {adding && !isLocked && (
                <div className="border-t border-[#E5E7EB] p-4 bg-[#F9FAFB]">
                  <p className="text-xs font-semibold text-[#374151] mb-3">Yeni Oyuncu</p>
                  <div className="flex gap-2 items-start">
                    <input
                      value={newNumber}
                      onChange={e => setNewNumber(e.target.value)}
                      placeholder="#"
                      className="w-14 px-2 py-2 text-sm text-center border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F59E0B] font-mono"
                    />
                    <div className="flex-1">
                      <input
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleAdd()}
                        placeholder="Oyuncu adı soyadı"
                        className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F59E0B]"
                      />
                      {addError && <p className="text-xs text-red-500 mt-1">{addError}</p>}
                    </div>
                    <button
                      onClick={handleAdd}
                      disabled={isPending}
                      className="px-4 py-2 text-sm font-semibold bg-[#0F1F47] text-white rounded-lg hover:bg-[#1A2F5A] disabled:opacity-50"
                    >
                      {isPending ? "..." : "Ekle"}
                    </button>
                    <button
                      onClick={() => { setAdding(false); setAddError(""); }}
                      className="px-3 py-2 text-sm text-[#9CA3AF] hover:text-[#374151]"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-5">
            {colors.length > 0 && (
              <Card>
                <CardHeader title="Forma Rengi" />
                <div className="px-4 pb-4">
                  <div className="flex rounded-xl overflow-hidden h-12 border border-[#E5E7EB]">
                    {colors.map(c => <div key={c} className="flex-1" style={{ backgroundColor: c }} />)}
                  </div>
                </div>
              </Card>
            )}

            <Card>
              <CardHeader title="Aktif Turnuva" border={false} />
              <div className="px-4 pb-4">
                {activeReg ? (
                  <div className="p-3 bg-[#FEF3C7]/60 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy size={14} className="text-[#D97706]" />
                      <span className="text-sm font-semibold text-[#D97706]">{activeReg.tournament.name}</span>
                    </div>
                    <div className="text-xs text-[#6B7280]">{activeReg.groupTeam?.group?.name ?? "Grup atanmadı"}</div>
                  </div>
                ) : (
                  <div className="p-3 bg-[#F4F6F9] rounded-xl text-xs text-[#9CA3AF] text-center flex items-center justify-center gap-2">
                    <Users size={13} /> Aktif turnuva yok
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === "istatistik" && (
        <div className="max-w-xl">
          <Card>
            <CardHeader title="Takım İstatistikleri" subtitle="Tüm turnuvalar toplamı" />
            <div className="p-4 grid grid-cols-2 gap-3">
              {[
                { label: "Atılan Gol",    val: totalGoals,              color: "text-[#10B981]" },
                { label: "Asist",         val: totalAssists,            color: "text-[#3B82F6]" },
                { label: "Sarı Kart",     val: totalYellow,             color: "text-[#F59E0B]" },
                { label: "Kırmızı Kart",  val: totalRed,                color: "text-[#EF4444]" },
                { label: "Oyuncu Sayısı", val: players.length,          color: "text-[#111827]" },
                { label: "Turnuva",       val: team.registrations.length, color: "text-[#8B5CF6]" },
              ].map(s => (
                <div key={s.label} className="text-center p-3 bg-[#F4F6F9] rounded-xl">
                  <div className={`text-2xl font-bold ${s.color}`}>{s.val}</div>
                  <div className="text-xs text-[#9CA3AF] mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </PageContent>
  );
}
