import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const players = [
  { number: 99, name: "Abdullah Yüksel" },
  { number: 88, name: "Ali Baklacı" },
  { number: 7,  name: "Can Doksöz" },
  { number: 8,  name: "Doğuş Akbay" },
  { number: 5,  name: "Esat Sağaltıcı" },
  { number: 15, name: "Salih Zorsu" },
  { number: 6,  name: "Gökhan Altundağ" },
  { number: 29, name: "Hıdır Zervent" },
  { number: 77, name: "Kemal Güler" },
  { number: 10, name: "Mehmet Pehlivan" },
  { number: 22, name: "Metin Sağaltıcı" },
  { number: 17, name: "Murat Atılgan" },
  { number: 45, name: "Musa Arslanyürek" },
  { number: 9,  name: "Nezih Toplu" },
  { number: 31, name: "Nihat Mugillioğlu" },
  { number: 19, name: "Okan Yakçi" },
  { number: 1,  name: "Furkan Özkan" },
  { number: 25, name: "Onur Can Yakşi" },
  { number: 26, name: "Tolga Kavvasoğlu" },
  { number: 11, name: "Ümit Sağaltıcı" },
];

async function main() {
  const password = await bcrypt.hash("hamok2", 12);

  const user = await prisma.user.upsert({
    where: { email: "alibaklaci05@gmail.com" },
    update: { password, emailVerified: true },
    create: {
      username: "alibaklaci05",
      name: "Ali Baklacı",
      email: "alibaklaci05@gmail.com",
      password,
      role: "CAPTAIN",
      emailVerified: true,
    },
  });
  console.log("✓ Kullanıcı:", user.name, user.email);

  const existing = await prisma.team.findFirst({
    where: { name: "JMO", captainId: user.id },
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
      name: "JMO",
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
