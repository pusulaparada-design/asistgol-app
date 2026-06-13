export const dynamic = "force-dynamic";
import { AlertTriangle } from "lucide-react";
import { PageContent, PageHeader, Card, CardHeader, StatusBadge } from "@/components/ui/PageShell";
import { getTournamentPenalties } from "@/lib/actions/match";
import { prisma } from "@/lib/prisma";

export default async function PenaltiesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [data, tournament] = await Promise.all([
    getTournamentPenalties(id).catch(() => ({ suspended: [], atRisk: [], fairPlay: [] })),
    prisma.tournament.findUnique({ where: { id }, select: { name: true } }),
  ]);

  const { suspended, atRisk, fairPlay } = data;
  const cleanCount = fairPlay.filter((t) => t.yellow === 0 && t.red === 0).length;

  return (
    <PageContent>
      <PageHeader title="Cezalı Oyuncular" subtitle={`${tournament?.name ?? "—"} — Kart takibi ve men cezaları`} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-4">
          <div className="text-2xl font-bold text-[#DC2626]">{suspended.length}</div>
          <div className="text-sm text-[#DC2626] font-medium mt-0.5">Askıdaki Oyuncu</div>
          <div className="text-xs text-[#FCA5A5] mt-1">Bir sonraki maçta oynayamaz</div>
        </div>
        <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-xl p-4">
          <div className="text-2xl font-bold text-[#D97706]">{atRisk.length}</div>
          <div className="text-sm text-[#D97706] font-medium mt-0.5">Risk Altında</div>
          <div className="text-xs text-[#FCD34D] mt-1">2 sarı kart birikimi var</div>
        </div>
        <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-4">
          <div className="text-2xl font-bold text-[#059669]">{cleanCount}</div>
          <div className="text-sm text-[#059669] font-medium mt-0.5">Temiz Takım</div>
          <div className="text-xs text-[#6EE7B7] mt-1">Hiç kart almamış</div>
        </div>
      </div>

      {suspended.length > 0 && (
        <Card>
          <CardHeader title="Ceza Çeken Oyuncular" subtitle="Bu maçta oynayamazlar" />
          <div className="divide-y divide-[#F3F4F6]">
            {suspended.map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-4 bg-[#FEF2F2]/30">
                <div className="w-10 h-10 bg-[#FEF2F2] rounded-xl flex items-center justify-center shrink-0">
                  <AlertTriangle size={18} className="text-[#DC2626]" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-[#111827]">{p.name}</div>
                  <div className="text-xs text-[#9CA3AF]">{p.team}</div>
                </div>
                <div className="flex gap-3 text-center">
                  <div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-4 bg-[#F59E0B] rounded-sm" />
                      <span className="text-sm font-bold text-[#D97706]">{p.yellowCards}</span>
                    </div>
                    <div className="text-[10px] text-[#9CA3AF]">Sarı</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-4 bg-[#EF4444] rounded-sm" />
                      <span className="text-sm font-bold text-[#DC2626]">{p.redCards}</span>
                    </div>
                    <div className="text-[10px] text-[#9CA3AF]">Kırmızı</div>
                  </div>
                </div>
                <StatusBadge label="Askıda" variant="red" />
              </div>
            ))}
          </div>
        </Card>
      )}

      {atRisk.length > 0 && (
        <Card>
          <CardHeader title="Risk Altındaki Oyuncular" subtitle="2 veya daha fazla sarı kart — bir sonraki ceza maçtan men" />
          <div className="divide-y divide-[#F3F4F6]">
            {atRisk.map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-10 h-10 bg-[#FEF3C7] rounded-xl flex items-center justify-center shrink-0">
                  <AlertTriangle size={18} className="text-[#D97706]" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-[#111827]">{p.name}</div>
                  <div className="text-xs text-[#9CA3AF]">{p.team}</div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-4 bg-[#F59E0B] rounded-sm" />
                  <span className="text-sm font-bold text-[#D97706]">{p.yellowCards} sarı kart</span>
                </div>
                <StatusBadge label="Risk Altında" variant="orange" />
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <CardHeader title="Fair Play Sıralaması" subtitle="En az kart alan takımlar" />
        {fairPlay.length === 0 ? (
          <div className="py-8 text-center text-sm text-[#9CA3AF]">Henüz kart verisi yok</div>
        ) : (
          <div className="divide-y divide-[#F3F4F6]">
            {fairPlay.map((row) => (
              <div key={row.name} className="flex items-center gap-3 px-4 py-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${row.pos === 1 ? "bg-[#ECFDF5] text-[#059669]" : "bg-[#F3F4F6] text-[#9CA3AF]"}`}>{row.pos}</div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-[#111827]">{row.name}</span>
                  {row.pos === 1 && <span className="ml-2 text-xs text-[#059669] font-medium">Fair Play Lideri</span>}
                </div>
                <div className="flex gap-3">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-4 bg-[#F59E0B] rounded-sm" />
                    <span className="text-xs font-medium text-[#D97706]">{row.yellow}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-4 bg-[#EF4444] rounded-sm" />
                    <span className="text-xs font-medium text-[#DC2626]">{row.red}</span>
                  </div>
                  <div className="w-14 text-right">
                    <span className="text-sm font-bold text-[#374151]">{row.score} puan</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </PageContent>
  );
}
