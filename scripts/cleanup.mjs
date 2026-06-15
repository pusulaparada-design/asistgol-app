import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Bugün oluşturulan 12 kaptanın e-postaları — bu kaptanların takımları KORUNACAK
const keepCaptainEmails = [
  "gokmencatal@hotmail.com",
  "cem.huzmeli@gmail.com",
  "emreozdemir3@hotmail.com",
  "bilginmuhasebe@hotmail.com",
  "yasinyanaray@hotmail.com",
  "tolgatemzsoy@gmail.com",
  "alibaklaci05@gmail.com",
  "mithatnalca@gmail.com",
  "sami.1reyhan@gmail.com",
  "dalkiranmehmet97@gmail.com",
  "dr.necdet72@hotmail.com",
  "ahmthlpli@gmail.com",
];

async function main() {
  // 1. Korunacak kaptanların user ID'lerini bul
  const keepCaptains = await prisma.user.findMany({
    where: { email: { in: keepCaptainEmails } },
    select: { id: true, name: true },
  });
  const keepCaptainIds = new Set(keepCaptains.map(u => u.id));
  console.log("✓ Korunacak kaptan sayısı:", keepCaptains.length);
  keepCaptains.forEach(u => console.log("  →", u.name));

  // 2. Silinecek takımları bul (korunan kaptanlara ait olmayanlar)
  const teamsToDelete = await prisma.team.findMany({
    where: { captainId: { notIn: [...keepCaptainIds] } },
    select: { id: true, name: true },
  });
  console.log("\n🗑  Silinecek takımlar:", teamsToDelete.length);
  teamsToDelete.forEach(t => console.log("  →", t.name));

  const deleteTeamIds = teamsToDelete.map(t => t.id);

  if (deleteTeamIds.length > 0) {
    // Bu takımları içeren maçları bul
    const matches = await prisma.match.findMany({
      where: { OR: [{ homeTeamId: { in: deleteTeamIds } }, { awayTeamId: { in: deleteTeamIds } }] },
      select: { id: true },
    });
    const matchIds = matches.map(m => m.id);

    // Maçlara bağlı verileri sil
    if (matchIds.length > 0) {
      await prisma.playerSuspension.deleteMany({ where: { tournamentId: { in: (await prisma.match.findMany({ where: { id: { in: matchIds } }, select: { tournamentId: true } })).map(m => m.tournamentId) } } });
      await prisma.card.deleteMany({ where: { matchId: { in: matchIds } } });
      await prisma.goal.deleteMany({ where: { matchId: { in: matchIds } } });
      await prisma.assist.deleteMany({ where: { matchId: { in: matchIds } } });
      await prisma.match.deleteMany({ where: { id: { in: matchIds } } });
    }

    // Oyunculara bağlı verileri sil
    await prisma.playerSuspension.deleteMany({ where: { player: { teamId: { in: deleteTeamIds } } } });
    await prisma.goal.deleteMany({ where: { player: { teamId: { in: deleteTeamIds } } } });
    await prisma.assist.deleteMany({ where: { player: { teamId: { in: deleteTeamIds } } } });
    await prisma.card.deleteMany({ where: { player: { teamId: { in: deleteTeamIds } } } });
    await prisma.player.deleteMany({ where: { teamId: { in: deleteTeamIds } } });
    await prisma.groupTeam.deleteMany({ where: { teamId: { in: deleteTeamIds } } });
    await prisma.teamRegistration.deleteMany({ where: { teamId: { in: deleteTeamIds } } });
    await prisma.team.deleteMany({ where: { id: { in: deleteTeamIds } } });
    console.log("✓ Takımlar ve bağlı veriler silindi.");
  }

  // 3. edipyildiz@gmail.com kullanıcısını bul
  const edip = await prisma.user.findUnique({ where: { email: "edipyildiz@gmail.com" } });
  if (edip) {
    // Bu kullanıcının turnuvalarını bul
    const edipTournaments = await prisma.tournament.findMany({
      where: { organizerId: edip.id },
      select: { id: true, name: true },
    });
    console.log("\n🗑  Silinecek turnuvalar:");
    edipTournaments.forEach(t => console.log("  →", t.name));

    for (const tournament of edipTournaments) {
      const tid = tournament.id;
      await prisma.playerSuspension.deleteMany({ where: { tournamentId: tid } });
      await prisma.card.deleteMany({ where: { match: { tournamentId: tid } } });
      await prisma.goal.deleteMany({ where: { match: { tournamentId: tid } } });
      await prisma.assist.deleteMany({ where: { match: { tournamentId: tid } } });
      await prisma.match.deleteMany({ where: { tournamentId: tid } });
      await prisma.groupTeam.deleteMany({ where: { group: { tournamentId: tid } } });
      await prisma.group.deleteMany({ where: { tournamentId: tid } });
      await prisma.teamRegistration.deleteMany({ where: { tournamentId: tid } });
      await prisma.tournament.delete({ where: { id: tid } });
    }
    console.log("✓ Turnuvalar silindi.");

    // Kullanıcıya ait bildirim ve duyuruları sil
    await prisma.notification.deleteMany({ where: { userId: edip.id } });
    await prisma.announcement.deleteMany({ where: { organizerId: edip.id } }).catch(() => {});
    await prisma.user.delete({ where: { id: edip.id } });
    console.log("✓ edipyildiz@gmail.com kullanıcısı silindi.");
  } else {
    console.log("\n! edipyildiz@gmail.com bulunamadı, atlandı.");
  }

  console.log("\n✅ Temizlik tamamlandı.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
