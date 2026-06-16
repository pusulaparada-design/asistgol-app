import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const TOURNAMENT_ID = "cmqdu2a7u0001j26h4vkd5h7c";

async function main() {
  const matches = await prisma.match.findMany({
    where: { tournamentId: TOURNAMENT_ID, groupId: { not: null } },
    select: { id: true, date: true, time: true, round: true, homeTeam: { select: { name: true } }, awayTeam: { select: { name: true } } },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
  });

  // Her tarihteki maçları grupla, sıralarına göre 21:00 / 22:00 ata
  const byDate = new Map();
  for (const m of matches) {
    const d = m.date?.toISOString().slice(0, 10) ?? "nodate";
    if (!byDate.has(d)) byDate.set(d, []);
    byDate.get(d).push(m);
  }

  const TIMES = ["21:00", "22:00"];
  let updated = 0;

  for (const [date, dayMatches] of byDate.entries()) {
    for (let i = 0; i < dayMatches.length; i++) {
      const m = dayMatches[i];
      const newTime = TIMES[i] ?? "22:00";
      await prisma.match.update({ where: { id: m.id }, data: { time: newTime } });
      console.log(`✓ ${date} [${i + 1}] ${m.homeTeam.name} vs ${m.awayTeam.name} → ${newTime}`);
      updated++;
    }
  }

  console.log(`\n✅ ${updated} maça saat atandı.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
