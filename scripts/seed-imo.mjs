import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const players = [
  { number: 2,  name: "Emre Yurtseven" },
  { number: 4,  name: "Ömer Faruk Camcı" },
  { number: 7,  name: "Önder Kerem Duman" },
  { number: 9,  name: "Necdet Çapar" },
  { number: 11, name: "Doğuşkan Dövüşken" },
  { number: 13, name: "Erdem Çiçek" },
  { number: 18, name: "Mehmet Teker" },
  { number: 22, name: "Barış Cem Dönmez" },
  { number: 23, name: "Mehmet Özdenır" },
  { number: 26, name: "Ali Miçooğulları" },
  { number: 31, name: "Bora Gezici" },
  { number: 32, name: "İbrahim Kababıyık" },
  { number: 35, name: "Mehmet Ali Deniz" },
  { number: 44, name: "İlke Can Tabak" },
  { number: 45, name: "Hasan Alyar" },
  { number: 55, name: "Emin Çapar" },
  { number: 73, name: "Temim Çiçek" },
  { number: 77, name: "Mehmet Küçük" },
  { number: 88, name: "Ali Turunç" },
  { number: 98, name: "Oktay Aslan" },
];

async function main() {
  const password = await bcrypt.hash("hamok2", 12);

  const user = await prisma.user.upsert({
    where: { email: "ahmthlpli@gmail.com" },
    update: { password, emailVerified: true },
    create: {
      username: "ahmethalepli",
      name: "Ahmet Halepli",
      email: "ahmthlpli@gmail.com",
      password,
      role: "CAPTAIN",
      emailVerified: true,
    },
  });
  console.log("✓ Kullanıcı:", user.name, user.email);

  const existing = await prisma.team.findFirst({
    where: { name: "IMO", captainId: user.id },
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
      name: "IMO",
      captainId: user.id,
      players: { create: players },
    },
    include: { players: true },
  });

  console.log("✓ Takım:", team.name);
  console.log("✓ Oyuncu sayısı:", team.players.length);
  team.players.forEach(p => console.log(`  ${p.number} - ${p.name}`));
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
