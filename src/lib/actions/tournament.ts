"use server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { TournamentFormat, TournamentStatus, MatchFormat } from "@prisma/client";

// ─── Turnuvaları listele ──────────────────────────────────────
export async function getTournaments(organizerId?: string) {
  return prisma.tournament.findMany({
    where: organizerId ? { organizerId } : undefined,
    include: {
      organizer: { select: { name: true } },
      _count: { select: { registrations: true, matches: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ─── Turnuva detayı ───────────────────────────────────────────
export async function getTournament(id: string) {
  return prisma.tournament.findUnique({
    where: { id },
    include: {
      organizer: { select: { id: true, name: true } },
      registrations: {
        include: {
          team: { include: { captain: { select: { name: true, phone: true } }, _count: { select: { players: true } } } },
          groupTeam: { include: { group: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      groups: {
        include: {
          teams: {
            include: { team: true },
          },
          matches: { include: { homeTeam: true, awayTeam: true } },
        },
      },
      matches: {
        include: {
          homeTeam: true,
          awayTeam: true,
          group: true,
          goals: { include: { player: true } },
          cards: { include: { player: true } },
        },
        orderBy: { date: "asc" },
      },
      _count: { select: { registrations: true, matches: true } },
    },
  });
}

// ─── Turnuva oluştur ──────────────────────────────────────────
export async function createTournament(data: {
  name: string;
  city: string;
  venue?: string;
  startDate?: string;
  endDate?: string;
  deadline?: string;
  maxTeams: number;
  fee?: number;
  prize?: string;
  rules?: string;
  description?: string;
  format: TournamentFormat;
  groupCount?: number;
  advanceCount?: number;
  matchFormat: MatchFormat;
  winPoints: number;
  trackGoals: boolean;
  trackCards: boolean;
  yellowCardLimit: number;
  thirdPlace: boolean;
  extraTime: boolean;
}) {
  const session = await getSession();
  if (!session || session.role !== "ORGANIZER") throw new Error("Yetkisiz.");

  const tournament = await prisma.tournament.create({
    data: {
      ...data,
      organizerId: session.userId,
      status: "REGISTRATION",
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      deadline: data.deadline ? new Date(data.deadline) : null,
    },
  });

  // Grup aşaması varsa grupları oluştur
  if ((data.format === "GROUP_KNOCKOUT" || data.format === "GROUP_ONLY") && data.groupCount) {
    const groupNames = ["A", "B", "C", "D", "E", "F", "G", "H"].slice(0, data.groupCount);
    await prisma.group.createMany({
      data: groupNames.map((name) => ({ name: `Grup ${name}`, tournamentId: tournament.id })),
    });
  }

  revalidatePath("/organizer/tournaments");
  return tournament;
}

// ─── Turnuva durumunu güncelle ────────────────────────────────
export async function updateTournamentStatus(id: string, status: TournamentStatus) {
  const session = await getSession();
  if (!session) throw new Error("Yetkisiz.");
  await prisma.tournament.update({ where: { id }, data: { status } });
  revalidatePath(`/organizer/tournaments/${id}`);
}

// ─── Tüm açık turnuvalar (kaptan için) ────────────────────────
export async function getOpenTournaments(city?: string) {
  return prisma.tournament.findMany({
    where: {
      status: "REGISTRATION",
      ...(city ? { city } : {}),
    },
    include: {
      organizer: { select: { name: true } },
      _count: { select: { registrations: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
