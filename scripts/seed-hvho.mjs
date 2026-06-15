import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const players = [
  { number: 6,  name: "Yılmaz Boyar" },
  { number: 10, name: "Yahya Hamurcu" },
  { number: 31, name: "Mithat Nalça" },
  { number: 1,  name: "Murat Tayyar" },
  { number: 2,  name: "Ali Büyükbaş" },
  { number: 3,  name: "Mehmet Tuncer" },
  { number: 55, name: "İhsan Şahin Kaya" },
  { number: 7,  name: "Hikmet Baklacı" },
  { number: 11, name: "Sinan Furkan" },
  { number: 23, name: "Rıfat Uçar" },
  { number: 77, name: "Mehmet Efe" },
  { number: 8,  name: "Şahin Sağaltıcı" },
  { number: 1,  name: "Yaşar Keskin" },
  { number: 12, name: "Sait Kalkan" },
  { number: 61, name: "Ufuk Kurul" },
  { number: 20, name: "Ufuk Kaya" },
  { number: 66, name: "Necip Cesur" },
  { number: 14, name: "Hasan Hüseyin Keçeli" },
  { number: 5,  name: "Ahmet Gözer" },
  { number: 9,  name: "Mehmet Açıkbaş" },
];

async function main() {
  const password = await bcrypt.hash("hamok2", 12);

  const user = await prisma.user.upsert({
    where: { email: "mithatnalca@gmail.com" },
    update: { password, emailVerified: true },
    create: {
      username: "mithatnalca",
      name: "Mithat Nalça",
      email: "mithatnalca@gmail.com",
      password,
      role: "CAPTAIN",
      emailVerified: true,
    },
  });
  console.log("✓ Kullanıcı:", user.name, user.email);

  const existing = await prisma.team.findFirst({
    where: { name: "HVHO", captainId: user.id },
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
      name: "HVHO",
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
