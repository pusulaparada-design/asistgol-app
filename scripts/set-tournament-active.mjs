import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const t = await prisma.tournament.findFirst({
  where: { name: { contains: "HAMOK", mode: "insensitive" } },
  select: { id: true, name: true, status: true },
});

if (!t) { console.log("Turnuva bulunamadı"); process.exit(1); }
console.log("Önceki durum:", t.name, "→", t.status);

await prisma.tournament.update({ where: { id: t.id }, data: { status: "ACTIVE" } });
console.log("Yeni durum: ACTIVE");
await prisma.$disconnect();
