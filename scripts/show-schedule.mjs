import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const t = await prisma.tournament.findUnique({
  where: { id: "cmqdu2a7u0001j26h4vkd5h7c" },
  select: { schedule: true },
});
console.log(JSON.stringify(t.schedule, null, 2));
await prisma.$disconnect();
