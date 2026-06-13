import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const T_ID = "tournament-ramazan-2026";

async function goal(matchId: string, playerId: string, teamId: string, minute: number) {
  const exists = await prisma.goal.findFirst({ where: { matchId, playerId, minute } });
  if (!exists) await prisma.goal.create({ data: { matchId, playerId, teamId, minute } });
}

async function card(matchId: string, playerId: string, type: "YELLOW" | "RED", minute: number) {
  const exists = await prisma.card.findFirst({ where: { matchId, playerId } });
  if (!exists) await prisma.card.create({ data: { matchId, playerId, type, minute } });
}

function p(map: Record<string, string[]>, teamId: string, idx: number): string {
  const arr = map[teamId] ?? [];
  return arr[Math.min(idx, arr.length - 1)];
}

async function main() {
  console.log("🚀 Ramazan Kupası tamamlanıyor...");

  const cap2 = await prisma.user.findFirstOrThrow({ where: { username: "kaptan2" } });

  // ── 1. Yeni 8 takım ───────────────────────────────────────────
  const newTeams = [
    { id: "team-yildiz",  name: "Yıldız FC",  city: "İstanbul" },
    { id: "team-bogaz",   name: "Boğaz SK",   city: "İstanbul" },
    { id: "team-sehir",   name: "Şehir FC",   city: "Ankara"   },
    { id: "team-anadolu", name: "Anadolu SC", city: "İzmir"    },
    { id: "team-kartal",  name: "Kartal FC",  city: "İstanbul" },
    { id: "team-dogan",   name: "Doğan SK",   city: "Bursa"    },
    { id: "team-sel",     name: "Sel FK",     city: "Adana"    },
    { id: "team-marti",   name: "Martı SC",   city: "Antalya"  },
  ];
  for (const t of newTeams) {
    await prisma.team.upsert({ where: { id: t.id }, update: {}, create: { ...t, captainId: cap2.id } });
  }

  // ── 2. Oyuncular ──────────────────────────────────────────────
  const rosters: Record<string, [string, number][]> = {
    "team-yildiz":  [["Berkay Yıldız",1],["Serkan Çelik",2],["Onur Aktaş",3],["Burak Keskin",4],["Hakan Yılmaz",5],["Cenk Aydın",6],["Tolga Şen",7],["Erhan Kurt",8],["Deniz Kara",9],["Furkan Özkan",10],["Altan Güneş",11]],
    "team-bogaz":   [["Kaan Boğa",1],["Ufuk Deniz",2],["Rıdvan Çam",3],["Gökhan Körfez",4],["Serhat Sahil",5],["Levent Rüzgar",6],["Emrah Dalga",7],["Cengiz Kıyı",8],["Barış Göl",9],["Yiğit Nehir",10],["Umut Kayalık",11]],
    "team-sehir":   [["Ali Şehir",1],["Veli Sokak",2],["Dursun Cadde",3],["Hüseyin Kent",4],["Yılmaz Mahalle",5],["Kemal Semt",6],["Osman Çarşı",7],["İbrahim Meydan",8],["Ahmet Plaza",9],["Mustafa Köprü",10],["Recep Bulvar",11]],
    "team-anadolu": [["Mert Anadolu",1],["Çağrı Bozkır",2],["Tarık Yayla",3],["Erdem Göçer",4],["Sercan Dağ",5],["Ayhan Ova",6],["Koray Toprak",7],["Doğan Çayır",8],["Yusuf Bağ",9],["İsmail Bahçe",10],["Oğuzhan Tarla",11]],
    "team-kartal":  [["Kartal Kaplan",1],["Sarp Uçar",2],["Deniz Haşar",3],["Caner Atmaca",4],["Rıfat Şahin",5],["Zafer Martı",6],["İlker Serçe",7],["Orhan Atmaca",8],["Haluk Doğan",9],["Salih Kartal",10],["Tunç Turaç",11]],
    "team-dogan":   [["Doğan Bey",1],["Fırat Nehir",2],["Dicle Akan",3],["Poyraz Esen",4],["Yağmur Dinç",5],["Timuçin Güç",6],["Volkan Uyanık",7],["Suat Atan",8],["Metin Koşar",9],["Sertaç Sezer",10],["Toprak Eren",11]],
    "team-sel":     [["Sel Akan",1],["Feyzi Taş",2],["Nuri Kaya",3],["Süleyman Dere",4],["Fikret Su",5],["Refik Çay",6],["Hamit Irmak",7],["Adnan Dağ",8],["Kamil Akın",9],["Şükrü Demir",10],["Zühtü Çelik",11]],
    "team-marti":   [["Martı Uçar",1],["Kumsal Deniz",2],["Sahil Demir",3],["Dalgıç Derin",4],["Bora Fırtına",5],["Alp Yüzen",6],["Liman Bekçi",7],["Yelken Kürek",8],["Ağ Balık",9],["Ustura Keskin",10],["Olta Uzun",11]],
  };

  const pm: Record<string, string[]> = {};

  for (const [teamId, players] of Object.entries(rosters)) {
    pm[teamId] = [];
    for (const [name, number] of players) {
      const ex = await prisma.player.findFirst({ where: { teamId, number } });
      const rec = ex ?? await prisma.player.create({ data: { teamId, name, number } });
      pm[teamId].push(rec.id);
    }
  }

  // Mevcut takımların oyuncuları
  for (const tid of ["team-aslan","team-kaplan","team-cinar","team-ruzgar","team-demir","team-firtina","team-simsek","team-ates"]) {
    const rows = await prisma.player.findMany({ where: { teamId: tid }, orderBy: { number: "asc" } });
    pm[tid] = rows.map(r => r.id);
  }

  console.log("✓ Oyuncular hazır");

  // ── 3. Kayıtlar + GroupTeam (Grup C & D) ─────────────────────
  const newRegs = [
    { id: "reg-yildiz-ram",  teamId: "team-yildiz",  gid: "group-ramazan-c" },
    { id: "reg-bogaz-ram",   teamId: "team-bogaz",   gid: "group-ramazan-c" },
    { id: "reg-sehir-ram",   teamId: "team-sehir",   gid: "group-ramazan-c" },
    { id: "reg-anadolu-ram", teamId: "team-anadolu", gid: "group-ramazan-c" },
    { id: "reg-kartal-ram",  teamId: "team-kartal",  gid: "group-ramazan-d" },
    { id: "reg-dogan-ram",   teamId: "team-dogan",   gid: "group-ramazan-d" },
    { id: "reg-sel-ram",     teamId: "team-sel",     gid: "group-ramazan-d" },
    { id: "reg-marti-ram",   teamId: "team-marti",   gid: "group-ramazan-d" },
  ];
  for (const r of newRegs) {
    const ex = await prisma.teamRegistration.findUnique({ where: { id: r.id } });
    if (!ex) {
      const reg = await prisma.teamRegistration.create({ data: { id: r.id, teamId: r.teamId, tournamentId: T_ID, status: "APPROVED" } });
      await prisma.groupTeam.upsert({ where: { groupId_teamId: { groupId: r.gid, teamId: r.teamId } }, create: { groupId: r.gid, teamId: r.teamId, registrationId: reg.id }, update: {} });
    }
  }

  // ── 4. Mevcut maçları tamamla ────────────────────────────────
  // A6: Kaplan vs Çınar SCHEDULED → PLAYED 1-2
  await prisma.match.update({ where: { id: "m-ra-6" }, data: { homeScore: 1, awayScore: 2, status: "PLAYED" } });
  // B4: Fırtına vs Şimşek LIVE → PLAYED 1-3
  await prisma.match.update({ where: { id: "m-rb-4" }, data: { homeScore: 1, awayScore: 3, status: "PLAYED" } });

  // ── 5. Yeni grup maçları ──────────────────────────────────────
  type MS = "PLAYED";
  const groupMatches = [
    // Grup B eksik
    { id: "m-rb-5", gid: "group-ramazan-b", h: "team-ruzgar",  a: "team-simsek",  hs: 4, as: 2, dt: "2026-06-10T18:00" },
    { id: "m-rb-6", gid: "group-ramazan-b", h: "team-demir",   a: "team-firtina", hs: 2, as: 1, dt: "2026-06-10T19:30" },
    // Grup C
    { id: "m-rc-1", gid: "group-ramazan-c", h: "team-yildiz",  a: "team-bogaz",   hs: 2, as: 0, dt: "2026-05-26T18:00" },
    { id: "m-rc-2", gid: "group-ramazan-c", h: "team-sehir",   a: "team-anadolu", hs: 1, as: 3, dt: "2026-05-26T19:30" },
    { id: "m-rc-3", gid: "group-ramazan-c", h: "team-yildiz",  a: "team-sehir",   hs: 3, as: 1, dt: "2026-05-29T18:00" },
    { id: "m-rc-4", gid: "group-ramazan-c", h: "team-bogaz",   a: "team-anadolu", hs: 0, as: 2, dt: "2026-05-29T19:30" },
    { id: "m-rc-5", gid: "group-ramazan-c", h: "team-yildiz",  a: "team-anadolu", hs: 1, as: 2, dt: "2026-06-02T18:00" },
    { id: "m-rc-6", gid: "group-ramazan-c", h: "team-bogaz",   a: "team-sehir",   hs: 3, as: 1, dt: "2026-06-02T19:30" },
    // Grup D
    { id: "m-rd-1", gid: "group-ramazan-d", h: "team-kartal",  a: "team-dogan",   hs: 4, as: 2, dt: "2026-05-27T18:00" },
    { id: "m-rd-2", gid: "group-ramazan-d", h: "team-sel",     a: "team-marti",   hs: 1, as: 1, dt: "2026-05-27T19:30" },
    { id: "m-rd-3", gid: "group-ramazan-d", h: "team-kartal",  a: "team-sel",     hs: 2, as: 0, dt: "2026-05-30T18:00" },
    { id: "m-rd-4", gid: "group-ramazan-d", h: "team-dogan",   a: "team-marti",   hs: 1, as: 0, dt: "2026-05-30T19:30" },
    { id: "m-rd-5", gid: "group-ramazan-d", h: "team-kartal",  a: "team-marti",   hs: 3, as: 1, dt: "2026-06-03T18:00" },
    { id: "m-rd-6", gid: "group-ramazan-d", h: "team-dogan",   a: "team-sel",     hs: 2, as: 2, dt: "2026-06-03T19:30" },
  ];

  for (const m of groupMatches) {
    await prisma.match.upsert({
      where: { id: m.id },
      update: { homeScore: m.hs, awayScore: m.as, status: "PLAYED" },
      create: { id: m.id, tournamentId: T_ID, groupId: m.gid, homeTeamId: m.h, awayTeamId: m.a, homeScore: m.hs, awayScore: m.as, status: "PLAYED", date: new Date(m.dt), venue: "Bosphorus Halı Saha" },
    });
  }

  console.log("✓ Grup maçları tamamlandı");

  // ── 6. Eleme maçları ─────────────────────────────────────────
  // Sıralama: A1=Aslan, A2=Çınar | B1=Rüzgar, B2=Demir | C1=Anadolu, C2=Yıldız | D1=Kartal, D2=Doğan
  const knockout = [
    { id: "m-qf-1", round: "QUARTER_FINAL", h: "team-aslan",   a: "team-demir",   hs: 3, as: 1, dt: "2026-06-15T18:00" },
    { id: "m-qf-2", round: "QUARTER_FINAL", h: "team-anadolu", a: "team-dogan",   hs: 2, as: 0, dt: "2026-06-15T19:30" },
    { id: "m-qf-3", round: "QUARTER_FINAL", h: "team-ruzgar",  a: "team-cinar",   hs: 2, as: 1, dt: "2026-06-16T18:00" },
    { id: "m-qf-4", round: "QUARTER_FINAL", h: "team-kartal",  a: "team-yildiz",  hs: 2, as: 1, dt: "2026-06-16T19:30" },
    { id: "m-sf-1", round: "SEMI_FINAL",    h: "team-aslan",   a: "team-anadolu", hs: 4, as: 2, dt: "2026-06-22T18:00" },
    { id: "m-sf-2", round: "SEMI_FINAL",    h: "team-ruzgar",  a: "team-kartal",  hs: 1, as: 3, dt: "2026-06-22T19:30" },
    { id: "m-3rd",  round: "THIRD_PLACE",   h: "team-anadolu", a: "team-ruzgar",  hs: 2, as: 1, dt: "2026-06-28T17:00" },
    { id: "m-final",round: "FINAL",         h: "team-aslan",   a: "team-kartal",  hs: 2, as: 1, dt: "2026-06-28T20:00" },
  ];

  for (const m of knockout) {
    await prisma.match.upsert({
      where: { id: m.id },
      update: { homeScore: m.hs, awayScore: m.as, status: "PLAYED" },
      create: { id: m.id, tournamentId: T_ID, groupId: null, round: m.round, homeTeamId: m.h, awayTeamId: m.a, homeScore: m.hs, awayScore: m.as, status: "PLAYED", date: new Date(m.dt), venue: "Bosphorus Ana Saha" },
    });
  }

  console.log("✓ Eleme maçları oluşturuldu");

  // ── 7. Goller ─────────────────────────────────────────────────

  // Grup A — eksik goller
  // m-ra-1: Aslan 3-1 Kaplan (Aslan goller seedde var, Kaplan golü eksik)
  await goal("m-ra-1", p(pm,"team-kaplan",8), "team-kaplan", 45);
  // m-ra-2: Çınar 4-1 Ateş
  await goal("m-ra-2", p(pm,"team-cinar",8),  "team-cinar", 7);
  await goal("m-ra-2", p(pm,"team-cinar",10), "team-cinar", 18);
  await goal("m-ra-2", p(pm,"team-cinar",8),  "team-cinar", 29);
  await goal("m-ra-2", p(pm,"team-cinar",5),  "team-cinar", 34);
  await goal("m-ra-2", p(pm,"team-ates",8),   "team-ates",  37);
  // m-ra-4: Kaplan 2-0 Ateş
  await goal("m-ra-4", p(pm,"team-kaplan",8), "team-kaplan", 12);
  await goal("m-ra-4", p(pm,"team-kaplan",5), "team-kaplan", 28);
  // m-ra-3: Aslan 1-1 Çınar (Aslan golü seedde var, Çınar eksik)
  await goal("m-ra-3", p(pm,"team-cinar",8),  "team-cinar", 55);
  // m-ra-6: Kaplan 1-2 Çınar
  await goal("m-ra-6", p(pm,"team-cinar",8),  "team-cinar",  8);
  await goal("m-ra-6", p(pm,"team-kaplan",8), "team-kaplan", 19);
  await goal("m-ra-6", p(pm,"team-cinar",10), "team-cinar",  35);

  // Grup B
  await goal("m-rb-1", p(pm,"team-ruzgar",8),  "team-ruzgar",  6);
  await goal("m-rb-1", p(pm,"team-ruzgar",10), "team-ruzgar",  22);
  await goal("m-rb-1", p(pm,"team-ruzgar",8),  "team-ruzgar",  31);
  await goal("m-rb-2", p(pm,"team-demir",8),   "team-demir",   11);
  await goal("m-rb-2", p(pm,"team-demir",5),   "team-demir",   25);
  await goal("m-rb-2", p(pm,"team-simsek",8),  "team-simsek",  32);
  await goal("m-rb-3", p(pm,"team-ruzgar",8),  "team-ruzgar",  9);
  await goal("m-rb-3", p(pm,"team-demir",8),   "team-demir",   17);
  await goal("m-rb-3", p(pm,"team-ruzgar",10), "team-ruzgar",  36);
  await goal("m-rb-4", p(pm,"team-simsek",8),  "team-simsek",  7);
  await goal("m-rb-4", p(pm,"team-simsek",10), "team-simsek",  19);
  await goal("m-rb-4", p(pm,"team-firtina",8), "team-firtina", 28);
  await goal("m-rb-4", p(pm,"team-simsek",5),  "team-simsek",  34);
  await goal("m-rb-5", p(pm,"team-ruzgar",8),  "team-ruzgar",  4);
  await goal("m-rb-5", p(pm,"team-ruzgar",10), "team-ruzgar",  15);
  await goal("m-rb-5", p(pm,"team-simsek",8),  "team-simsek",  23);
  await goal("m-rb-5", p(pm,"team-ruzgar",8),  "team-ruzgar",  28);
  await goal("m-rb-5", p(pm,"team-simsek",5),  "team-simsek",  35);
  await goal("m-rb-5", p(pm,"team-ruzgar",5),  "team-ruzgar",  38);
  await goal("m-rb-6", p(pm,"team-demir",8),   "team-demir",   13);
  await goal("m-rb-6", p(pm,"team-demir",5),   "team-demir",   22);
  await goal("m-rb-6", p(pm,"team-firtina",8), "team-firtina", 31);

  // Grup C
  await goal("m-rc-1", p(pm,"team-yildiz",8),  "team-yildiz",  12);
  await goal("m-rc-1", p(pm,"team-yildiz",10), "team-yildiz",  27);
  await goal("m-rc-2", p(pm,"team-anadolu",8), "team-anadolu",  5);
  await goal("m-rc-2", p(pm,"team-anadolu",10),"team-anadolu", 18);
  await goal("m-rc-2", p(pm,"team-sehir",8),   "team-sehir",   24);
  await goal("m-rc-2", p(pm,"team-anadolu",5), "team-anadolu", 36);
  await goal("m-rc-3", p(pm,"team-yildiz",8),  "team-yildiz",  8);
  await goal("m-rc-3", p(pm,"team-yildiz",10), "team-yildiz",  19);
  await goal("m-rc-3", p(pm,"team-sehir",8),   "team-sehir",   25);
  await goal("m-rc-3", p(pm,"team-yildiz",8),  "team-yildiz",  33);
  await goal("m-rc-4", p(pm,"team-anadolu",8), "team-anadolu", 10);
  await goal("m-rc-4", p(pm,"team-anadolu",10),"team-anadolu", 29);
  await goal("m-rc-5", p(pm,"team-anadolu",8), "team-anadolu", 16);
  await goal("m-rc-5", p(pm,"team-yildiz",8),  "team-yildiz",  23);
  await goal("m-rc-5", p(pm,"team-anadolu",10),"team-anadolu", 37);
  await goal("m-rc-6", p(pm,"team-bogaz",8),   "team-bogaz",   9);
  await goal("m-rc-6", p(pm,"team-bogaz",10),  "team-bogaz",   21);
  await goal("m-rc-6", p(pm,"team-sehir",8),   "team-sehir",   30);
  await goal("m-rc-6", p(pm,"team-bogaz",5),   "team-bogaz",   38);

  // Grup D
  await goal("m-rd-1", p(pm,"team-kartal",8),  "team-kartal", 3);
  await goal("m-rd-1", p(pm,"team-kartal",10), "team-kartal", 11);
  await goal("m-rd-1", p(pm,"team-dogan",8),   "team-dogan",  17);
  await goal("m-rd-1", p(pm,"team-kartal",8),  "team-kartal", 24);
  await goal("m-rd-1", p(pm,"team-dogan",10),  "team-dogan",  31);
  await goal("m-rd-1", p(pm,"team-kartal",5),  "team-kartal", 35);
  await goal("m-rd-1", p(pm,"team-kartal",10), "team-kartal", 39);
  await goal("m-rd-2", p(pm,"team-sel",8),     "team-sel",    14);
  await goal("m-rd-2", p(pm,"team-marti",8),   "team-marti",  28);
  await goal("m-rd-3", p(pm,"team-kartal",8),  "team-kartal", 16);
  await goal("m-rd-3", p(pm,"team-kartal",10), "team-kartal", 33);
  await goal("m-rd-4", p(pm,"team-dogan",8),   "team-dogan",  20);
  await goal("m-rd-5", p(pm,"team-kartal",8),  "team-kartal", 8);
  await goal("m-rd-5", p(pm,"team-marti",8),   "team-marti",  15);
  await goal("m-rd-5", p(pm,"team-kartal",10), "team-kartal", 27);
  await goal("m-rd-5", p(pm,"team-kartal",5),  "team-kartal", 36);
  await goal("m-rd-6", p(pm,"team-dogan",8),   "team-dogan",  10);
  await goal("m-rd-6", p(pm,"team-sel",8),     "team-sel",    19);
  await goal("m-rd-6", p(pm,"team-dogan",10),  "team-dogan",  29);
  await goal("m-rd-6", p(pm,"team-sel",10),    "team-sel",    38);

  // Eleme goller
  await goal("m-qf-1", p(pm,"team-aslan",10),  "team-aslan",   8);
  await goal("m-qf-1", p(pm,"team-aslan",8),   "team-aslan",  23);
  await goal("m-qf-1", p(pm,"team-aslan",10),  "team-aslan",  37);
  await goal("m-qf-1", p(pm,"team-demir",8),   "team-demir",  45);
  await goal("m-qf-2", p(pm,"team-anadolu",8), "team-anadolu",14);
  await goal("m-qf-2", p(pm,"team-anadolu",10),"team-anadolu",31);
  await goal("m-qf-3", p(pm,"team-ruzgar",8),  "team-ruzgar", 11);
  await goal("m-qf-3", p(pm,"team-cinar",8),   "team-cinar",  22);
  await goal("m-qf-3", p(pm,"team-ruzgar",8),  "team-ruzgar", 38);
  await goal("m-qf-4", p(pm,"team-kartal",8),  "team-kartal", 17);
  await goal("m-qf-4", p(pm,"team-yildiz",8),  "team-yildiz", 25);
  await goal("m-qf-4", p(pm,"team-kartal",10), "team-kartal", 33);
  await goal("m-sf-1", p(pm,"team-aslan",10),  "team-aslan",   5);
  await goal("m-sf-1", p(pm,"team-anadolu",8), "team-anadolu",13);
  await goal("m-sf-1", p(pm,"team-aslan",8),   "team-aslan",  20);
  await goal("m-sf-1", p(pm,"team-aslan",10),  "team-aslan",  28);
  await goal("m-sf-1", p(pm,"team-anadolu",8), "team-anadolu",35);
  await goal("m-sf-1", p(pm,"team-aslan",8),   "team-aslan",  39);
  await goal("m-sf-2", p(pm,"team-kartal",8),  "team-kartal",  9);
  await goal("m-sf-2", p(pm,"team-ruzgar",8),  "team-ruzgar", 18);
  await goal("m-sf-2", p(pm,"team-kartal",10), "team-kartal", 27);
  await goal("m-sf-2", p(pm,"team-kartal",8),  "team-kartal", 38);
  await goal("m-3rd",  p(pm,"team-anadolu",8), "team-anadolu",12);
  await goal("m-3rd",  p(pm,"team-ruzgar",8),  "team-ruzgar", 19);
  await goal("m-3rd",  p(pm,"team-anadolu",10),"team-anadolu",36);
  await goal("m-final",p(pm,"team-aslan",10),  "team-aslan",  14);
  await goal("m-final",p(pm,"team-kartal",8),  "team-kartal", 22);
  await goal("m-final",p(pm,"team-aslan",8),   "team-aslan",  38);

  console.log("✓ Goller oluşturuldu");

  // ── 8. Kartlar ────────────────────────────────────────────────
  await card("m-ra-2",  p(pm,"team-ates",4),    "YELLOW", 20);
  await card("m-ra-6",  p(pm,"team-kaplan",4),  "YELLOW", 30);
  await card("m-rb-2",  p(pm,"team-simsek",4),  "YELLOW", 18);
  await card("m-rb-5",  p(pm,"team-simsek",3),  "YELLOW", 25);
  await card("m-rc-3",  p(pm,"team-sehir",4),   "YELLOW", 22);
  await card("m-rd-1",  p(pm,"team-dogan",4),   "YELLOW", 15);
  await card("m-rd-1",  p(pm,"team-kartal",6),  "YELLOW", 32);
  await card("m-qf-1",  p(pm,"team-demir",4),   "YELLOW", 15);
  await card("m-qf-3",  p(pm,"team-cinar",4),   "YELLOW", 22);
  await card("m-sf-2",  p(pm,"team-ruzgar",4),  "YELLOW", 12);
  await card("m-sf-2",  p(pm,"team-ruzgar",6),  "RED",    35);
  await card("m-final", p(pm,"team-kartal",4),  "YELLOW", 24);

  console.log("✓ Kartlar oluşturuldu");

  // ── 9. Turnuva durumu ─────────────────────────────────────────
  await prisma.tournament.update({ where: { id: T_ID }, data: { status: "COMPLETED" } });

  console.log("\n🏆 Ramazan Kupası 2026 tamamlandı!");
  console.log("   Şampiyon: Aslan FC");
  console.log("   3. Anadolu SC");
}

main().catch(console.error).finally(() => prisma.$disconnect());
