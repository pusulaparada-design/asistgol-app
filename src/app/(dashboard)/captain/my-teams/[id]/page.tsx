"use client";
import { useState } from "react";
import { Plus, Trash2, Edit2, Trophy, Users } from "lucide-react";
import { PageContent, PageHeader, Card, CardHeader, ActionButton, StatusBadge } from "@/components/ui/PageShell";

const players = [
  { id: 1, name: "Murat Arslan", position: "Forvet", number: 9, goals: 5, assists: 2, yellowCards: 1, status: "active" },
  { id: 2, name: "Emre Demir", position: "Forvet", number: 11, goals: 8, assists: 3, yellowCards: 0, status: "active" },
  { id: 3, name: "Berk Yılmaz", position: "Orta Saha", number: 8, goals: 2, assists: 4, yellowCards: 1, status: "active" },
  { id: 4, name: "Can Öz", position: "Orta Saha", number: 10, goals: 1, assists: 1, yellowCards: 0, status: "active" },
  { id: 5, name: "Alp Kaya", position: "Orta Saha", number: 6, goals: 0, assists: 1, yellowCards: 2, status: "suspended" },
  { id: 6, name: "Sefa Güneş", position: "Defans", number: 4, goals: 0, assists: 0, yellowCards: 0, status: "active" },
  { id: 7, name: "Taner Çetin", position: "Defans", number: 3, goals: 1, assists: 0, yellowCards: 0, status: "active" },
  { id: 8, name: "Onur Yıldız", position: "Defans", number: 2, goals: 0, assists: 0, yellowCards: 1, status: "active" },
  { id: 9, name: "Kemal Doğan", position: "Defans", number: 5, goals: 0, assists: 1, yellowCards: 0, status: "active" },
  { id: 10, name: "Hüseyin Ay", position: "Kaleci", number: 1, goals: 0, assists: 0, yellowCards: 0, status: "active" },
  { id: 11, name: "Barış Tunç", position: "Kaleci", number: 12, goals: 0, assists: 0, yellowCards: 0, status: "active" },
  { id: 12, name: "Serhat Boş", position: "Forvet", number: 7, goals: 0, assists: 0, yellowCards: 0, status: "injury" },
];

const positionColors: Record<string, string> = {
  "Kaleci": "bg-[#FEF3C7] text-[#D97706]",
  "Defans": "bg-[#EFF6FF] text-[#2563EB]",
  "Orta Saha": "bg-[#ECFDF5] text-[#059669]",
  "Forvet": "bg-[#FEF2F2] text-[#DC2626]",
};

export default function TeamDetailPage({ params }: { params: { id: string } }) {
  const [editing, setEditing] = useState(false);

  return (
    <PageContent>
      <PageHeader
        title="Aslan FC"
        subtitle="12 oyuncu · İstanbul · Kaptan: Murat Arslan"
        actions={
          <ActionButton variant="secondary" size="sm" icon={Edit2} onClick={() => setEditing(!editing)}>
            {editing ? "Kaydet" : "Kadroyu Düzenle"}
          </ActionButton>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          {/* Players */}
          <Card>
            <CardHeader
              title="Oyuncu Kadrosu"
              subtitle={`${players.filter(p => p.status === "active").length} aktif · ${players.filter(p => p.status === "suspended").length} cezalı`}
              actions={editing ? <button onClick={() => {}} className="flex items-center gap-1 text-xs font-medium text-[#3B82F6] hover:text-[#2563EB]"><Plus size={13} /> Oyuncu Ekle</button> : undefined}
            />
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  {["#", "Oyuncu", "Mevki", "G", "A", "Kart", "Durum", ...(editing ? [""] : [])].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-[#9CA3AF] uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {players.map((p) => (
                  <tr key={p.id} className={`hover:bg-[#FAFAFA] transition-colors ${p.status === "suspended" ? "bg-[#FEF2F2]/20" : ""}`}>
                    <td className="px-3 py-2.5 text-xs font-mono text-[#9CA3AF] w-10">{p.number}</td>
                    <td className="px-3 py-2.5 text-sm font-medium text-[#111827]">{p.name}</td>
                    <td className="px-3 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${positionColors[p.position]}`}>{p.position}</span>
                    </td>
                    <td className="px-3 py-2.5 text-sm font-semibold text-[#10B981]">{p.goals}</td>
                    <td className="px-3 py-2.5 text-sm font-semibold text-[#3B82F6]">{p.assists}</td>
                    <td className="px-3 py-2.5">
                      {p.yellowCards > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-4 bg-[#F59E0B] rounded-sm" />
                          <span className="text-xs text-[#D97706]">{p.yellowCards}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge
                        label={p.status === "active" ? "Aktif" : p.status === "suspended" ? "Cezalı" : "Sakatlık"}
                        variant={p.status === "active" ? "green" : p.status === "suspended" ? "red" : "orange"}
                        dot={false}
                      />
                    </td>
                    {editing && (
                      <td className="px-3 py-2.5">
                        <button className="p-1 text-[#9CA3AF] hover:text-[#EF4444] transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        <div className="space-y-5">
          {/* Season stats */}
          <Card>
            <CardHeader title="Sezon İstatistikleri" />
            <div className="p-4 grid grid-cols-2 gap-3">
              {[
                { label: "Galibiyet", val: "3", color: "text-[#10B981]" },
                { label: "Beraberlik", val: "1", color: "text-[#F59E0B]" },
                { label: "Mağlubiyet", val: "0", color: "text-[#EF4444]" },
                { label: "Atılan Gol", val: "10", color: "text-[#3B82F6]" },
                { label: "Yenilen Gol", val: "4", color: "text-[#9CA3AF]" },
                { label: "Averaj", val: "+6", color: "text-[#111827]" },
              ].map((s) => (
                <div key={s.label} className="text-center p-2.5 bg-[#F4F6F9] rounded-xl">
                  <div className={`text-xl font-bold ${s.color}`}>{s.val}</div>
                  <div className="text-[10px] text-[#9CA3AF] mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Active tournament */}
          <Card>
            <CardHeader title="Aktif Turnuva" border={false} />
            <div className="px-4 pb-4">
              <div className="p-3 bg-[#FEF3C7]/60 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy size={14} className="text-[#D97706]" />
                  <span className="text-sm font-semibold text-[#D97706]">Ramazan Kupası 2026</span>
                </div>
                <div className="text-xs text-[#6B7280]">Grup A — 1. sıra</div>
                <div className="text-xs text-[#9CA3AF] mt-1">10 puan / 4 maç</div>
              </div>
              <div className="mt-3">
                <ActionButton href="/captain/tournaments" variant="secondary" size="sm">Turnuva Keşfet</ActionButton>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageContent>
  );
}
