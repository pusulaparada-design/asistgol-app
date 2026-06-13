import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const tournaments = await prisma.tournament.findMany({ select: { id: true, name: true }, take: 3 });
console.log("TOURNAMENTS:", JSON.stringify(tournaments, null, 2));

const rounds = await prisma.match.groupBy({
  by: ["round", "tournamentId"],
  where: { round: { not: null } },
  _count: { id: true },
  take: 10
});
console.log("ROUNDS:", JSON.stringify(rounds, null, 2));

await prisma.$disconnect();
