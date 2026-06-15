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
      teams: { include: { team: { select: { id: true, name: true } } } },
      matches: {
        where: { status: "PLAYED" },
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

    // Sırala: puan → averaj → gol → isim (alfabetik)
    standings.sort((a, b) => b.pts - a.pts || b.av - a.av || b.gf - a.gf || a.team.name.localeCompare(b.team.name, "tr"));
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
      homeTeam: { select: { id: true, name: true } },
      awayTeam: { select: { id: true, name: true } },
      group:    { select: { id: true, name: true } },
      goals: { include: { player: { select: { id: true, name: true, teamId: true } } } },
      cards: { include: { player: { select: { id: true, name: true, teamId: true } } } },
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
  const [registrations, tournament] = await Promise.all([
    prisma.teamRegistration.findMany({
      where: { tournamentId, status: "APPROVED" },
      select: { teamId: true, team: { select: { name: true } } },
    }),
    prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: { yellowCardLimit: true },
    }),
  ]);

  const teamIds = registrations.map((r) => r.teamId);
  const teamNameMap = new Map(registrations.map((r) => [r.teamId, r.team.name]));
  const yellowLimit = tournament?.yellowCardLimit ?? 3;

  const [suspensions, allCards] = await Promise.all([
    prisma.playerSuspension.findMany({
      where: { tournamentId, player: { teamId: { in: teamIds } } },
      include: { player: { select: { id: true, name: true, teamId: true } } },
    }),
    prisma.card.findMany({
      where: { match: { tournamentId } },
      select: { playerId: true, type: true, player: { select: { teamId: true } } },
    }),
  ]);

  // Kart sayıları (görüntüleme için)
  const cardMap = new Map<string, { yellows: number; reds: number }>();
  for (const c of allCards) {
    const e = cardMap.get(c.playerId) ?? { yellows: 0, reds: 0 };
    if (c.type === "YELLOW") e.yellows++; else e.reds++;
    cardMap.set(c.playerId, e);
  }

  const suspended = suspensions
    .filter((s) => s.remainingMatches > 0)
    .map((s) => ({
      id: s.player.id,
      name: s.player.name,
      team: teamNameMap.get(s.player.teamId) ?? "",
      remainingMatches: s.remainingMatches,
      yellowCards: cardMap.get(s.player.id)?.yellows ?? 0,
      redCards: cardMap.get(s.player.id)?.reds ?? 0,
    }));

  const atRisk = suspensions
    .filter((s) => s.remainingMatches === 0 && s.yellowCycleCount > 0)
    .map((s) => ({
      id: s.player.id,
      name: s.player.name,
      team: teamNameMap.get(s.player.teamId) ?? "",
      yellowCycleCount: s.yellowCycleCount,
      yellowsUntilBan: yellowLimit - s.yellowCycleCount,
    }));

  const fairPlayMap = new Map<string, { name: string; yellow: number; red: number }>();
  for (const reg of registrations) fairPlayMap.set(reg.teamId, { name: reg.team.name, yellow: 0, red: 0 });
  for (const c of allCards) {
    const entry = fairPlayMap.get(c.player.teamId);
    if (entry) { if (c.type === "YELLOW") entry.yellow++; else entry.red++; }
  }
  const fairPlay = Array.from(fairPlayMap.values())
    .sort((a, b) => (a.yellow + a.red * 3) - (b.yellow + b.red * 3))
    .map((entry, i) => ({ ...entry, pos: i + 1, score: entry.yellow + entry.red * 3 }));

  return { suspended, atRisk, fairPlay, yellowLimit };
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
      take: 2000,
    }),
    prisma.team.findMany({ select: { id: true, name: true }, orderBy: { createdAt: "desc" }, take: 500 }),
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

// ─── Kaptanın takımlarının toplam istatistikleri ─────────────
export async function getCaptainTeamsStats() {
  const session = await getSession();
  if (!session) throw new Error("Yetkisiz.");

  const teams = await prisma.team.findMany({
    where: { captainId: session.userId },
    select: { id: true, name: true },
  });
  const teamIds = teams.map(t => t.id);
  if (teamIds.length === 0) return [];

  const [matches, goals, cards] = await Promise.all([
    prisma.match.findMany({
      where: {
        OR: [{ homeTeamId: { in: teamIds } }, { awayTeamId: { in: teamIds } }],
        homeScore: { not: null },
      },
      select: { homeTeamId: true, awayTeamId: true, homeScore: true, awayScore: true },
    }),
    prisma.goal.findMany({
      where: { teamId: { in: teamIds }, ownGoal: false },
      select: { teamId: true, playerId: true },
    }),
    prisma.card.findMany({
      where: { player: { teamId: { in: teamIds } } },
      select: { type: true, player: { select: { teamId: true, name: true } } },
    }),
  ]);

  // Oyuncu başına gol sayısı (kendi takım içi sıralama için)
  const playerGoals: Record<string, { name: string; teamId: string; goals: number }> = {};
  for (const g of goals) {
    if (!playerGoals[g.playerId]) {
      playerGoals[g.playerId] = { name: "", teamId: g.teamId, goals: 0 };
    }
    playerGoals[g.playerId].goals++;
    playerGoals[g.playerId].teamId = g.teamId;
  }

  return teams.map(team => {
    let played = 0, wins = 0, draws = 0, losses = 0, gf = 0, ga = 0, yellow = 0, red = 0;

    for (const m of matches) {
      const isHome = m.homeTeamId === team.id;
      const isAway = m.awayTeamId === team.id;
      if (!isHome && !isAway) continue;

      const myScore = isHome ? m.homeScore! : m.awayScore!;
      const opScore = isHome ? m.awayScore! : m.homeScore!;
      played++; gf += myScore; ga += opScore;
      if (myScore > opScore) wins++;
      else if (myScore === opScore) draws++;
      else losses++;
    }

    for (const c of cards) {
      if (c.player.teamId !== team.id) continue;
      if (c.type === "YELLOW") yellow++;
      else red++;
    }

    const totalGoals = goals.filter(g => g.teamId === team.id).length;

    return {
      team,
      played, wins, draws, losses,
      gf, ga, gd: gf - ga,
      points: wins * 3 + draws,
      yellow, red, totalGoals,
    };
  });
}

// ─── Kaptanın oyuncularının sıralamaları ─────────────────────
export async function getCaptainPlayersLeaderboard() {
  const session = await getSession();
  if (!session) throw new Error("Yetkisiz.");

  const teams = await prisma.team.findMany({
    where: { captainId: session.userId },
    select: { id: true, name: true },
  });
  const teamIds = teams.map(t => t.id);
  if (teamIds.length === 0) return { topScorers: [], fairPlay: [] };

  const players = await prisma.player.findMany({
    where: { teamId: { in: teamIds } },
    select: {
      id: true, name: true, teamId: true,
      goals:  { where: { ownGoal: false }, select: { id: true } },
      cards:  { select: { type: true } },
    },
  });

  const teamMap = new Map(teams.map(t => [t.id, t.name]));

  const topScorers = players
    .map(p => ({ id: p.id, name: p.name, teamName: teamMap.get(p.teamId) ?? "", goals: p.goals.length }))
    .filter(p => p.goals > 0)
    .sort((a, b) => b.goals - a.goals)
    .map((p, i) => ({ ...p, rank: i + 1 }));

  const fairPlay = players
    .map(p => {
      const yellow = p.cards.filter(c => c.type === "YELLOW").length;
      const red    = p.cards.filter(c => c.type === "RED").length;
      return { id: p.id, name: p.name, teamName: teamMap.get(p.teamId) ?? "", yellow, red, score: yellow + red * 3 };
    })
    .sort((a, b) => a.score - b.score || a.yellow - b.yellow)
    .map((p, i) => ({ ...p, rank: i + 1 }));

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

  const matches = await prisma.match.findMany({
    where: {
      OR: [{ homeTeamId: { in: teamIds } }, { awayTeamId: { in: teamIds } }],
      date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
    include: {
      homeTeam:   { select: { id: true, name: true } },
      awayTeam:   { select: { id: true, name: true } },
      tournament: { select: { id: true, name: true } },
      group:      { select: { id: true, name: true } },
    },
    orderBy: { date: "asc" },
  });
  return { matches, myTeamIds: teamIds };
}
