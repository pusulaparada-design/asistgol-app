import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const players = [
  { number: 8,  name: "İsmet Ertuğrul Dinçer" },
  { number: null, name: "Erman Koca" },
  { number: 6,  name: "Burak Buru" },
  { number: 9,  name: "Çağlar Barutçu" },
  { number: 4,  name: "Cem Onat Tüfekçi" },
  { number: 7,  name: "Bülent Ergül" },
  { number: 11, name: "Ali Zabunoğlu" },
  { number: 45, name: "Ali Sarcan" },
  { number: 15, name: "Emre Özdemir" },
  { number: 12, name: "İbrahim Düşer" },
  { number: 10, name: "Furkan Demiroğlu" },
  { number: 88, name: "Onur Altınöz" },
  { number: 1,  name: "Ali Şan" },
  { number: 1,  name: "Melih Temel" },
  { number: 38, name: "Muhammed Boğazköy" },
  { number: 21, name: "Yahya Azbay" },
  { number: 14, name: "Zafer Bahan" },
  { number: 20, name: "Onur Canımoğlu" },
  { number: 22, name: "Mehmet Ali Çapar" },
  { number: 2,  name: "Aydın Kolağasıoğlu" },
];

async function main() {
  const password = await bcrypt.hash("hamok2", 12);

  const user = await prisma.user.upsert({
    where: { email: "emreozdemir3@hotmail.com" },
    update: { password, emailVerified: true },
    create: {
      username: "nihatemreozdemir",
      name: "Nihat Emre Özdemir",
      email: "emreozdemir3@hotmail.com",
      password,
      role: "CAPTAIN",
      emailVerified: true,
    },
  });
  console.log("✓ Kullanıcı:", user.name, user.email);

  const existing = await prisma.team.findFirst({
    where: { name: "HKMO", captainId: user.id },
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
      name: "HKMO",
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
