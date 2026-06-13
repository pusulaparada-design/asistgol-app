import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const TOURNAMENT_NAME = '2.Geleneksel HAMOK Futbol Turnuvası'
const PASSWORD_PLAIN = 'Hamok2026!'

// 12 farklı isim havuzu — her takım kendi diliminden çeker
const NAME_POOL = [
  ['Kemal','Arslan'],['Berk','Şahin'],['Onur','Kaya'],['Emre','Yıldız'],['Tolga','Demir'],
  ['Uğur','Çelik'],['Sercan','Doğan'],['Cem','Aydın'],['Volkan','Kurt'],['Arda','Polat'],
  ['Ozan','Güneş'],['Murat','Aslan'],['Ahmet','Tekin'],['Mehmet','Bulut'],['Mustafa','Coşkun'],
  ['Ali','Kılıç'],['Hasan','Aktaş'],['Hüseyin','Öztürk'],['İbrahim','Yılmaz'],['Ömer','Karaca'],
  ['Yusuf','Koç'],['Burak','Şimşek'],['Serhat','Çetin'],['Deniz','Acar'],['Caner','Erdoğan'],
  ['Furkan','Doğru'],['Berkay','Keskin'],['Haluk','Sağlam'],['Taner','Kaplan'],['Kadir','Güler'],
  ['Sinan','Başar'],['Fatih','Özkan'],['Gökhan','Demirci'],['Barış','Tuncer'],['Selçuk','Ercan'],
  ['Cenk','Özdemir'],['Tayfun','Balcı'],['Harun','Çınar'],['Alper','Topal'],['Ercan','Yavuz'],
  ['Suat','Koca'],['Nevzat','Bozkurt'],['Levent','Özer'],['İlker','Parlak'],['Orhan','Çakır'],
  ['Ramazan','Şen'],['Zafer','Duman'],['Melih','Altun'],['Kaan','Bayrak'],['Emir','Uzun'],
  ['Aykut','Güçlü'],['Efe','Aydoğdu'],['Tarık','Baş'],['Bayram','Solmaz'],['Rıdvan','Karadağ'],
  ['Özgür','Yener'],['Tuncay','Önal'],['Serdar','Kırmızı'],['Atakan','Sarı'],['Doğan','Sever'],
  ['Mücahit','Yücel'],['Oğuzhan','Bakır'],['Nazım','Güngör'],['Hamit','Karakuş'],['Gürkan','Sezer'],
  ['Cengiz','Tuna'],['Erdal','Ekici'],['Rauf','Özcan'],['Sadık','Fidan'],['Bülent','Sönmez'],
  ['Altan','Ünal'],['Engin','Yıldırım'],['Cumhur','Şanal'],['Ferdi','Hacıoğlu'],['Boran','Tepe'],
  ['Mert','Özgül'],['Cenker','Karagöz'],['Yiğit','Bayar'],['Tunahan','Alkan'],['İsmail','Gür'],
  ['Zeki','Yüksel'],['Coşkun','Kara'],['Şevket','Elmas'],['Ersin','Nalbant'],['Oktay','Koray'],
  ['Bilal','Yılmaz'],['Taylan','Kırca'],['Veysel','Osman'],['Şükrü','Kaçmaz'],['Remzi','Pala'],
  ['Nazif','Türk'],['Şahin','Vardar'],['Sedat','Koyuncu'],['Kahraman','Zorlu'],['Tarkan','Sevgi'],
  ['Salih','Temel'],['Mesut','Özdil'],['Seyfettin','Yazıcı'],['Nail','Bilgen'],['Vedat','Saraç'],
  ['Sezai','Toprak'],['Fahri','Tosun'],['Erol','Yurt'],['Şener','Baş'],['Münir','Konuk'],
  ['Devrim','Aras'],['Eyüp','Dinç'],['Hayati','Öney'],['Cahit','Erbil'],['Mevlüt','Demirkol'],
  ['Nuri','Tataroğlu'],['Tamer','Ceylan'],['Yener','Süzer'],['Bekir','Temur'],['Celal','Bostan'],
  ['Özcan','Güven'],['Erdoğan','Boz'],['Kanat','Uzuner'],['Turgut','Efe'],['Latif','Kul'],
  ['Şerafettin','Çakar'],['Fethi','Altınkaya'],['Necati','Gençer'],['Hıfzı','Kotan'],['Lütfi','Sever'],
  ['Vedat','Aksoy'],['Tuncay','Başaran'],['Ozan','Demirtaş'],['Kürşat','Yalçın'],['Sami','Karataş'],
  ['Hilmi','Dalgıç'],['Ragıp','Sözen'],['Atilla','Çağlar'],['Metin','Özgür'],['Ümit','Duran'],
  ['Feridun','Kaptan'],['Hüsnü','Açık'],['Talat','Özçelik'],['Namık','Kavak'],['Adnan','Erdem'],
]

const POSITIONS = [
  'Kaleci',
  'Defans','Defans','Defans','Defans',
  'Orta Saha','Orta Saha','Orta Saha',
  'Forvet','Forvet','Forvet','Forvet',
]

const TEAMS = [
  { name: 'Diş Hekimleri 1',      group: 'A Grubu', captainIdx: 0   },
  { name: 'Makine Mühendisleri',   group: 'A Grubu', captainIdx: 12  },
  { name: 'Mimarlar',              group: 'A Grubu', captainIdx: 24  },
  { name: 'Harita Mühendisleri',   group: 'A Grubu', captainIdx: 36  },
  { name: 'Tabipler',              group: 'A Grubu', captainIdx: 48  },
  { name: 'Muhasebeciler',         group: 'A Grubu', captainIdx: 60  },
  { name: 'Diş Hekimleri 2',       group: 'B Grubu', captainIdx: 72  },
  { name: 'İnşaat Mühendisleri',   group: 'B Grubu', captainIdx: 84  },
  { name: 'Elektrik Mühendisleri', group: 'B Grubu', captainIdx: 96  },
  { name: 'Jeoloji Mühendisleri',  group: 'B Grubu', captainIdx: 108 },
  { name: 'Eczacılar',             group: 'B Grubu', captainIdx: 120 },
  { name: 'Veteriner Hekimler',    group: 'B Grubu', captainIdx: 132 },
]

function slugify(str) {
  return str.toLocaleLowerCase('tr')
    .replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s')
    .replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c')
    .replace(/[^a-z0-9]/g,'')
}

async function uniqueUsername(base) {
  const exists = await prisma.user.findUnique({ where: { username: base } })
  if (!exists) return base
  let i = 2
  while (true) {
    const c = `${base}${i}`
    if (!await prisma.user.findUnique({ where: { username: c } })) return c
    i++
  }
}

async function main() {
  const tournament = await prisma.tournament.findFirst({
    where: { name: { contains: 'HAMOK' } },
  })
  if (!tournament) {
    console.error('Turnuva bulunamadı! Önce turnuvayı oluştur.')
    process.exit(1)
  }
  console.log(`✓ Turnuva: ${tournament.name} (${tournament.id})`)

  const hashed = await bcrypt.hash(PASSWORD_PLAIN, 10)

  // Grupları oluştur (yoksa)
  const groups = {}
  for (const groupName of ['A Grubu', 'B Grubu']) {
    let group = await prisma.group.findFirst({
      where: { tournamentId: tournament.id, name: groupName },
    })
    if (!group) {
      group = await prisma.group.create({
        data: { name: groupName, tournamentId: tournament.id },
      })
      console.log(`  ✓ Grup oluşturuldu: ${groupName}`)
    } else {
      console.log(`  • Grup mevcut: ${groupName}`)
    }
    groups[groupName] = group
  }

  console.log('\nTakımlar oluşturuluyor...')

  const results = []

  for (const teamDef of TEAMS) {
    const captainName = NAME_POOL[teamDef.captainIdx]
    const captainFirst = captainName[0]
    const captainLast  = captainName[1]
    const captainFullName = `${captainFirst} ${captainLast}`
    const usernameBase = slugify(`${captainFirst}${captainLast}`)
    const username = await uniqueUsername(usernameBase)
    const email = `${username}@hamok.test`

    // Kaptan kullanıcısı
    let captainUser = await prisma.user.findUnique({ where: { username } })
    if (!captainUser) {
      captainUser = await prisma.user.create({
        data: {
          username,
          password: hashed,
          role: 'CAPTAIN',
          name: captainFullName,
          email,
        },
      })
    }

    // Takım
    let team = await prisma.team.findFirst({
      where: { name: teamDef.name, captainId: captainUser.id },
    })
    if (!team) {
      team = await prisma.team.create({
        data: { name: teamDef.name, captainId: captainUser.id },
      })
    }

    // Oyuncular (12 kişi, ilki kaptan)
    const existingCount = await prisma.player.count({ where: { teamId: team.id } })
    if (existingCount === 0) {
      const players = [
        { name: captainFullName, number: 10, position: 'Orta Saha' },
      ]
      for (let i = 1; i < 12; i++) {
        const p = NAME_POOL[teamDef.captainIdx + i] ?? NAME_POOL[(teamDef.captainIdx + i) % NAME_POOL.length]
        players.push({
          name: `${p[0]} ${p[1]}`,
          number: i + 1,
          position: POSITIONS[i] ?? 'Forvet',
        })
      }
      await prisma.player.createMany({
        data: players.map(p => ({ ...p, teamId: team.id })),
      })
    }

    // Turnuva kaydı
    let reg = await prisma.teamRegistration.findUnique({
      where: { teamId_tournamentId: { teamId: team.id, tournamentId: tournament.id } },
    })
    if (!reg) {
      reg = await prisma.teamRegistration.create({
        data: {
          teamId: team.id,
          tournamentId: tournament.id,
          status: 'APPROVED',
          paid: true,
        },
      })
    }

    // Gruba ekle
    const existingGT = await prisma.groupTeam.findFirst({
      where: { groupId: groups[teamDef.group].id, teamId: team.id },
    })
    if (!existingGT) {
      await prisma.groupTeam.create({
        data: {
          groupId: groups[teamDef.group].id,
          teamId: team.id,
          registrationId: reg.id,
        },
      })
    }

    results.push({ team: teamDef.name, captain: captainFullName, username, email })
    console.log(`  ✓ ${teamDef.group} — ${teamDef.name} | Kaptan: ${captainFullName} (@${username})`)
  }

  console.log('\n✅ Tamamlandı!')
  console.log('\n── Kaptan Hesapları ──────────────────────────────────')
  console.log('Şifre (hepsi):', PASSWORD_PLAIN)
  console.log('─────────────────────────────────────────────────────')
  for (const r of results) {
    console.log(`${r.team.padEnd(25)} @${r.username}`)
  }
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
