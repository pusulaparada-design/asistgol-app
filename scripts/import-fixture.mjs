import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const TOURNAMENT_ID = "cmqdu2a7u0001j26h4vkd5h7c";

// Takım adı → DB takım adı eşlemesi
const NAME_MAP = {
  "Makine":       "MMO",
  "Mimar":        "MİMOD",
  "Tabip":        "HTO",
  "Muhasebeciler":"SMMMO",
  "Veteriner H.": "HVHO",
  "Diş2":         "HDHO-2",
  "Jeoloji":      "JMO",
  "Eczacılar":    "ECZ",
  "İnşaat":       "IMO",
  "Elektrik":     "EMO",
  "Diş1":         "HDHO-1",
  "Harita":       "HKMO",
};

// Fikstür: [ev_sahibi, deplasman, tarih (YYYY-MM-DD)]
// Grup A: MMO, MİMOD, HTO, SMMMO, HDHO-1, HKMO
// Grup B: EMO, ECZ, JMO, HVHO, HDHO-2, IMO
const FIXTURE = [
  // 1. Hafta
  ["Makine",       "Mimar",          "2026-06-16"],
  ["Tabip",        "Muhasebeciler",  "2026-06-17"],
  ["Veteriner H.", "Diş2",           "2026-06-17"],
  ["Jeoloji",      "Eczacılar",      "2026-06-18"],
  ["İnşaat",       "Elektrik",       "2026-06-18"],
  ["Diş1",         "Harita",         "2026-06-16"],
  // 2. Hafta
  ["Makine",       "Tabip",          "2026-06-23"],
  ["Mimar",        "Harita",         "2026-06-23"],
  ["Diş1",         "Muhasebeciler",  "2026-06-24"],
  ["İnşaat",       "Jeoloji",        "2026-06-24"],
  ["Elektrik",     "Veteriner H.",   "2026-06-25"],
  ["Diş2",         "Eczacılar",      "2026-06-25"],
  // 3. Hafta
  ["Makine",       "Harita",         "2026-06-30"],
  ["Mimar",        "Muhasebeciler",  "2026-06-30"],
  ["Diş1",         "Tabip",          "2026-07-01"],
  ["Jeoloji",      "Veteriner H.",   "2026-07-01"],
  ["İnşaat",       "Eczacılar",      "2026-07-02"],
  ["Elektrik",     "Diş2",           "2026-07-02"],
  // 4. Hafta
  ["Makine",       "Muhasebeciler",  "2026-07-07"],
  ["Harita",       "Tabip",          "2026-07-07"],
  ["Diş1",         "Mimar",          "2026-07-08"],
  ["Jeoloji",      "Diş2",           "2026-07-08"],
  ["İnşaat",       "Veteriner H.",   "2026-07-09"],
  ["Elektrik",     "Eczacılar",      "2026-07-09"],
  // 5. Hafta
  ["Makine",       "Diş1",           "2026-07-14"],
  ["Mimar",        "Tabip",          "2026-07-14"],
  ["Harita",       "Muhasebeciler",  "2026-07-15"],
  ["Jeoloji",      "Elektrik",       "2026-07-15"],
  ["İnşaat",       "Diş2",           "2026-07-16"],
  ["Eczacılar",    "Veteriner H.",   "2026-07-16"],
];

async function main() {
  // Takım ID'lerini yükle
  const teams = await prisma.team.findMany({
    where: { registrations: { some: { tournamentId: TOURNAMENT_ID, status: "APPROVED" } } },
    select: { id: true, name: true },
  });
  const teamMap = Object.fromEntries(teams.map(t => [t.name, t.id]));
  console.log("Yüklenen takımlar:", Object.keys(teamMap));

  // Grup ID'lerini yükle
  const groups = await prisma.group.findMany({
    where: { tournamentId: TOURNAMENT_ID },
    include: { teams: { include: { team: { select: { name: true } } } } },
  });
  // Takım adı → grup ID haritası
  const teamGroupMap = {};
  for (const g of groups) {
    for (const gt of g.teams) {
      teamGroupMap[gt.team.name] = g.id;
    }
  }
  console.log("Gruplar:", groups.map(g => g.name + ": " + g.teams.map(t => t.team.name).join(", ")));

  // Hafta etiketi hesapla (tarihe göre)
  const weekStarts = [
    "2026-06-16", "2026-06-23", "2026-06-30",
    "2026-07-07", "2026-07-14",
  ];
  function getWeekLabel(date) {
    const idx = weekStarts.findIndex(s => date >= s && date < (weekStarts[weekStarts.indexOf(s) + 1] ?? "2099-01-01"));
    return `Hafta ${idx + 1}`;
  }

  // Maçları oluştur
  const matchData = [];
  for (const [homeFixture, awayFixture, date] of FIXTURE) {
    const homeDbName = NAME_MAP[homeFixture];
    const awayDbName = NAME_MAP[awayFixture];
    const homeTeamId = teamMap[homeDbName];
    const awayTeamId = teamMap[awayDbName];
    const groupId    = teamGroupMap[homeDbName]; // iki takım aynı grupta

    if (!homeTeamId) { console.error("Takım bulunamadı:", homeFixture, "→", homeDbName); process.exit(1); }
    if (!awayTeamId) { console.error("Takım bulunamadı:", awayFixture, "→", awayDbName); process.exit(1); }
    if (!groupId)    { console.error("Grup bulunamadı:", homeDbName); process.exit(1); }

    matchData.push({
      tournamentId: TOURNAMENT_ID,
      homeTeamId,
      awayTeamId,
      groupId,
      date: new Date(date + "T12:00:00Z"),
      round: getWeekLabel(date),
      status: "SCHEDULED",
    });
  }

  await prisma.match.createMany({ data: matchData });
  console.log(`\n✅ ${matchData.length} maç oluşturuldu.`);

  // Özet
  for (let w = 1; w <= 5; w++) {
    const wMatches = matchData.filter(m => m.round === `Hafta ${w}`);
    console.log(`\n${w}. Hafta (${wMatches.length} maç):`);
    for (const m of wMatches) {
      const h = teams.find(t => t.id === m.homeTeamId)?.name;
      const a = teams.find(t => t.id === m.awayTeamId)?.name;
      const g = groups.find(g => g.id === m.groupId)?.name;
      const d = m.date.toISOString().slice(0, 10);
      console.log(`  [${g}] ${h} vs ${a} — ${d}`);
    }
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
