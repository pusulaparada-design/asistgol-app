import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seed başlıyor...");

  // ─── Kullanıcılar ─────────────────────────────────────────────
  const hash = (p: string) => bcrypt.hash(p, 12);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: await hash("123"),
      role: "ADMIN",
      name: "Platform Admin",
      email: "admin@asistgol.com",
      city: "İstanbul",
    },
  });

  const organizer = await prisma.user.upsert({
    where: { username: "organizator" },
    update: {},
    create: {
      username: "organizator",
      password: await hash("123"),
      role: "ORGANIZER",
      name: "Ahmet Yılmaz",
      email: "ahmet@bosphorus.com",
      phone: "0532 111 22 33",
      city: "İstanbul",
    },
  });

  const captain = await prisma.user.upsert({
    where: { username: "takim" },
    update: {},
    create: {
      username: "takim",
      password: await hash("123"),
      role: "CAPTAIN",
      name: "Murat Arslan",
      email: "murat@aslanfc.com",
      phone: "0543 222 33 44",
      city: "İstanbul",
    },
  });

  // Ek kaptan hesabı (takımlarım sayfasında 2 takım görmek için)
  const captain2 = await prisma.user.upsert({
    where: { username: "kaptan2" },
    update: {},
    create: {
      username: "kaptan2",
      password: await hash("123"),
      role: "CAPTAIN",
      name: "Serdar Öz",
      email: "serdar@kaplanfc.com",
      phone: "0555 333 44 55",
      city: "Ankara",
    },
  });

  console.log("✓ Kullanıcılar oluşturuldu");

  // ─── Turnuvalar ───────────────────────────────────────────────
  const ramazan = await prisma.tournament.upsert({
    where: { id: "tournament-ramazan-2026" },
    update: {},
    create: {
      id: "tournament-ramazan-2026",
      name: "Ramazan Kupası 2026",
      description: "İstanbul'un en büyük halı saha turnuvası",
      city: "İstanbul",
      venue: "Bosphorus Halı Saha",
      format: "GROUP_KNOCKOUT",
      status: "ACTIVE",
      maxTeams: 16,
      fee: 600,
      prize: "₺4.000",
      rules: "Her takım en az 7, en fazla 14 oyuncu. 2×20 dakika. 3. sarı kartta 1 maç ceza.",
      groupCount: 4,
      advanceCount: 2,
      matchFormat: "SINGLE",
      winPoints: 3,
      trackGoals: true,
      trackCards: true,
      yellowCardLimit: 3,
      thirdPlace: true,
      extraTime: true,
      organizerId: organizer.id,
      startDate: new Date("2026-05-20"),
      endDate: new Date("2026-06-30"),
      deadline: new Date("2026-05-18"),
    },
  });

  const yazligi = await prisma.tournament.upsert({
    where: { id: "tournament-yaz-ligi-2026" },
    update: {},
    create: {
      id: "tournament-yaz-ligi-2026",
      name: "Yaz Ligi 2026",
      description: "8 takımlı round-robin lig turnuvası",
      city: "İstanbul",
      venue: "Yıldız Arena",
      format: "GROUP_ONLY",
      status: "ACTIVE",
      maxTeams: 8,
      fee: 0,
      prize: "Kupa",
      groupCount: 1,
      advanceCount: 0,
      matchFormat: "DOUBLE",
      winPoints: 3,
      trackGoals: true,
      trackCards: true,
      yellowCardLimit: 3,
      thirdPlace: false,
      extraTime: false,
      organizerId: organizer.id,
      startDate: new Date("2026-06-01"),
      endDate: new Date("2026-07-15"),
      deadline: new Date("2026-05-28"),
    },
  });

  const aksamKupasi = await prisma.tournament.upsert({
    where: { id: "tournament-aksam-kupasi" },
    update: {},
    create: {
      id: "tournament-aksam-kupasi",
      name: "Akşam Kupası",
      city: "İstanbul",
      venue: "Bosphorus Halı Saha",
      format: "KNOCKOUT_ONLY",
      status: "REGISTRATION",
      maxTeams: 8,
      fee: 500,
      prize: "₺2.000",
      groupCount: null,
      advanceCount: null,
      matchFormat: "SINGLE",
      winPoints: 3,
      trackGoals: true,
      trackCards: true,
      yellowCardLimit: 3,
      thirdPlace: true,
      extraTime: true,
      organizerId: organizer.id,
      startDate: new Date("2026-06-20"),
      endDate: new Date("2026-07-05"),
      deadline: new Date("2026-06-18"),
    },
  });

  console.log("✓ Turnuvalar oluşturuldu");

  // ─── Gruplar (Ramazan Kupası) ─────────────────────────────────
  const grupA = await prisma.group.upsert({
    where: { id: "group-ramazan-a" },
    update: {},
    create: { id: "group-ramazan-a", name: "Grup A", tournamentId: ramazan.id },
  });
  const grupB = await prisma.group.upsert({
    where: { id: "group-ramazan-b" },
    update: {},
    create: { id: "group-ramazan-b", name: "Grup B", tournamentId: ramazan.id },
  });
  const grupC = await prisma.group.upsert({
    where: { id: "group-ramazan-c" },
    update: {},
    create: { id: "group-ramazan-c", name: "Grup C", tournamentId: ramazan.id },
  });
  const grupD = await prisma.group.upsert({
    where: { id: "group-ramazan-d" },
    update: {},
    create: { id: "group-ramazan-d", name: "Grup D", tournamentId: ramazan.id },
  });

  // Yaz Ligi grubu
  const yazGrup = await prisma.group.upsert({
    where: { id: "group-yaz-ligi" },
    update: {},
    create: { id: "group-yaz-ligi", name: "Lig", tournamentId: yazligi.id },
  });

  console.log("✓ Gruplar oluşturuldu");

  // ─── Takımlar ─────────────────────────────────────────────────
  const teams = [
    { id: "team-aslan",   name: "Aslan FC",    city: "İstanbul", captainId: captain.id },
    { id: "team-kaplan",  name: "Kaplan SK",   city: "Ankara",   captainId: captain2.id },
    { id: "team-cinar",   name: "Çınar FC",    city: "İstanbul", captainId: captain.id },
    { id: "team-ruzgar",  name: "Rüzgar Spor", city: "İzmir",    captainId: captain2.id },
    { id: "team-ates",    name: "Ateş FC",     city: "Bursa",    captainId: captain2.id },
    { id: "team-demir",   name: "Demir SK",    city: "Adana",    captainId: captain2.id },
    { id: "team-firtina", name: "Fırtına FC",  city: "İstanbul", captainId: captain2.id },
    { id: "team-simsek",  name: "Şimşek SK",   city: "Ankara",   captainId: captain2.id },
  ];

  for (const t of teams) {
    await prisma.team.upsert({
      where: { id: t.id },
      update: {},
      create: t,
    });
  }

  // ─── Oyuncular (Aslan FC için detaylı) ────────────────────────
  const aslanPlayers = [
    { name: "Hüseyin Ay",    number: 1,  position: "Kaleci" },
    { name: "Onur Yıldız",   number: 2,  position: "Defans" },
    { name: "Taner Çetin",   number: 3,  position: "Defans" },
    { name: "Sefa Güneş",    number: 4,  position: "Defans" },
    { name: "Kemal Doğan",   number: 5,  position: "Defans" },
    { name: "Alp Kaya",      number: 6,  position: "Orta Saha", status: "SUSPENDED" as const },
    { name: "Serhat Boş",    number: 7,  position: "Forvet",    status: "INJURED" as const },
    { name: "Berk Yılmaz",   number: 8,  position: "Orta Saha" },
    { name: "Murat Arslan",  number: 9,  position: "Forvet" },
    { name: "Can Öz",        number: 10, position: "Orta Saha" },
    { name: "Emre Demir",    number: 11, position: "Forvet" },
    { name: "Barış Tunç",    number: 12, position: "Kaleci" },
  ];

  // Oyuncu ID'lerini sakla
  const playerIds: Record<string, string> = {};
  for (const p of aslanPlayers) {
    const existing = await prisma.player.findFirst({
      where: { teamId: "team-aslan", number: p.number },
    });
    if (!existing) {
      const created = await prisma.player.create({
        data: { ...p, teamId: "team-aslan", status: p.status ?? "ACTIVE" },
      });
      playerIds[p.name] = created.id;
    } else {
      playerIds[p.name] = existing.id;
    }
  }

  // Diğer takımlar için temel oyuncular
  const otherTeamPlayers: Record<string, string[]> = {
    "team-kaplan":  ["Serdar Öz", "Ali K", "Veli K", "Ahmet K", "Mehmet K", "Osman K", "Hasan K", "İbrahim K", "Yusuf K", "Musa K", "İsa K"],
    "team-cinar":   ["Baran Kurt", "Can C", "Ali C", "Veli C", "Ahmet C", "Mehmet C", "Osman C", "Hasan C", "İbrahim C", "Yusuf C", "Musa C"],
    "team-ruzgar":  ["Tolga Ak", "Can R", "Ali R", "Veli R", "Ahmet R", "Mehmet R", "Osman R", "Hasan R", "İbrahim R", "Yusuf R", "Musa R"],
    "team-ates":    ["Özgür Can", "Can A", "Ali A", "Veli A", "Ahmet A", "Mehmet A", "Osman A", "Hasan A", "İbrahim A", "Yusuf A"],
    "team-demir":   ["Emre Yol", "Can D", "Ali D", "Veli D", "Ahmet D", "Mehmet D", "Osman D", "Hasan D", "İbrahim D"],
    "team-firtina": ["Ali Güç", "Can F", "Ali F", "Veli F", "Ahmet F", "Mehmet F", "Osman F", "Hasan F", "İbrahim F", "Yusuf F", "Musa F"],
    "team-simsek":  ["Veli Hız", "Can S", "Ali S", "Veli S", "Ahmet S", "Mehmet S", "Osman S", "Hasan S", "İbrahim S", "Yusuf S"],
  };

  for (const [teamId, names] of Object.entries(otherTeamPlayers)) {
    for (let i = 0; i < names.length; i++) {
      const existing = await prisma.player.findFirst({ where: { teamId, name: names[i] } });
      if (!existing) {
        const p = await prisma.player.create({
          data: { name: names[i], number: i + 1, teamId },
        });
        if (teamId === "team-kaplan" && names[i] === "Serdar Öz") playerIds["Serdar Öz"] = p.id;
        if (teamId === "team-cinar"  && names[i] === "Baran Kurt") playerIds["Baran Kurt"] = p.id;
        if (teamId === "team-ruzgar" && names[i] === "Tolga Ak")   playerIds["Tolga Ak"]   = p.id;
      }
    }
  }

  console.log("✓ Takımlar ve oyuncular oluşturuldu");

  // ─── Kayıtlar ─────────────────────────────────────────────────
  const registrations = [
    { id: "reg-aslan-ramazan",   teamId: "team-aslan",   tournamentId: ramazan.id,  status: "APPROVED", groupId: grupA.id },
    { id: "reg-cinar-ramazan",   teamId: "team-cinar",   tournamentId: ramazan.id,  status: "APPROVED", groupId: grupA.id },
    { id: "reg-kaplan-ramazan",  teamId: "team-kaplan",  tournamentId: ramazan.id,  status: "APPROVED", groupId: grupA.id },
    { id: "reg-ates-ramazan",    teamId: "team-ates",    tournamentId: ramazan.id,  status: "APPROVED", groupId: grupA.id },
    { id: "reg-ruzgar-ramazan",  teamId: "team-ruzgar",  tournamentId: ramazan.id,  status: "APPROVED", groupId: grupB.id },
    { id: "reg-demir-ramazan",   teamId: "team-demir",   tournamentId: ramazan.id,  status: "APPROVED", groupId: grupB.id },
    { id: "reg-firtina-ramazan", teamId: "team-firtina", tournamentId: ramazan.id,  status: "APPROVED", groupId: grupB.id },
    { id: "reg-simsek-ramazan",  teamId: "team-simsek",  tournamentId: ramazan.id,  status: "APPROVED", groupId: grupB.id },
    { id: "reg-aslan-yaz",       teamId: "team-aslan",   tournamentId: yazligi.id,  status: "APPROVED", groupId: yazGrup.id },
    { id: "reg-kaplan-yaz",      teamId: "team-kaplan",  tournamentId: yazligi.id,  status: "APPROVED", groupId: yazGrup.id },
    { id: "reg-ruzgar-yaz",      teamId: "team-ruzgar",  tournamentId: yazligi.id,  status: "APPROVED", groupId: yazGrup.id },
    { id: "reg-cinar-yaz",       teamId: "team-cinar",   tournamentId: yazligi.id,  status: "APPROVED", groupId: yazGrup.id },
    { id: "reg-aslan-aksam",     teamId: "team-aslan",   tournamentId: aksamKupasi.id, status: "PENDING",   groupId: null },
    { id: "reg-ruzgar-aksam",    teamId: "team-ruzgar",  tournamentId: aksamKupasi.id, status: "APPROVED",  groupId: null },
  ];

  for (const r of registrations) {
    const existing = await prisma.teamRegistration.findUnique({ where: { id: r.id } });
    if (!existing) {
      const reg = await prisma.teamRegistration.create({
        data: {
          id: r.id,
          teamId: r.teamId,
          tournamentId: r.tournamentId,
          status: r.status as "APPROVED" | "PENDING",
        },
      });

      if (r.groupId && r.status === "APPROVED") {
        await prisma.groupTeam.upsert({
          where: { groupId_teamId: { groupId: r.groupId, teamId: r.teamId } },
          create: { groupId: r.groupId, teamId: r.teamId, registrationId: reg.id },
          update: {},
        });
      }
    }
  }

  console.log("✓ Kayıtlar oluşturuldu");

  // ─── Maçlar (Ramazan Kupası Grup A) ──────────────────────────
  const matchSeed = [
    { id: "m-ra-1", tournamentId: ramazan.id, groupId: grupA.id, homeTeamId: "team-aslan",  awayTeamId: "team-kaplan", homeScore: 3, awayScore: 1, status: "PLAYED", date: new Date("2026-05-25T18:00:00"), venue: "Bosphorus S.1" },
    { id: "m-ra-2", tournamentId: ramazan.id, groupId: grupA.id, homeTeamId: "team-cinar",  awayTeamId: "team-ates",   homeScore: 4, awayScore: 1, status: "PLAYED", date: new Date("2026-05-25T19:30:00"), venue: "Bosphorus S.2" },
    { id: "m-ra-3", tournamentId: ramazan.id, groupId: grupA.id, homeTeamId: "team-aslan",  awayTeamId: "team-cinar",  homeScore: 1, awayScore: 1, status: "PLAYED", date: new Date("2026-05-28T18:00:00"), venue: "Bosphorus S.1" },
    { id: "m-ra-4", tournamentId: ramazan.id, groupId: grupA.id, homeTeamId: "team-kaplan", awayTeamId: "team-ates",   homeScore: 2, awayScore: 0, status: "PLAYED", date: new Date("2026-05-28T19:30:00"), venue: "Bosphorus S.2" },
    { id: "m-ra-5", tournamentId: ramazan.id, groupId: grupA.id, homeTeamId: "team-aslan",  awayTeamId: "team-ates",   homeScore: 2, awayScore: 0, status: "PLAYED", date: new Date("2026-06-01T18:00:00"), venue: "Bosphorus S.1" },
    { id: "m-ra-6", tournamentId: ramazan.id, groupId: grupA.id, homeTeamId: "team-kaplan", awayTeamId: "team-cinar",  homeScore: null, awayScore: null, status: "SCHEDULED", date: new Date("2026-06-08T21:00:00"), venue: "Bosphorus S.1" },
    { id: "m-rb-1", tournamentId: ramazan.id, groupId: grupB.id, homeTeamId: "team-ruzgar", awayTeamId: "team-firtina", homeScore: 3, awayScore: 0, status: "PLAYED", date: new Date("2026-05-26T18:00:00"), venue: "Bosphorus S.2" },
    { id: "m-rb-2", tournamentId: ramazan.id, groupId: grupB.id, homeTeamId: "team-demir",  awayTeamId: "team-simsek",  homeScore: 2, awayScore: 1, status: "PLAYED", date: new Date("2026-05-26T19:30:00"), venue: "Bosphorus S.1" },
    { id: "m-rb-3", tournamentId: ramazan.id, groupId: grupB.id, homeTeamId: "team-ruzgar", awayTeamId: "team-demir",   homeScore: 2, awayScore: 1, status: "PLAYED", date: new Date("2026-06-01T19:30:00"), venue: "Bosphorus S.2" },
    { id: "m-rb-4", tournamentId: ramazan.id, groupId: grupB.id, homeTeamId: "team-firtina", awayTeamId: "team-simsek", homeScore: null, awayScore: null, status: "LIVE", date: new Date("2026-06-08T18:00:00"), venue: "Bosphorus S.2" },
  ];

  for (const m of matchSeed) {
    await prisma.match.upsert({
      where: { id: m.id },
      update: { status: m.status as any },
      create: { ...m, status: m.status as any },
    });
  }

  console.log("✓ Maçlar oluşturuldu");

  // ─── Goller ───────────────────────────────────────────────────
  if (playerIds["Emre Demir"]) {
    const goalData = [
      { matchId: "m-ra-1", playerId: playerIds["Emre Demir"], teamId: "team-aslan", minute: 12 },
      { matchId: "m-ra-1", playerId: playerIds["Murat Arslan"] ?? playerIds["Emre Demir"], teamId: "team-aslan", minute: 34 },
      { matchId: "m-ra-1", playerId: playerIds["Emre Demir"], teamId: "team-aslan", minute: 67 },
      { matchId: "m-ra-3", playerId: playerIds["Emre Demir"], teamId: "team-aslan", minute: 34 },
      { matchId: "m-ra-5", playerId: playerIds["Emre Demir"], teamId: "team-aslan", minute: 22 },
      { matchId: "m-ra-5", playerId: playerIds["Murat Arslan"] ?? playerIds["Emre Demir"], teamId: "team-aslan", minute: 55 },
    ];

    for (const g of goalData) {
      const exists = await prisma.goal.findFirst({ where: { matchId: g.matchId, playerId: g.playerId, minute: g.minute } });
      if (!exists) await prisma.goal.create({ data: g });
    }
  }

  // ─── Kartlar ──────────────────────────────────────────────────
  if (playerIds["Alp Kaya"]) {
    const cardData = [
      { matchId: "m-ra-3", playerId: playerIds["Alp Kaya"], type: "YELLOW" as const, minute: 45 },
      { matchId: "m-ra-5", playerId: playerIds["Alp Kaya"], type: "YELLOW" as const, minute: 30 },
      { matchId: "m-ra-1", playerId: playerIds["Alp Kaya"], type: "YELLOW" as const, minute: 60 },
    ];

    for (const c of cardData) {
      const exists = await prisma.card.findFirst({ where: { matchId: c.matchId, playerId: c.playerId } });
      if (!exists) {
        await prisma.card.create({ data: c });
        // 3. sarı kart — cezalı yap
        if (cardData.indexOf(c) === 2) {
          await prisma.player.update({ where: { id: c.playerId }, data: { status: "SUSPENDED" } });
        }
      }
    }
  }

  console.log("✓ Gol ve kartlar oluşturuldu");

  // ─── Duyuru ───────────────────────────────────────────────────
  await prisma.announcement.upsert({
    where: { id: "ann-1" },
    update: {},
    create: {
      id: "ann-1",
      title: "Fikstür Güncellendi",
      body: "Ramazan Kupası 3. hafta maçlarının saatleri güncellendi. Lütfen takviminizi kontrol edin.",
      tournamentId: ramazan.id,
      target: "all",
      organizerId: organizer.id,
    },
  });

  console.log("✓ Duyurular oluşturuldu");
  console.log("\n✅ Seed tamamlandı!\n");
  console.log("  Demo hesapları:");
  console.log("  admin       / 123  → Platform Admin");
  console.log("  organizator / 123  → Turnuva Organizatörü");
  console.log("  takim       / 123  → Takım Kaptanı\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
