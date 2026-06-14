import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const team = await prisma.team.findFirst({
  where: { name: { contains: "Mimarlar", mode: "insensitive" } },
  include: {
    captain: { select: { id: true, username: true, email: true, emailVerified: true } },
    registrations: {
      include: { tournament: { select: { name: true } } },
    },
  },
});

console.log(JSON.stringify(team, null, 2));
await prisma.$disconnect();
