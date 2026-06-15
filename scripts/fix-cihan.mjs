import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const r = await prisma.player.updateMany({
  where: { name: "Cihan Çankır", team: { name: "SMMMO" } },
  data: { number: 9 },
});
console.log("✓ Güncellendi:", r.count, "oyuncu");
await prisma.$disconnect();
