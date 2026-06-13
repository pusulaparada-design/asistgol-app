import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const t = await prisma.tournament.findFirst({ where: { name: { contains: 'HAMOK' } } })
const r = await prisma.teamRegistration.updateMany({
  where: { tournamentId: t.id },
  data: { status: 'PENDING', paid: false },
})
console.log(`${r.count} kayıt → PENDING / ödenmedi`)
await prisma.$disconnect()
