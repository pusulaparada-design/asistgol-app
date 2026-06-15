import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const players = [
  { number: 1,  name: "Yusuf Kalacı" },
  { number: 3,  name: "İhsan Cemal Melek" },
  { number: 5,  name: "Göksel Akçay" },
  { number: 6,  name: "Yusuf Özal" },
  { number: 7,  name: "Yavuz Tosyalı" },
  { number: 8,  name: "Mehmet Ferhat İnan" },
  { number: 10, name: "Hakkı Yılmaz" },
  { number: 12, name: "Tezcan Yılmaz" },
  { number: 14, name: "Ali Yılmaz Ekşi" },
  { number: 15, name: "Önder Yoğun" },
  { number: 16, name: "Abdurrahman Cemiloğlu" },
  { number: 17, name: "Faruk Şanlı" },
  { number: 18, name: "Mehmet Güzelyurt" },
  { number: 19, name: "Gökmen Çatal" },
  { number: 21, name: "Emre Alkanat" },
  { number: 23, name: "Ali Yılmaz" },
  { number: 25, name: "Efe Tüfekçi" },
  { number: 39, name: "Burhan Mansuroğlu" },
  { number: 67, name: "Uğur Tokdemir" },
  { number: 89, name: "Can Yuvarlak" },
  { number: 98, name: "Doğukan Narlı" },
];

async function main() {
  const password = await bcrypt.hash("hamok2", 12);

  const user = await prisma.user.upsert({
    where: { email: "gokmencatal@hotmail.com" },
    update: { password, emailVerified: true },
    create: {
      username: "gokmencatal",
      name: "Gökmen Çatal",
      email: "gokmencatal@hotmail.com",
      password,
      role: "CAPTAIN",
      emailVerified: true,
    },
  });
  console.log("✓ Kullanıcı:", user.name, user.email);

  const existing = await prisma.team.findFirst({
    where: { name: "HDHO-2", captainId: user.id },
  });

  if (existing) {
    console.log("! Takım zaten mevcut, oyuncular güncelleniyor...");
    await prisma.team.update({
      where: { id: existing.id },
      data: {
        players: {
          deleteMany: {},
          create: players,
        },
      },
    });
    console.log("✓ Oyuncular güncellendi:", players.length);
    return;
  }

  const team = await prisma.team.create({
    data: {
      name: "HDHO-2",
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
