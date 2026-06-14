"use server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notification";
import { sendNewRegistrationEmail } from "@/lib/email";

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

  const [reg, team, tournament] = await Promise.all([
    prisma.teamRegistration.create({ data: { teamId, tournamentId, note } }),
    prisma.team.findUnique({
      where: { id: teamId },
      select: { name: true, captain: { select: { name: true } } },
    }),
    prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: { id: true, name: true, organizerId: true, organizer: { select: { name: true, email: true } } },
    }),
  ]);

  if (team && tournament) {
    await createNotification({
      userId: tournament.organizerId,
      type: "REGISTRATION_RECEIVED",
      title: "Yeni turnuva başvurusu",
      body: `${team.name} takımı ${tournament.name} turnuvasına başvurdu.`,
      link: `/organizer/tournaments/${tournament.id}/manage`,
    });
    if (tournament.organizer.email) {
      sendNewRegistrationEmail({
        to: tournament.organizer.email,
        organizerName: tournament.organizer.name,
        teamName: team.name,
        captainName: team.captain.name,
        tournamentName: tournament.name,
        tournamentId: tournament.id,
      }).catch(() => {});
    }
  }

  revalidatePath("/captain/registrations");
  revalidatePath("/captain/tournaments");
  revalidatePath("/captain");
  return reg;
}

// ─── Oyuncu ekle ──────────────────────────────────────────────
export async function addPlayerToTeam(teamId: string, data: { name: string; number?: number }) {
  const session = await getSession();
  if (!session || session.role !== "CAPTAIN") throw new Error("Yetkisiz.");

  const team = await prisma.team.findUnique({ where: { id: teamId, captainId: session.userId } });
  if (!team) throw new Error("Takım bulunamadı.");

  if (data.number != null) {
    const existing = await prisma.player.findFirst({ where: { teamId, number: data.number } });
    if (existing) throw new Error(`${data.number} numarası zaten ${existing.name} tarafından kullanılıyor.`);
  }

  const player = await prisma.player.create({
    data: { teamId, name: data.name.trim(), number: data.number },
    include: { goals: true, assists: true, cards: true },
  });

  revalidatePath(`/captain/my-teams/${teamId}`);
  return player;
}

// ─── Oyuncu çıkar ─────────────────────────────────────────────
export async function removePlayerFromTeam(playerId: string) {
  const session = await getSession();
  if (!session || session.role !== "CAPTAIN") throw new Error("Yetkisiz.");

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: { team: { select: { captainId: true, id: true } } },
  });
  if (!player || player.team.captainId !== session.userId) throw new Error("Yetkisiz.");

  await prisma.player.delete({ where: { id: playerId } });
  revalidatePath(`/captain/my-teams/${player.team.id}`);
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
