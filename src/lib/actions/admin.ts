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
