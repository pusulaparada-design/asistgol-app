"use server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ─── Platform istatistikleri ──────────────────────────────────
export async function getPlatformStats() {
  const [
    activeTournaments,
    totalTeams,
    todayMatches,
    pendingOrganizers,
    completedTournaments,
    totalPlayers,
  ] = await Promise.all([
    prisma.tournament.count({ where: { status: "ACTIVE" } }),
    prisma.team.count(),
    prisma.match.count({
      where: {
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
    prisma.user.count({ where: { role: "ORGANIZER" } }),
    prisma.tournament.count({ where: { status: "COMPLETED" } }),
    prisma.player.count(),
  ]);

  return { activeTournaments, totalTeams, todayMatches, pendingOrganizers, completedTournaments, totalPlayers };
}

// ─── Tüm organizatörler ───────────────────────────────────────
export async function getAllOrganizers() {
  return prisma.user.findMany({
    where: { role: "ORGANIZER" },
    include: {
      _count: { select: { organizedTournaments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ─── Tüm turnuvalar (admin) ───────────────────────────────────
export async function getAllTournaments() {
  return prisma.tournament.findMany({
    include: {
      organizer: { select: { name: true } },
      _count: { select: { registrations: true, matches: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ─── Turnuva canlı sayıları ───────────────────────────────────
export async function getLiveCounts() {
  const [liveMatches, registrationTournaments] = await Promise.all([
    prisma.match.count({ where: { status: "LIVE" } }),
    prisma.tournament.count({ where: { status: "REGISTRATION" } }),
  ]);
  return { liveMatches, registrationTournaments };
}

// ─── Tüm takımlar (admin) ─────────────────────────────────────
export async function getAllTeams() {
  return prisma.team.findMany({
    include: {
      captain: { select: { name: true, phone: true } },
      players: {
        select: { id: true, name: true, number: true, position: true, status: true },
        orderBy: { number: "asc" },
      },
      _count: { select: { registrations: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ─── Tüm maçlar (admin) ───────────────────────────────────────
export async function getAllMatchesAdmin() {
  return prisma.match.findMany({
    include: {
      homeTeam: { select: { name: true } },
      awayTeam: { select: { name: true } },
      tournament: { select: { name: true } },
      group: { select: { name: true } },
    },
    orderBy: [{ date: "desc" }],
    take: 200,
  });
}

// ─── Platform geneli golcü sıralaması ─────────────────────────
export async function getPlatformTopScorers() {
  const goals = await prisma.goal.groupBy({
    by: ["playerId"],
    where: { ownGoal: false },
    _count: { playerId: true },
    orderBy: { _count: { playerId: "desc" } },
    take: 10,
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
