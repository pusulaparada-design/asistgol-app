import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const r = await prisma.player.updateMany({
  where: { name: "Erman Koca", team: { name: "HKMO" } },
  data: { number: 5 },
});
console.log("✓ Güncellendi:", r.count, "oyuncu");
await prisma.$disconnect();
