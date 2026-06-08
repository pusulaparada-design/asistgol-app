import { MapPin, Clock } from "lucide-react";
import { PageContent, PageHeader, Card, CardHeader, StatusBadge, LiveBadge } from "@/components/ui/PageShell";

const days = ["8 Haz", "9 Haz", "10 Haz", "11 Haz", "12 Haz", "13 Haz", "14 Haz"];
const today = "8 Haz";

const schedule = [
  { date: "8 Haz", time: "19:00", team: "Aslan FC", opponent: "Kaplan SK", venue: "Bosphorus S.1", tournament: "Ramazan Kupası 2026", phase: "Grup A", status: "scheduled" },
  { date: "8 Haz", time: "21:00", team: "Aslan FC", opponent: "Çınar FC", venue: "Bosphorus S.2", tournament: "Ramazan Kupası 2026", phase: "Grup A", status: "live" },
  { date: "10 Haz", time: "20:00", team: "Yıldız SK", opponent: "Bordo FC", venue: "Yıldız Arena", tournament: "Yaz Ligi 2026", phase: "6. Hafta", status: "scheduled" },
  { date: "12 Haz", time: "18:00", team: "Aslan FC", opponent: "Demir SK", venue: "Bosphorus S.1", tournament: "Ramazan Kupası 2026", phase: "Grup A", status: "scheduled" },
  { date: "14 Haz", time: "19:30", team: "Yıldız SK", opponent: "Ateş FC", venue: "Yıldız Arena", tournament: "Yaz Ligi 2026", phase: "6. Hafta", status: "scheduled" },
];

const pastMatches = [
  { date: "7 Haz", team: "Aslan FC", opponent: "Rüzgar Spor", homeScore: 3, awayScore: 1, result: "win" },
  { date: "5 Haz", team: "Yıldız SK", opponent: "Çınar FC", homeScore: 0, awayScore: 2, result: "loss" },
  { date: "3 Haz", team: "Aslan FC", opponent: "Ateş FC", homeScore: 2, awayScore: 0, result: "win" },
];

export default function SchedulePage() {
  return (
    <PageContent>
      <PageHeader title="Maç Takvimim" subtitle="Önümüzdeki 7 gün" />

      {/* Week view */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {days.map((day) => {
          const dayMatches = schedule.filter(m => m.date === day);
          const isToday = day === today;
          return (
            <div
              key={day}
              className={`min-w-[80px] p-3 rounded-xl text-center border-2 transition-all ${
                isToday ? "border-[#F59E0B] bg-[#FFFBEB]" : "border-[#E5E7EB] bg-white"
              }`}
            >
              <div className={`text-xs font-medium ${isToday ? "text-[#D97706]" : "text-[#9CA3AF]"}`}>{day}</div>
              {dayMatches.length > 0 ? (
                <div className={`mt-1.5 text-sm font-bold ${isToday ? "text-[#D97706]" : "text-[#374151]"}`}>
                  {dayMatches.length} maç
                </div>
              ) : (
                <div className="mt-1.5 text-xs text-[#D1D5DB]">—</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Upcoming matches */}
      <Card>
        <CardHeader title="Yaklaşan Maçlar" />
        <div className="divide-y divide-[#F3F4F6]">
          {schedule.map((m, i) => (
            <div key={i} className={`flex items-center gap-4 px-5 py-4 ${m.status === "live" ? "bg-[#FEF2F2]/20" : ""}`}>
              <div className="w-12 text-right shrink-0">
                <div className="text-xs font-semibold text-[#374151]">{m.date}</div>
                <div className="text-xs text-[#9CA3AF] font-mono">{m.time}</div>
              </div>
              <div className={`w-2 h-2 rounded-full shrink-0 ${m.status === "live" ? "bg-[#EF4444] animate-pulse" : "bg-[#D1D5DB]"}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-[#111827]">{m.team} vs {m.opponent}</span>
                  {m.status === "live" ? <LiveBadge /> : <StatusBadge label="Planlandı" variant="blue" dot={false} />}
                </div>
                <div className="flex items-center gap-3 text-xs text-[#9CA3AF]">
                  <span>{m.tournament} · {m.phase}</span>
                  <span className="flex items-center gap-0.5"><MapPin size={10} /> {m.venue}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Past results */}
      <Card>
        <CardHeader title="Son Maç Sonuçları" />
        <div className="divide-y divide-[#F3F4F6]">
          {pastMatches.map((m, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                m.result === "win" ? "bg-[#ECFDF5] text-[#059669]" : m.result === "loss" ? "bg-[#FEF2F2] text-[#DC2626]" : "bg-[#F3F4F6] text-[#9CA3AF]"
              }`}>
                {m.result === "win" ? "G" : m.result === "loss" ? "M" : "B"}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-[#111827]">{m.team} vs {m.opponent}</div>
                <div className="text-xs text-[#9CA3AF]">{m.date}</div>
              </div>
              <div className="font-mono font-bold text-sm text-[#111827]">{m.homeScore} - {m.awayScore}</div>
            </div>
          ))}
        </div>
      </Card>
    </PageContent>
  );
}
