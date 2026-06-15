import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const players = [
  { number: 28, name: "Yasin Yanaray" },
  { number: 3,  name: "Bahtiyar Yılmaz" },
  { number: 19, name: "Edip Camuz" },
  { number: 31, name: "Yusuf Köprülü" },
  { number: 99, name: "İzzet Doksöz" },
  { number: 5,  name: "Fırat Çiçek" },
  { number: 9,  name: "Emrullah İnce" },
  { number: 7,  name: "Ali Baklacı" },
  { number: 13, name: "Ali Görmez" },
  { number: 50, name: "İdris Fatih Çelik" },
  { number: 26, name: "Hüsamettin Eskiocak" },
  { number: 43, name: "İsmet Şanverdi" },
  { number: 7,  name: "Mahmut Onur Turnacıgil" },
  { number: 11, name: "Okan Mansuroğlu" },
  { number: 6,  name: "Mehmet Okay Altunay" },
  { number: 14, name: "Selçul Bilgin" },
  { number: 1,  name: "Taner Güzel" },
  { number: 10, name: "Engin Kıra" },
  { number: 8,  name: "Ahmet İlker Vicdan" },
  { number: 81, name: "Celal Yerli" },
];

async function main() {
  const password = await bcrypt.hash("hamok2", 12);

  const user = await prisma.user.upsert({
    where: { email: "yasinyanaray@hotmail.com" },
    update: { password, emailVerified: true },
    create: {
      username: "yasinyanaray",
      name: "Yasin Yanaray",
      email: "yasinyanaray@hotmail.com",
      password,
      role: "CAPTAIN",
      emailVerified: true,
    },
  });
  console.log("✓ Kullanıcı:", user.name, user.email);

  const existing = await prisma.team.findFirst({
    where: { name: "ECZ", captainId: user.id },
  });

  if (existing) {
    await prisma.team.update({
      where: { id: existing.id },
      data: { players: { deleteMany: {}, create: players } },
    });
    console.log("✓ Oyuncular güncellendi:", players.length);
    return;
  }

  const team = await prisma.team.create({
    data: {
      name: "ECZ",
      captainId: user.id,
      players: { create: players },
    },
    include: { players: true },
  });

  console.log("✓ Takım:", team.name);
  console.log("✓ Oyuncu sayısı:", team.players.length);
  team.players.forEach(p => console.log(`  ${p.number ?? "-"} - ${p.name}`));
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
