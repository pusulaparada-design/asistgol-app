import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const TOURNAMENT_ID = "cmqdu2a7u0001j26h4vkd5h7c";

// Oynanan maçları listele
const played = await prisma.match.findMany({
  where: { tournamentId: TOURNAMENT_ID, status: { in: ["PLAYED", "LIVE"] } },
  select: {
    id: true, round: true, status: true,
    homeScore: true, awayScore: true,
    homeTeam: { select: { name: true } },
    awayTeam: { select: { name: true } },
    _count: { select: { goals: true, assists: true, cards: true } },
  },
});

console.log(`\nSilinecek ${played.length} maç:\n`);
for (const m of played) {
  console.log(`  [${m.round}] ${m.homeTeam.name} ${m.homeScore}-${m.awayScore} ${m.awayTeam.name}  (gol:${m._count.goals} asist:${m._count.assists} kart:${m._count.cards})`);
}

const ids = played.map(m => m.id);

// Gol, asist, kart, ceza kayıtlarını sil
const [goals, assists, cards, suspensions] = await Promise.all([
  prisma.goal.deleteMany({ where: { matchId: { in: ids } } }),
  prisma.assist.deleteMany({ where: { matchId: { in: ids } } }),
  prisma.card.deleteMany({ where: { matchId: { in: ids } } }),
  prisma.playerSuspension.deleteMany({ where: { tournamentId: TOURNAMENT_ID } }),
]);

// Skorları ve statüyü sıfırla
await prisma.match.updateMany({
  where: { id: { in: ids } },
  data: { homeScore: null, awayScore: null, status: "SCHEDULED" },
});

console.log(`\n✅ Temizlendi:`);
console.log(`   ${goals.count} gol, ${assists.count} asist, ${cards.count} kart silindi`);
console.log(`   ${suspensions.count} ceza kaydı silindi`);
console.log(`   ${ids.length} maç SCHEDULED'a döndürüldü`);

await prisma.$disconnect();
