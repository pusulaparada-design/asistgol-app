import { Calendar, MapPin, Zap } from "lucide-react";
import { PageContent, PageHeader, Card, CardHeader, ActionButton, StatusBadge, LiveBadge } from "@/components/ui/PageShell";

const groupMatches = {
  "Grup A": [
    { id: 1, home: "Aslan FC", away: "Kaplan SK", homeScore: 3, awayScore: 1, date: "2026-05-25", time: "18:00", venue: "Bosphorus S.1", status: "played" },
    { id: 2, home: "Çınar FC", away: "Ateş FC", homeScore: 4, awayScore: 1, date: "2026-05-25", time: "19:30", venue: "Bosphorus S.2", status: "played" },
    { id: 3, home: "Aslan FC", away: "Çınar FC", homeScore: 1, awayScore: 1, date: "2026-05-28", time: "18:00", venue: "Bosphorus S.1", status: "played" },
    { id: 4, home: "Kaplan SK", away: "Ateş FC", homeScore: 2, awayScore: 0, date: "2026-05-28", time: "19:30", venue: "Bosphorus S.2", status: "played" },
    { id: 5, home: "Aslan FC", away: "Ateş FC", homeScore: 2, awayScore: 0, date: "2026-06-01", time: "18:00", venue: "Bosphorus S.1", status: "played" },
    { id: 6, home: "Kaplan SK", away: "Çınar FC", homeScore: null, awayScore: null, date: "2026-06-08", time: "21:00", venue: "Bosphorus S.1", status: "scheduled" },
  ],
  "Grup B": [
    { id: 7, home: "Rüzgar Spor", away: "Fırtına FC", homeScore: 3, awayScore: 0, date: "2026-05-26", time: "18:00", venue: "Bosphorus S.2", status: "played" },
    { id: 8, home: "Demir SK", away: "Şimşek SK", homeScore: 2, awayScore: 1, date: "2026-05-26", time: "19:30", venue: "Bosphorus S.1", status: "played" },
    { id: 9, home: "Rüzgar Spor", away: "Demir SK", homeScore: 2, awayScore: 1, date: "2026-06-01", time: "19:30", venue: "Bosphorus S.2", status: "played" },
    { id: 10, home: "Fırtına FC", away: "Şimşek SK", homeScore: null, awayScore: null, date: "2026-06-08", time: "18:00", venue: "Bosphorus S.2", status: "live" },
  ],
};

const knockoutMatches = [
  { round: "Çeyrek Final", matches: [
    { id: 20, home: "Aslan FC", away: "Demir SK", homeScore: null, awayScore: null, date: "2026-06-15", time: "?", status: "pending" },
    { id: 21, home: "Rüzgar Spor", away: "Çınar FC", homeScore: null, awayScore: null, date: "2026-06-15", time: "?", status: "pending" },
    { id: 22, home: "Kar FC", away: "Yıldırım SK", homeScore: null, awayScore: null, date: "2026-06-16", time: "?", status: "pending" },
    { id: 23, home: "Güneş Spor", away: "Fener SK", homeScore: null, awayScore: null, date: "2026-06-16", time: "?", status: "pending" },
  ]},
  { round: "Yarı Final", matches: [
    { id: 24, home: "QF1 Galibi", away: "QF2 Galibi", homeScore: null, awayScore: null, date: "2026-06-22", time: "?", status: "pending" },
    { id: 25, home: "QF3 Galibi", away: "QF4 Galibi", homeScore: null, awayScore: null, date: "2026-06-22", time: "?", status: "pending" },
  ]},
  { round: "Final & 3.lük", matches: [
    { id: 26, home: "YF1 Galibi", away: "YF2 Galibi", homeScore: null, awayScore: null, date: "2026-06-29", time: "?", status: "pending" },
    { id: 27, home: "YF1 Mağlubu", away: "YF2 Mağlubu", homeScore: null, awayScore: null, date: "2026-06-29", time: "?", status: "pending" },
  ]},
];

function MatchRow({ m }: { m: { id: number; home: string; away: string; homeScore: number | null; awayScore: number | null; date: string; time: string; venue?: string; status: string } }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 hover:bg-[#FAFAFA] transition-colors ${m.status === "live" ? "bg-[#FEF2F2]/30" : ""}`}>
      <span className="text-xs text-[#9CA3AF] w-12 shrink-0 font-mono">{m.time}</span>
      <div className="flex-1 grid grid-cols-3 items-center gap-2">
        <span className={`text-sm font-medium text-right ${m.homeScore !== null && m.homeScore > (m.awayScore ?? 0) ? "text-[#059669]" : "text-[#111827]"}`}>{m.home}</span>
        <div className="text-center">
          {m.status === "live" ? (
            <LiveBadge />
          ) : m.homeScore !== null ? (
            <span className="font-mono font-bold text-sm text-[#111827]">{m.homeScore} - {m.awayScore}</span>
          ) : (
            <span className="text-xs text-[#9CA3AF]">vs</span>
          )}
        </div>
        <span className={`text-sm font-medium ${m.awayScore !== null && m.awayScore > (m.homeScore ?? 0) ? "text-[#059669]" : "text-[#111827]"}`}>{m.away}</span>
      </div>
      <div className="shrink-0 text-right">
        <div className="text-xs text-[#9CA3AF]">{m.date}</div>
        {m.venue && <div className="flex items-center justify-end gap-0.5 text-[10px] text-[#C4C9D4] mt-0.5"><MapPin size={9} />{m.venue}</div>}
      </div>
      {m.status === "scheduled" && (
        <button className="text-xs font-medium px-2 py-1 bg-[#FEF3C7] text-[#D97706] rounded-md hover:bg-[#FDE68A] transition-colors whitespace-nowrap">
          Skor Gir
        </button>
      )}
    </div>
  );
}

export default function FixturePage({ params }: { params: { id: string } }) {
  return (
    <PageContent>
      <PageHeader
        title="Fikstür"
        subtitle="Ramazan Kupası 2026"
        actions={
          <ActionButton variant="primary" icon={Zap} size="sm">
            Otomatik Fikstür Oluştur
          </ActionButton>
        }
      />

      {/* Group stage */}
      <div>
        <h2 className="text-sm font-semibold text-[#374151] mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#3B82F6]" /> Grup Aşaması
        </h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {Object.entries(groupMatches).map(([groupName, matches]) => (
            <Card key={groupName}>
              <CardHeader
                title={groupName}
                subtitle={`${matches.filter(m => m.status === "played").length}/${matches.length} maç oynandı`}
                actions={<ActionButton variant="ghost" size="sm" icon={Calendar}>Tarih Ata</ActionButton>}
              />
              <div className="divide-y divide-[#F3F4F6]">
                {matches.map((m) => <MatchRow key={m.id} m={m} />)}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Knockout */}
      <div>
        <h2 className="text-sm font-semibold text-[#374151] mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Eleme Aşaması
        </h2>
        <div className="space-y-5">
          {knockoutMatches.map((round) => (
            <Card key={round.round}>
              <CardHeader
                title={round.round}
                subtitle="Takımlar grup aşaması bittikten sonra belirlenecek"
              />
              <div className="divide-y divide-[#F3F4F6]">
                {round.matches.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 px-4 py-3 opacity-60">
                    <span className="text-xs text-[#9CA3AF] w-12 shrink-0">{m.date}</span>
                    <div className="flex-1 grid grid-cols-3 items-center gap-2">
                      <span className="text-sm text-[#9CA3AF] text-right italic">{m.home}</span>
                      <span className="text-center text-xs text-[#D1D5DB]">vs</span>
                      <span className="text-sm text-[#9CA3AF] italic">{m.away}</span>
                    </div>
                    <StatusBadge label="Bekliyor" variant="gray" dot={false} />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PageContent>
  );
}
