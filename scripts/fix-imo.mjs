import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const players = [
  { number: 1,  name: "Emrah Bal" },
  { number: 2,  name: "Emre Kirkizoğlu" },
  { number: 3,  name: "Muhammed Saçar" },
  { number: 4,  name: "Cevdet Havaioğlu" },
  { number: 5,  name: "Ahmet Haleblioglu" },
  { number: 6,  name: "Bülent Demir" },
  { number: 7,  name: "Mert Ödüncu" },
  { number: 8,  name: "Mehmet Bök" },
  { number: 9,  name: "Mehmet Burak Kaya" },
  { number: 10, name: "Sercan Rende" },
  { number: 11, name: "Mehmet Göktaş" },
  { number: 12, name: "Ömer Faruk Daşkıran" },
  { number: 21, name: "İsmail Emre Yalçın" },
  { number: 25, name: "Mehmet Gürler" },
  { number: 45, name: "Erdem Reyhan" },
  { number: 35, name: "Mehmet Selim Serin" },
  { number: 50, name: "Mutlu Barış Yılmaz" },
  { number: 55, name: "Çağdaş Esmer" },
  { number: 90, name: "Salim Sürmeli" },
  { number: 18, name: "Sercan Deniz Gülü" },
  { number: 18, name: "Cem Cabiroğlu" },
  { number: 23, name: "Nebil İstanbullu" },
];

const team = await prisma.team.findFirst({ where: { name: "IMO" } });
if (!team) { console.error("IMO takımı bulunamadı"); process.exit(1); }

await prisma.team.update({
  where: { id: team.id },
  data: { players: { deleteMany: {}, create: players } },
});

console.log("✓ IMO oyuncuları güncellendi:", players.length);
players.forEach(p => console.log(`  ${p.number} - ${p.name}`));
await prisma.$disconnect();
