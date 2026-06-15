import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const [r1, r2] = await Promise.all([
  prisma.player.updateMany({
    where: { name: "Mehmet Akif Yılmaz", team: { name: "MMO" } },
    data: { number: 8 },
  }),
  prisma.player.updateMany({
    where: { name: "Mahmut Sami", team: { name: "MMO" } },
    data: { number: 25 },
  }),
]);

console.log("✓ Mehmet Akif Yılmaz → 8 :", r1.count, "güncellendi");
console.log("✓ Mahmut Sami → 25 :", r2.count, "güncellendi");
await prisma.$disconnect();
