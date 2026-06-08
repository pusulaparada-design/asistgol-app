"use server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ─── Takım oluştur ────────────────────────────────────────────
export async function createTeam(data: {
  name: string;
  city?: string;
  color?: string;
  description?: string;
  players: { name: string; number?: number; position?: string }[];
}) {
  const session = await getSession();
  if (!session || session.role !== "CAPTAIN") throw new Error("Yetkisiz.");

  const team = await prisma.team.create({
    data: {
      name: data.name,
      city: data.city,
      color: data.color,
      description: data.description,
      captainId: session.userId,
      players: {
        create: data.players.map((p) => ({
          name: p.name,
          number: p.number,
          position: p.position,
        })),
      },
    },
    include: { players: true },
  });

  revalidatePath("/captain/my-teams");
  return team;
}

// ─── Kaptanın takımları ───────────────────────────────────────
export async function getMyTeams() {
  const session = await getSession();
  if (!session) throw new Error("Yetkisiz.");

  return prisma.team.findMany({
    where: { captainId: session.userId },
    include: {
      players: true,
      registrations: {
        include: {
          tournament: { select: { id: true, name: true, status: true } },
          groupTeam: { include: { group: true } },
        },
      },
      _count: { select: { players: true } },
    },
  });
}

// ─── Takım detayı ─────────────────────────────────────────────
export async function getTeam(id: string) {
  return prisma.team.findUnique({
    where: { id },
    include: {
      players: {
        include: {
          goals: { include: { match: { select: { tournamentId: true } } } },
          assists: true,
          cards: true,
        },
      },
      captain: { select: { name: true, phone: true } },
      registrations: {
        include: {
          tournament: true,
          groupTeam: { include: { group: true } },
        },
      },
    },
  });
}

// ─── Turnuvaya kayıt ──────────────────────────────────────────
export async function registerTeamToTournament(teamId: string, tournamentId: string, note?: string) {
  const session = await getSession();
  if (!session || session.role !== "CAPTAIN") throw new Error("Yetkisiz.");

  // Daha önce kayıt var mı?
  const existing = await prisma.teamRegistration.findUnique({
    where: { teamId_tournamentId: { teamId, tournamentId } },
  });
  if (existing) throw new Error("Bu takım zaten kayıtlı.");

  const reg = await prisma.teamRegistration.create({
    data: { teamId, tournamentId, note },
  });

  revalidatePath("/captain/registrations");
  return reg;
}

// ─── Organizatör kayıt onayla / reddet ────────────────────────
export async function updateRegistrationStatus(
  registrationId: string,
  status: "APPROVED" | "REJECTED",
  groupId?: string,
  rejectionReason?: string
) {
  const session = await getSession();
  if (!session || session.role !== "ORGANIZER") throw new Error("Yetkisiz.");

  const reg = await prisma.teamRegistration.update({
    where: { id: registrationId },
    data: { status, rejectionReason },
  });

  // Onaylandı ve grup atandıysa GroupTeam oluştur
  if (status === "APPROVED" && groupId) {
    await prisma.groupTeam.upsert({
      where: { groupId_teamId: { groupId, teamId: reg.teamId } },
      create: { groupId, teamId: reg.teamId, registrationId },
      update: {},
    });
  }

  revalidatePath(`/organizer/tournaments/${reg.tournamentId}/teams`);
  return reg;
}

// ─── Turnuvanın tüm takımları (organizatör) ───────────────────
export async function getTournamentTeams(tournamentId: string) {
  return prisma.teamRegistration.findMany({
    where: { tournamentId },
    include: {
      team: {
        include: {
          captain: { select: { name: true, phone: true } },
          _count: { select: { players: true } },
        },
      },
      groupTeam: { include: { group: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}
