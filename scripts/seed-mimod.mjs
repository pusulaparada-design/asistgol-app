import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const players = [
  { number: 10,   name: "Artaç Oflazoğlu" },
  { number: 4,    name: "Mehmet Ali Behzetoğlu" },
  { number: 3,    name: "İsmail Tahiroğlu" },
  { number: 1,    name: "Adnan Çıray" },
  { number: 12,   name: "Mahmut Dalyan" },
  { number: null, name: "Edip Selim Çiftçi" },
  { number: 7,    name: "Utku Bulgurcu" },
  { number: 17,   name: "Asil Cem Fırıncıoğulları" },
  { number: 9,    name: "Sergen Ekşi" },
  { number: 23,   name: "Murat Saka" },
  { number: 16,   name: "Sezer Kızgindemir" },
  { number: 19,   name: "Zafer Oflazoğlu" },
  { number: 21,   name: "Toprak Kavvasoğlu" },
  { number: 6,    name: "Ali Hasan Karataş" },
  { number: 18,   name: "Mehmet Öztaş" },
  { number: 8,    name: "Okan Özal" },
  { number: 5,    name: "Barış Çiçek" },
  { number: 13,   name: "Mesut Güler" },
  { number: 11,   name: "Mert Mansuroğlu" },
  { number: 20,   name: "Onur Gündüz" },
  { number: 15,   name: "Kaya Aksu" },
];

async function main() {
  const password = await bcrypt.hash("hamok2", 12);

  const user = await prisma.user.upsert({
    where: { email: "dalkiranmehmet97@gmail.com" },
    update: { password, emailVerified: true },
    create: {
      username: "mehmetdalgakiran",
      name: "Mehmet Dalgakıran",
      email: "dalkiranmehmet97@gmail.com",
      password,
      role: "CAPTAIN",
      emailVerified: true,
    },
  });
  console.log("✓ Kullanıcı:", user.name, user.email);

  const existing = await prisma.team.findFirst({
    where: { name: "MİMOD", captainId: user.id },
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
      name: "MİMOD",
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
