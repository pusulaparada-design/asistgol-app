import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const [r1, r2] = await Promise.all([
  prisma.player.updateMany({
    where: { name: "Caner Kababıyık", team: { name: "HTO" } },
    data: { number: 8 },
  }),
  prisma.player.updateMany({
    where: { name: "Metin Berber", team: { name: "HTO" } },
    data: { number: 11 },
  }),
]);

console.log("✓ Caner Kababıyık → 8 :", r1.count, "güncellendi");
console.log("✓ Metin Berber → 11 :", r2.count, "güncellendi");
await prisma.$disconnect();
