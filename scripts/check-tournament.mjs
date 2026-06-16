import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Hakan Temiz'in "2.geleneksel" turnuvasını bul
const organizer = await prisma.user.findFirst({
  where: { name: { contains: "Hakan", mode: "insensitive" } },
  select: { id: true, name: true },
});
console.log("Organizatör:", organizer);

const tournament = await prisma.tournament.findFirst({
  where: {
    organizerId: organizer?.id,
    name: { contains: "2", mode: "insensitive" },
  },
  include: {
    registrations: {
      where: { status: "APPROVED" },
      include: { team: { select: { id: true, name: true } } },
    },
    matches: { select: { id: true, homeTeam: { select: { name: true } }, awayTeam: { select: { name: true } }, date: true, status: true } },
    groups: { include: { teams: { include: { team: { select: { id: true, name: true } } } } } },
  },
});

console.log("\nTurnuva:", tournament?.id, "-", tournament?.name, "(Status:", tournament?.status + ")");
console.log("Onaylı kayıtlar:", tournament?.registrations.map(r => r.team.name));
console.log("Mevcut maç sayısı:", tournament?.matches.length);
if (tournament?.matches.length) {
  tournament.matches.forEach(m => console.log("  ", m.homeTeam.name, "vs", m.awayTeam.name, m.date));
}
console.log("Gruplar:", tournament?.groups.map(g => g.name + ": " + g.teams.map(t => t.team.name).join(", ")));

await prisma.$disconnect();
