import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const TOURNAMENT_ID = "cmqdu2a7u0001j26h4vkd5h7c";

// MatchWeek[] formatı (ScheduleTab ile uyumlu)
const schedule = [
  {
    id: "w1", label: "1. Hafta",
    days: [
      { id: "w1d1", date: "2026-06-16", times: [] }, // Salı
      { id: "w1d2", date: "2026-06-17", times: [] }, // Çarşamba
      { id: "w1d3", date: "2026-06-18", times: [] }, // Perşembe
    ],
  },
  {
    id: "w2", label: "2. Hafta",
    days: [
      { id: "w2d1", date: "2026-06-23", times: [] },
      { id: "w2d2", date: "2026-06-24", times: [] },
      { id: "w2d3", date: "2026-06-25", times: [] },
    ],
  },
  {
    id: "w3", label: "3. Hafta",
    days: [
      { id: "w3d1", date: "2026-06-30", times: [] },
      { id: "w3d2", date: "2026-07-01", times: [] },
      { id: "w3d3", date: "2026-07-02", times: [] },
    ],
  },
  {
    id: "w4", label: "4. Hafta",
    days: [
      { id: "w4d1", date: "2026-07-07", times: [] },
      { id: "w4d2", date: "2026-07-08", times: [] },
      { id: "w4d3", date: "2026-07-09", times: [] },
    ],
  },
  {
    id: "w5", label: "5. Hafta",
    days: [
      { id: "w5d1", date: "2026-07-14", times: [] },
      { id: "w5d2", date: "2026-07-15", times: [] },
      { id: "w5d3", date: "2026-07-16", times: [] },
    ],
  },
];

await prisma.tournament.update({
  where: { id: TOURNAMENT_ID },
  data: { schedule },
});

console.log("✅ 5 hafta (15 gün) schedule kaydedildi.");
await prisma.$disconnect();
