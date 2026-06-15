import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const [r1, r2] = await Promise.all([
  prisma.player.updateMany({
    where: { name: "Sercan Deniz Gülü", team: { name: "IMO" } },
    data: { number: 15 },
  }),
  prisma.player.updateMany({
    where: { name: "Cem Cabiroğlu", team: { name: "IMO" } },
    data: { number: 18 },
  }),
]);

console.log("✓ Sercan Deniz Gülü → 15 :", r1.count, "güncellendi");
console.log("✓ Cem Cabiroğlu → 18 :", r2.count, "güncellendi");
await prisma.$disconnect();
