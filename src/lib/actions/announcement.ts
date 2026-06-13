"use server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createNotifications } from "./notification";
import { sendAnnouncementEmail } from "@/lib/email";

export async function getOrganizerAnnouncements() {
  const session = await getSession();
  if (!session) throw new Error("Yetkisiz.");
  return prisma.announcement.findMany({
    where: { organizerId: session.userId },
    include: { tournament: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCaptainAnnouncements() {
  const session = await getSession();
  if (!session) throw new Error("Yetkisiz.");

  const teams = await prisma.team.findMany({
    where: { captainId: session.userId },
    select: { id: true },
  });
  const teamIds = teams.map((t) => t.id);

  const regs = await prisma.teamRegistration.findMany({
    where: { teamId: { in: teamIds }, status: "APPROVED" },
    include: { tournament: { select: { id: true, organizerId: true } } },
  });

  const tournamentIds = [...new Set(regs.map((r) => r.tournamentId))];
  const organizerIds  = [...new Set(regs.map((r) => r.tournament.organizerId))];

  return prisma.announcement.findMany({
    where: {
      OR: [
        { tournamentId: { in: tournamentIds } },
        { tournamentId: null, organizerId: { in: organizerIds } },
      ],
    },
    include: {
      tournament: { select: { name: true } },
      organizer: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrganizerTournamentsWithTeams() {
  const session = await getSession();
  if (!session) throw new Error("Yetkisiz.");
  return prisma.tournament.findMany({
    where: { organizerId: session.userId },
    select: {
      id: true,
      name: true,
      registrations: {
        where: { status: "APPROVED" },
        select: { team: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createAnnouncement(data: {
  title: string;
  body: string;
  tournamentId: string | null; // null = tüm turnuvalar
  target: string;
}) {
  const session = await getSession();
  if (!session || session.role !== "ORGANIZER") throw new Error("Yetkisiz.");

  if (data.tournamentId === null) {
    // ── Tüm Turnuvalarım ─────────────────────────────────────────
    await prisma.announcement.create({
      data: {
        title:      data.title,
        body:       data.body,
        target:     "Tüm Turnuvalar",
        organizerId: session.userId,
        tournamentId: undefined,
      },
    });

    const allRegs = await prisma.teamRegistration.findMany({
      where: {
        tournament: { organizerId: session.userId },
        status: "APPROVED",
      },
      include: {
        team: { include: { captain: { select: { id: true, name: true, email: true } } } },
      },
    });

    // Kaptanları tekilleştir
    const captainMap: Record<string, { id: string; name: string; email: string | null }> = {};
    for (const reg of allRegs) {
      captainMap[reg.team.captain.id] = reg.team.captain;
    }
    const captains = Object.values(captainMap);

    await createNotifications(captains.map(c => ({
      userId: c.id,
      type: "ANNOUNCEMENT" as const,
      title: data.title,
      body: data.body.slice(0, 120) + (data.body.length > 120 ? "…" : ""),
      link: `/captain/tournaments`,
    })));

    await Promise.allSettled(
      captains
        .filter(c => c.email)
        .map(c => sendAnnouncementEmail({
          to: c.email!,
          captainName: c.name,
          announcementTitle: data.title,
          announcementBody: data.body,
          tournamentName: "Tüm Turnuvalarınız",
        }).catch(() => {}))
    );
  } else {
    // ── Tek turnuva ──────────────────────────────────────────────
    await prisma.announcement.create({
      data: {
        title:        data.title,
        body:         data.body,
        tournamentId: data.tournamentId,
        target:       data.target,
        organizerId:  session.userId,
      },
    });

    const regs = await prisma.teamRegistration.findMany({
      where: { tournamentId: data.tournamentId, status: "APPROVED" },
      include: {
        team: { include: { captain: { select: { id: true, name: true, email: true } } } },
        tournament: { select: { id: true, name: true } },
      },
    });

    const notifications = regs.map(r => ({
      userId: r.team.captain.id,
      type: "ANNOUNCEMENT" as const,
      title: data.title,
      body: data.body.slice(0, 120) + (data.body.length > 120 ? "…" : ""),
      link: `/captain/tournaments/${r.tournamentId}`,
    }));
    await createNotifications(notifications);

    await Promise.allSettled(
      regs
        .filter(r => r.team.captain.email)
        .map(r => sendAnnouncementEmail({
          to: r.team.captain.email!,
          captainName: r.team.captain.name,
          announcementTitle: data.title,
          announcementBody: data.body,
          tournamentName: r.tournament.name,
          tournamentId: r.tournamentId,
        }).catch(() => {}))
    );
  }

  revalidatePath("/organizer/announcements");
  revalidatePath("/organizer/notifications");
}

export async function getCaptainProfile() {
  const session = await getSession();
  if (!session) throw new Error("Yetkisiz.");

  const [user, teams] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId } }),
    prisma.team.findMany({
      where: { captainId: session.userId },
      include: { _count: { select: { registrations: true } } },
    }),
  ]);

  const totalTournaments = teams.reduce((s, t) => s + t._count.registrations, 0);
  return { user, teams, totalTournaments };
}

export async function updateUserProfile(data: { name: string; email: string; phone: string; city: string }) {
  const session = await getSession();
  if (!session) throw new Error("Yetkisiz.");
  await prisma.user.update({
    where: { id: session.userId },
    data: { name: data.name, email: data.email || null, phone: data.phone || null, city: data.city || null },
  });
  revalidatePath("/captain/profile");
}
