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
