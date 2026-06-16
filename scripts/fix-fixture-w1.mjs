import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const TOURNAMENT_ID = "cmqdu2a7u0001j26h4vkd5h7c";

// Takım ID'lerini bul
const teams = await prisma.team.findMany({
  where: { registrations: { some: { tournamentId: TOURNAMENT_ID, status: "APPROVED" } } },
  select: { id: true, name: true },
});
const id = (name) => teams.find(t => t.name === name)?.id;

const fixes = [
  { home: "HTO",    away: "SMMMO",  wrongDate: "2026-06-17", rightDate: "2026-06-16" },
  { home: "JMO",    away: "ECZ",    wrongDate: "2026-06-18", rightDate: "2026-06-17" },
  { home: "HDHO-1", away: "HKMO",  wrongDate: "2026-06-16", rightDate: "2026-06-18" },
];

for (const fix of fixes) {
  const result = await prisma.match.updateMany({
    where: {
      tournamentId: TOURNAMENT_ID,
      homeTeamId: id(fix.home),
      awayTeamId: id(fix.away),
      date: new Date(fix.wrongDate + "T12:00:00Z"),
    },
    data: { date: new Date(fix.rightDate + "T12:00:00Z") },
  });
  console.log(`${fix.home} vs ${fix.away}: ${fix.wrongDate} → ${fix.rightDate} (${result.count} güncellendi)`);
}

await prisma.$disconnect();
