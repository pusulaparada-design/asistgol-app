import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const players = [
  { number: 10,   name: "Günay Ali Bilgin" },
  { number: 11,   name: "Abdulmuttalip Eskiocak" },
  { number: 21,   name: "Alaattin Temir" },
  { number: 8,    name: "Ali Yeşil" },
  { number: 4,    name: "Aykut Yılmazlar" },
  { number: null, name: "Cihan Çankır" },
  { number: 99,   name: "Ender Katayıfçı" },
  { number: 3,    name: "Esat Şehit" },
  { number: 1,    name: "Abdulhamit Öğüncü" },
  { number: 5,    name: "Samet Deveci" },
  { number: 6,    name: "Serdal Hasırcı" },
  { number: 39,   name: "Sergen Kavukoğlu" },
  { number: 12,   name: "Sezer Yıldız" },
  { number: 14,   name: "Suphi Yıldız" },
  { number: 15,   name: "Tahir Uçar" },
  { number: 7,    name: "Uğur Boncukçu" },
  { number: 17,   name: "Vural Aslan" },
  { number: 26,   name: "Özgür Boncuk" },
  { number: 20,   name: "Yusuf Alkan" },
  { number: 23,   name: "Kader Feyyadoğlu" },
  { number: 88,   name: "Metin Sönmez" },
];

async function main() {
  const password = await bcrypt.hash("hamok2", 12);

  const user = await prisma.user.upsert({
    where: { email: "bilginmuhasebe@hotmail.com" },
    update: { password, emailVerified: true },
    create: {
      username: "gunayalibilgin",
      name: "Günay Ali Bilgin",
      email: "bilginmuhasebe@hotmail.com",
      password,
      role: "CAPTAIN",
      emailVerified: true,
    },
  });
  console.log("✓ Kullanıcı:", user.name, user.email);

  const existing = await prisma.team.findFirst({
    where: { name: "SMMMO", captainId: user.id },
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
      name: "SMMMO",
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
