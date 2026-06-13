import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('DB temizleniyor...')

  await prisma.card.deleteMany()
  console.log('✓ Card')

  await prisma.assist.deleteMany()
  console.log('✓ Assist')

  await prisma.goal.deleteMany()
  console.log('✓ Goal')

  await prisma.announcement.deleteMany()
  console.log('✓ Announcement')

  await prisma.groupTeam.deleteMany()
  console.log('✓ GroupTeam')

  await prisma.teamRegistration.deleteMany()
  console.log('✓ TeamRegistration')

  await prisma.match.deleteMany()
  console.log('✓ Match')

  await prisma.group.deleteMany()
  console.log('✓ Group')

  await prisma.player.deleteMany()
  console.log('✓ Player')

  await prisma.team.deleteMany()
  console.log('✓ Team')

  await prisma.tournament.deleteMany()
  console.log('✓ Tournament')

  await prisma.user.deleteMany()
  console.log('✓ User')

  console.log('\n✅ DB tamamen temizlendi!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
