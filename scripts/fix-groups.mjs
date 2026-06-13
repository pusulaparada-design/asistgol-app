import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const TOURNAMENT_ID = "cmqcbbhqf0003nfkcddpsjjog";
const KEEP_COUNT = 2; // Tutulacak grup sayısı

async function main() {
  const groups = await prisma.group.findMany({
    where: { tournamentId: TOURNAMENT_ID },
    orderBy: { name: "asc" },
  });

  console.log("Mevcut gruplar:");
  groups.forEach((g, i) => console.log(`  ${i + 1}. ${g.name} (${g.id})`));

  if (groups.length <= KEEP_COUNT) {
    console.log(`\nZaten ${KEEP_COUNT} veya daha az grup var, işlem gerekmiyor.`);
    return;
  }

  // İlk 2 grubu tut, geri kalanları sil
  const toDelete = groups.slice(KEEP_COUNT);
  console.log(`\nSilinecek gruplar: ${toDelete.map(g => g.name).join(", ")}`);

  // Önce silinecek gruplara ait GroupTeam kayıtlarını temizle
  await prisma.groupTeam.deleteMany({
    where: { groupId: { in: toDelete.map(g => g.id) } },
  });

  // Kalan gruplara ait GroupTeam'leri de temizle (yeniden dağıtım için)
  await prisma.groupTeam.deleteMany({
    where: { groupId: { in: groups.slice(0, KEEP_COUNT).map(g => g.id) } },
  });

  // Grupları sil
  await prisma.group.deleteMany({
    where: { id: { in: toDelete.map(g => g.id) } },
  });

  // Kalan grupları yeniden adlandır
  const kept = groups.slice(0, KEEP_COUNT);
  const newNames = ["A Grubu", "B Grubu"];
  for (let i = 0; i < kept.length; i++) {
    await prisma.group.update({
      where: { id: kept[i].id },
      data: { name: newNames[i] },
    });
  }

  console.log(`\nİşlem tamamlandı. 2 grup kaldı: ${newNames.join(", ")}`);
  console.log("Şimdi yönetim sayfasındaki 'Otomatik Dağıt' butonuna tıklayın.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
