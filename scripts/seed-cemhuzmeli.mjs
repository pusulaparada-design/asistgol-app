import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const players = [
  { number: 2,  name: "Gökhan Bahçeci" },
  { number: 3,  name: "Batuhan Sev" },
  { number: 4,  name: "Faruk Şenses" },
  { number: 5,  name: "Canberk Adalan" },
  { number: 6,  name: "Mehmet Güler" },
  { number: 7,  name: "Eser Sakallı" },
  { number: 8,  name: "Selim Çiçek" },
  { number: 9,  name: "Bahri Çiçek" },
  { number: 10, name: "Mehmet Haleblioglu" },
  { number: 11, name: "Ali Odacı" },
  { number: 12, name: "Caner Hayret" },
  { number: 13, name: "Umut Rende" },
  { number: 14, name: "Hasan Ekiz" },
  { number: 15, name: "Şekip Kurt" },
  { number: 16, name: "Alican Doğruel" },
  { number: 17, name: "Mehmet Uçar" },
  { number: 18, name: "Ali Doğru" },
  { number: 19, name: "Ali Kabakulak" },
  { number: 20, name: "Muhammed Mahmut Tıraşlı" },
  { number: 23, name: "Mehmet Can Erdoğan" },
  { number: 31, name: "Zahi Reyhanioğlu" },
];

async function main() {
  const password = await bcrypt.hash("hamok2", 12);

  const user = await prisma.user.upsert({
    where: { email: "cem.huzmeli@gmail.com" },
    update: { password, emailVerified: true },
    create: {
      username: "cemhuzmeli",
      name: "Cem Hüzmeli",
      email: "cem.huzmeli@gmail.com",
      password,
      role: "CAPTAIN",
      emailVerified: true,
    },
  });
  console.log("✓ Kullanıcı:", user.name, user.email);

  const existing = await prisma.team.findFirst({
    where: { name: "EMO", captainId: user.id },
  });

  if (existing) {
    console.log("! Takım zaten mevcut, oyuncular güncelleniyor...");
    await prisma.team.update({
      where: { id: existing.id },
      data: { players: { deleteMany: {}, create: players } },
    });
    console.log("✓ Oyuncular güncellendi:", players.length);
    return;
  }

  const team = await prisma.team.create({
    data: {
      name: "EMO",
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
