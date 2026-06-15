import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const players = [
  { number: 1,    name: "Sezer Aslan" },
  { number: 3,    name: "Tarık Işık" },
  { number: 4,    name: "Yunus Emre Beyazgül" },
  { number: 5,    name: "Onur Pekmez" },
  { number: 7,    name: "Nurettin Yeral" },
  { number: null, name: "Caner Kababıyık" },
  { number: 9,    name: "Sevdar Yılmaz" },
  { number: 10,   name: "Ferdi Coşgun" },
  { number: null, name: "Metin Berber" },
  { number: 16,   name: "Yakup Yoğun" },
  { number: 17,   name: "Hasan Terzi" },
  { number: 13,   name: "Süleyman Elataş" },
  { number: 23,   name: "Yaser Kaplan" },
  { number: 24,   name: "Ali Harbelioğlu" },
  { number: 60,   name: "Yavuz Selim Erol" },
  { number: 99,   name: "Uğurcan Helvacı" },
];

async function main() {
  const password = await bcrypt.hash("hamok2", 12);

  const user = await prisma.user.upsert({
    where: { email: "sami.1reyhan@gmail.com" },
    update: { password, emailVerified: true },
    create: {
      username: "samireyhan",
      name: "Sami Reyhan",
      email: "sami.1reyhan@gmail.com",
      password,
      role: "CAPTAIN",
      emailVerified: true,
    },
  });
  console.log("✓ Kullanıcı:", user.name, user.email);

  const existing = await prisma.team.findFirst({
    where: { name: "HTO", captainId: user.id },
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
      name: "HTO",
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
