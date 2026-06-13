"use server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ─── Skor gir ─────────────────────────────────────────────────
export async function enterScore(data: {
  matchId: string;
  homeScore: number;
  awayScore: number;
  goals: { playerId: string; teamId: string; minute?: number }[];
  cards: { playerId: string; type: "YELLOW" | "RED"; minute?: number }[];
}) {
  const session = await getSession();
  if (!session || session.role !== "ORGANIZER") throw new Error("Yetkisiz.");

  const match = await prisma.match.findUnique({
    where: { id: data.matchId },
    include: { tournament: true },
  });
  if (!match) throw new Error("Maç bulunamadı.");

  // Eski gol/kart kayıtlarını temizle
  await prisma.goal.deleteMany({ where: { matchId: data.matchId } });
  await prisma.card.deleteMany({ where: { matchId: data.matchId } });

  // Güncellenmiş maç kaydet
  const updated = await prisma.match.update({
    where: { id: data.matchId },
    data: {
      homeScore: data.homeScore,
      awayScore: data.awayScore,
      status: "PLAYED",
      goals: {
        create: data.goals.map((g) => ({
          playerId: g.playerId,
          teamId: g.teamId,
          minute: g.minute,
        })),
      },
      cards: {
        create: data.cards.map((c) => ({
          playerId: c.playerId,
          type: c.type,
          minute: c.minute,
        })),
      },
    },
  });

  // Sarı kart birikimi kontrol et
  if (match.tournament.trackCards) {
    await checkYellowCardSuspensions(match.tournamentId, match.tournament.yellowCardLimit);
  }

  revalidatePath(`/organizer/tournaments/${match.tournamentId}/matches`);
  revalidatePath(`/organizer/tournaments/${match.tournamentId}/standings`);
  revalidatePath(`/organizer/tournaments/${match.tournamentId}/stats`);
  revalidatePath(`/organizer/tournaments/${match.tournamentId}/penalties`);
  return updated;
}

// ─── Sarı kart cezası kontrolü ────────────────────────────────
async function checkYellowCardSuspensions(tournamentId: string, limit: number) {
  // Turnuva genelindeki tüm sarı kartları oyuncu bazında say
  const yellows = await prisma.card.groupBy({
    by: ["playerId"],
    where: {
      type: "YELLOW",
      match: { tournamentId },
    },
    _count: { playerId: true },
  });

  for (const y of yellows) {
    if (y._count.playerId >= limit) {
      await prisma.player.update({
        where: { id: y.playerId },
        data: { status: "SUSPENDED" },
      });
    }
  }
}

// ─── Maç durumunu CANLI yap ───────────────────────────────────
export async function setMatchLive(matchId: string) {
  const session = await getSession();
  if (!session || session.role !== "ORGANIZER") throw new Error("Yetkisiz.");

  const match = await prisma.match.update({
    where: { id: matchId },
    data: { status: "LIVE" },
  });
  revalidatePath(`/organizer/tournaments/${match.tournamentId}/matches`);
  return match;
}

// ─── Puan tablosu hesapla ─────────────────────────────────────
export async function getStandings(tournamentId: string) {
  const groups = await prisma.group.findMany({
    where: { tournamentId },
    include: {
      teams: { include: { team: true } },
      matches: {
        where: { status: "PLAYED" },
        include: { homeTeam: true, awayTeam: true },
      },
    },
  });

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { winPoints: true, advanceCount: true },
  });

  return groups.map((group) => {
    const standings = group.teams.map(({ team }) => {
      let p = 0, w = 0, d = 0, l = 0, gf = 0, ga = 0, pts = 0;

      for (const match of group.matches) {
        const isHome = match.homeTeamId === team.id;
        const isAway = match.awayTeamId === team.id;
        if (!isHome && !isAway) continue;

        const myScore = isHome ? match.homeScore! : match.awayScore!;
        const opScore = isHome ? match.awayScore! : match.homeScore!;
        p++;
        gf += myScore;
        ga += opScore;

        if (myScore > opScore) { w++; pts += tournament?.winPoints ?? 3; }
        else if (myScore === opScore) { d++; pts += 1; }
        else l++;
      }

      return { team, p, w, d, l, gf, ga, av: gf - ga, pts };
    });

    // Sırala: puan → averaj → gol
    standings.sort((a, b) => b.pts - a.pts || b.av - a.av || b.gf - a.gf);
    return { group: group.name, advance: tournament?.advanceCount ?? 2, standings };
  });
}

// ─── Golcü sıralaması ─────────────────────────────────────────
export async function getTopScorers(tournamentId: string) {
  const goals = await prisma.goal.groupBy({
    by: ["playerId"],
    where: { match: { tournamentId }, ownGoal: false },
    _count: { playerId: true },
    orderBy: { _count: { playerId: "desc" } },
    take: 20,
  });

  const playerIds = goals.map((g) => g.playerId);
  const players = await prisma.player.findMany({
    where: { id: { in: playerIds } },
    include: { team: { select: { name: true } } },
  });

  return goals.map((g) => {
    const player = players.find((p) => p.id === g.playerId)!;
    return { player, goals: g._count.playerId };
  });
}

// ─── Turnuva maçları ──────────────────────────────────────────
export async function getTournamentMatches(tournamentId: string) {
  return prisma.match.findMany({
    where: { tournamentId },
    include: {
      homeTeam: true,
      awayTeam: true,
      group: true,
      goals: { include: { player: { select: { name: true } } } },
      cards: { include: { player: { select: { name: true } } } },
    },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
  });
}

// ─── Turnuva istatistikleri ───────────────────────────────────
export async function getTournamentStats(tournamentId: string) {
  const [matches, yellowCount, assists, cards] = await Promise.all([
    prisma.match.findMany({
      where: { tournamentId, status: "PLAYED" },
      include: {
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } },
      },
    }),
    prisma.card.count({ where: { type: "YELLOW", match: { tournamentId } } }),
    prisma.assist.groupBy({
      by: ["playerId"],
      where: { match: { tournamentId } },
      _count: { playerId: true },
      orderBy: { _count: { playerId: "desc" } },
      take: 10,
    }),
    prisma.card.findMany({
      where: { match: { tournamentId } },
      select: { type: true, player: { select: { teamId: true, team: { select: { name: true } } } } },
    }),
  ]);

  const totalGoals = matches.reduce((s, m) => s + (m.homeScore ?? 0) + (m.awayScore ?? 0), 0);
  const avgGoals = matches.length ? totalGoals / matches.length : 0;
  const cleanSheets = matches.filter((m) => (m.homeScore ?? 0) === 0 || (m.awayScore ?? 0) === 0).length;

  const teamMap = new Map<string, { name: string; wins: number; draws: number; losses: number; goals: number; goalsAgainst: number; cleanSheets: number }>();
  for (const m of matches) {
    if (!teamMap.has(m.homeTeamId)) teamMap.set(m.homeTeamId, { name: m.homeTeam.name, wins: 0, draws: 0, losses: 0, goals: 0, goalsAgainst: 0, cleanSheets: 0 });
    if (!teamMap.has(m.awayTeamId)) teamMap.set(m.awayTeamId, { name: m.awayTeam.name, wins: 0, draws: 0, losses: 0, goals: 0, goalsAgainst: 0, cleanSheets: 0 });
    const home = teamMap.get(m.homeTeamId)!;
    const away = teamMap.get(m.awayTeamId)!;
    const hs = m.homeScore ?? 0, as_ = m.awayScore ?? 0;
    home.goals += hs; home.goalsAgainst += as_;
    away.goals += as_; away.goalsAgainst += hs;
    if (as_ === 0) home.cleanSheets++;
    if (hs === 0) away.cleanSheets++;
    if (hs > as_) { home.wins++; away.losses++; }
    else if (hs < as_) { away.wins++; home.losses++; }
    else { home.draws++; away.draws++; }
  }
  const teamStats = Array.from(teamMap.values()).sort((a, b) => b.goals - a.goals);

  const assistPlayerIds = assists.map((a) => a.playerId);
  const assistPlayers = await prisma.player.findMany({
    where: { id: { in: assistPlayerIds } },
    include: { team: { select: { name: true } } },
  });
  const topAssists = assists.map((a, i) => {
    const p = assistPlayers.find((pl) => pl.id === a.playerId)!;
    return { rank: i + 1, player: p, assists: a._count.playerId };
  });

  const cardMap = new Map<string, { name: string; yellow: number; red: number }>();
  for (const c of cards) {
    const teamId = c.player.teamId;
    if (!cardMap.has(teamId)) cardMap.set(teamId, { name: c.player.team.name, yellow: 0, red: 0 });
    const tc = cardMap.get(teamId)!;
    if (c.type === "YELLOW") tc.yellow++; else tc.red++;
  }
  const cardStats = Array.from(cardMap.values()).sort((a, b) => (b.yellow + b.red * 3) - (a.yellow + a.red * 3));

  return {
    totalGoals,
    avgGoals: Math.round(avgGoals * 10) / 10,
    cleanSheets,
    yellowCards: yellowCount,
    matchCount: matches.length,
    teamStats,
    topAssists,
    cardStats,
  };
}

// ─── Turnuva cezalı oyuncular ─────────────────────────────────
export async function getTournamentPenalties(tournamentId: string) {
  const registrations = await prisma.teamRegistration.findMany({
    where: { tournamentId, status: "APPROVED" },
    select: { teamId: true, team: { select: { name: true } } },
  });
  const teamIds = registrations.map((r) => r.teamId);

  const [suspended, yellowGroups, allCards] = await Promise.all([
    prisma.player.findMany({
      where: { status: "SUSPENDED", teamId: { in: teamIds } },
      include: {
        team: { select: { name: true } },
        cards: { where: { match: { tournamentId } }, select: { type: true } },
      },
    }),
    prisma.card.groupBy({
      by: ["playerId"],
      where: { type: "YELLOW", match: { tournamentId } },
      _count: { playerId: true },
      orderBy: { _count: { playerId: "desc" } },
    }),
    prisma.card.findMany({
      where: { match: { tournamentId } },
      select: { type: true, player: { select: { teamId: true } } },
    }),
  ]);

  const atRiskPlayerIds = yellowGroups.filter((y) => y._count.playerId >= 2).map((y) => y.playerId);
  const atRisk = await prisma.player.findMany({
    where: { id: { in: atRiskPlayerIds }, status: { not: "SUSPENDED" }, teamId: { in: teamIds } },
    include: { team: { select: { name: true } } },
  });

  const fairPlayMap = new Map<string, { name: string; yellow: number; red: number }>();
  for (const reg of registrations) fairPlayMap.set(reg.teamId, { name: reg.team.name, yellow: 0, red: 0 });
  for (const c of allCards) {
    const entry = fairPlayMap.get(c.player.teamId);
    if (entry) { if (c.type === "YELLOW") entry.yellow++; else entry.red++; }
  }
  const fairPlay = Array.from(fairPlayMap.values())
    .sort((a, b) => (a.yellow + a.red * 3) - (b.yellow + b.red * 3))
    .map((entry, i) => ({ ...entry, pos: i + 1, score: entry.yellow + entry.red * 3 }));

  return {
    suspended: suspended.map((p) => ({
      id: p.id, name: p.name, team: p.team.name,
      yellowCards: p.cards.filter((c) => c.type === "YELLOW").length,
      redCards: p.cards.filter((c) => c.type === "RED").length,
    })),
    atRisk: atRisk.map((p) => ({
      id: p.id, name: p.name, team: p.team.name,
      yellowCards: yellowGroups.find((y) => y.playerId === p.id)?._count.playerId ?? 0,
    })),
    fairPlay,
  };
}

// ─── Global liderboard (kaptan için) ─────────────────────────
export async function getGlobalLeaderboard() {
  const [scorerGroups, allCards, allTeams] = await Promise.all([
    prisma.goal.groupBy({
      by: ["playerId"],
      where: { ownGoal: false },
      _count: { playerId: true },
      orderBy: { _count: { playerId: "desc" } },
      take: 15,
    }),
    prisma.card.findMany({
      select: { type: true, player: { select: { teamId: true, team: { select: { id: true, name: true } } } } },
    }),
    prisma.team.findMany({ select: { id: true, name: true }, orderBy: { createdAt: "desc" } }),
  ]);

  const playerIds = scorerGroups.map((g) => g.playerId);
  const players = await prisma.player.findMany({
    where: { id: { in: playerIds } },
    include: { team: { select: { id: true, name: true } } },
  });
  const topScorers = scorerGroups.map((g, i) => {
    const p = players.find((pl) => pl.id === g.playerId)!;
    return { rank: i + 1, player: p, goals: g._count.playerId };
  });

  const fairPlayMap = new Map<string, { name: string; yellow: number; red: number }>();
  for (const t of allTeams) fairPlayMap.set(t.id, { name: t.name, yellow: 0, red: 0 });
  for (const c of allCards) {
    const entry = fairPlayMap.get(c.player.teamId);
    if (entry) { if (c.type === "YELLOW") entry.yellow++; else entry.red++; }
  }
  const fairPlay = Array.from(fairPlayMap.values())
    .sort((a, b) => (a.yellow + a.red * 3) - (b.yellow + b.red * 3))
    .slice(0, 10)
    .map((entry, i) => ({ ...entry, rank: i + 1, score: entry.yellow + entry.red * 3 }));

  return { topScorers, fairPlay };
}

// ─── Kaptanın maç takvimi ─────────────────────────────────────
export async function getCaptainSchedule() {
  const session = await getSession();
  if (!session) throw new Error("Yetkisiz.");

  const teams = await prisma.team.findMany({
    where: { captainId: session.userId },
    select: { id: true },
  });
  const teamIds = teams.map((t) => t.id);

  return prisma.match.findMany({
    where: {
      OR: [{ homeTeamId: { in: teamIds } }, { awayTeamId: { in: teamIds } }],
      date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
    include: {
      homeTeam: true,
      awayTeam: true,
      tournament: { select: { name: true } },
      group: true,
    },
    orderBy: { date: "asc" },
  });
}
