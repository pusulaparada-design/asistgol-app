import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const players = [
  { number: 1,    name: "Hayrullah İstanbullu" },
  { number: 82,   name: "Hakan Temiz" },
  { number: 31,   name: "Tolga Temizsoy" },
  { number: 0,    name: "Ahmet Geneş" },
  { number: 17,   name: "Ali Şahutoğlu" },
  { number: 15,   name: "Bereket Bozoğlan" },
  { number: 11,   name: "Çağrı Büyükaşik" },
  { number: 69,   name: "İlker Yeter" },
  { number: null, name: "Mehmet Akif Yılmaz" },
  { number: 22,   name: "Merter Yunus Öztürk" },
  { number: 77,   name: "Önder Altınöz" },
  { number: 7,    name: "Remzi Kalaycıoğlu" },
  { number: 9,    name: "Semih Ersözlü" },
  { number: 10,   name: "Süleyman Göçer" },
  { number: 5,    name: "Süleyman Çiçekli" },
  { number: 12,   name: "Süleyman Özer" },
  { number: 19,   name: "Volkan Gültekin" },
  { number: 6,    name: "Yusuf Köse" },
  { number: 13,   name: "Mehmet Özkan" },
  { number: null, name: "Mahmut Sami" },
  { number: 45,   name: "Cumhur Yıldız" },
];

async function main() {
  const password = await bcrypt.hash("hamok2", 12);

  const user = await prisma.user.upsert({
    where: { email: "tolgatemzsoy@gmail.com" },
    update: { password, emailVerified: true },
    create: {
      username: "tolgatemzsoy",
      name: "Tolga Temizsoy",
      email: "tolgatemzsoy@gmail.com",
      password,
      role: "CAPTAIN",
      emailVerified: true,
    },
  });
  console.log("✓ Kullanıcı:", user.name, user.email);

  const existing = await prisma.team.findFirst({
    where: { name: "MMO", captainId: user.id },
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
      name: "MMO",
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
