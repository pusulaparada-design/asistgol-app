"use server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { TournamentFormat, TournamentStatus, MatchFormat } from "@prisma/client";
import { createNotification, createNotifications } from "./notification";
import {
  sendRegistrationApprovedEmail,
  sendRegistrationRejectedEmail,
  sendMatchResultEmail,
} from "@/lib/email";
import { sendWeeklySummaryForRound } from "./summary";

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
          team: {
            include: {
              captain: { select: { name: true, phone: true } },
              players: { select: { id: true, name: true, number: true, position: true, status: true }, orderBy: { number: "asc" } },
              _count: { select: { players: true } },
            },
          },
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
  status?: TournamentStatus;
}) {
  const session = await getSession();
  if (!session || session.role !== "ORGANIZER") throw new Error("Yetkisiz.");

  const { status: inputStatus, ...rest } = data;

  const tournament = await prisma.tournament.create({
    data: {
      ...rest,
      organizerId: session.userId,
      status: inputStatus ?? "REGISTRATION",
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

// ─── Maç listesi (skor girişi için) ──────────────────────────
export async function getTournamentMatches(tournamentId: string) {
  return prisma.match.findMany({
    where: { tournamentId },
    include: {
      homeTeam: {
        include: { players: { select: { id: true, name: true, number: true }, orderBy: { number: "asc" } } },
      },
      awayTeam: {
        include: { players: { select: { id: true, name: true, number: true }, orderBy: { number: "asc" } } },
      },
      group: { select: { name: true } },
      goals: { include: { player: { select: { name: true, number: true } } } },
      cards: { include: { player: { select: { name: true, number: true, teamId: true } } } },
    },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
  });
}

// ─── Skor kaydet ──────────────────────────────────────────────
export async function saveMatchScore(data: {
  matchId: string;
  homeScore: number;
  awayScore: number;
  finished: boolean;
  goals: { teamId: string; playerId: string; minute: number | null; ownGoal?: boolean }[];
  cards: { playerId: string; type: "YELLOW" | "RED"; minute: number | null }[];
}) {
  const session = await getSession();
  if (!session) throw new Error("Yetkisiz.");

  const match = await prisma.match.update({
    where: { id: data.matchId },
    data: { homeScore: data.homeScore, awayScore: data.awayScore, status: data.finished ? "PLAYED" : "LIVE" },
    include: {
      homeTeam: { include: { captain: { select: { id: true, name: true, email: true } } } },
      awayTeam: { include: { captain: { select: { id: true, name: true, email: true } } } },
      tournament: { select: { id: true, name: true } },
    },
  });

  await prisma.goal.deleteMany({ where: { matchId: data.matchId } });
  await prisma.card.deleteMany({ where: { matchId: data.matchId } });

  if (data.goals.length > 0) {
    await prisma.goal.createMany({
      data: data.goals.map(g => ({
        matchId: data.matchId,
        teamId: g.teamId,
        playerId: g.playerId,
        minute: g.minute ?? undefined,
        ownGoal: g.ownGoal ?? false,
      })),
    });
  }

  if (data.cards.length > 0) {
    await prisma.card.createMany({
      data: data.cards.map(c => ({
        matchId: data.matchId,
        playerId: c.playerId,
        type: c.type,
        minute: c.minute ?? undefined,
      })),
    });
  }

  revalidatePath(`/organizer/tournaments/${match.tournament.id}/matches`);
  revalidatePath(`/organizer/tournaments/${match.tournament.id}/standings`);
  revalidatePath(`/organizer/tournaments/${match.tournament.id}/stats`);

  if (data.finished) {
    const homeCaptain = match.homeTeam.captain;
    const awayCaptain = match.awayTeam.captain;
    const notifBody = `${match.homeTeam.name} ${data.homeScore} – ${data.awayScore} ${match.awayTeam.name} · ${match.tournament.name}`;
    const notifLink = `/captain/tournaments/${match.tournament.id}`;

    await createNotifications([
      { userId: homeCaptain.id, type: "MATCH_RESULT", title: "Maç sonucu açıklandı", body: notifBody, link: notifLink },
      { userId: awayCaptain.id, type: "MATCH_RESULT", title: "Maç sonucu açıklandı", body: notifBody, link: notifLink },
    ]);

    const emailData = {
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      homeScore: data.homeScore,
      awayScore: data.awayScore,
      tournamentName: match.tournament.name,
      tournamentId: match.tournament.id,
    };
    const emailJobs = [homeCaptain, awayCaptain]
      .filter(c => c.email)
      .map(c => sendMatchResultEmail({ to: c.email!, captainName: c.name, ...emailData }).catch(() => {}));
    await Promise.allSettled(emailJobs);
  }

  // ── Haftalık özet: round tamamlandı mı? ────────────────────
  if (data.finished && match.round) {
    const roundMatches = await prisma.match.findMany({
      where: { tournamentId: match.tournament.id, round: match.round },
      select: { status: true },
    });
    const allPlayed = roundMatches.every(m => m.status === "PLAYED");
    if (allPlayed) {
      sendWeeklySummaryForRound(match.tournament.id, match.round).catch(() => {});
    }
  }

  return { ok: true };
}

// ─── Maçı başlat (SCHEDULED → LIVE) ──────────────────────────
export async function startMatch(data: {
  matchId: string;
  homeLineup: string[];
  awayLineup: string[];
}) {
  const session = await getSession();
  if (!session) throw new Error("Yetkisiz.");

  const match = await prisma.match.update({
    where: { id: data.matchId },
    data: {
      status: "LIVE",
      homeLineup: data.homeLineup,
      awayLineup: data.awayLineup,
    },
    select: { tournamentId: true },
  });

  revalidatePath(`/organizer/tournaments/${match.tournamentId}/matches`);
}

// ─── Kayıt listesi + oyuncular ────────────────────────────────
export async function getTournamentRegistrations(tournamentId: string) {
  return prisma.teamRegistration.findMany({
    where: { tournamentId },
    include: {
      team: {
        include: {
          captain: { select: { name: true, phone: true } },
          players: {
            select: { id: true, name: true, number: true, position: true, status: true },
            orderBy: { number: "asc" },
          },
        },
      },
      groupTeam: { include: { group: { select: { name: true } } } },
    },
    orderBy: { createdAt: "asc" },
  });
}

// ─── Ödeme durumu değiştir ────────────────────────────────────
export async function togglePayment(regId: string) {
  const session = await getSession();
  if (!session) throw new Error("Yetkisiz.");
  const reg = await prisma.teamRegistration.findUnique({ where: { id: regId }, select: { paid: true, tournamentId: true } });
  if (!reg) throw new Error("Kayıt bulunamadı.");
  await prisma.teamRegistration.update({ where: { id: regId }, data: { paid: !reg.paid } });
  revalidatePath(`/organizer/tournaments/${reg.tournamentId}/manage`);
  return { ok: true };
}

// ─── Kayıt onayla ─────────────────────────────────────────────
export async function approveRegistration(regId: string) {
  const session = await getSession();
  if (!session) throw new Error("Yetkisiz.");
  const reg = await prisma.teamRegistration.update({
    where: { id: regId },
    data: { status: "APPROVED" },
    include: {
      team: { include: { captain: { select: { id: true, name: true, email: true } } } },
      tournament: { select: { id: true, name: true } },
    },
  });
  revalidatePath(`/organizer/tournaments/${reg.tournamentId}/teams`);
  revalidatePath(`/organizer/tournaments/${reg.tournamentId}/manage`);

  const captain = reg.team.captain;
  await createNotification({
    userId: captain.id,
    type: "REGISTRATION_APPROVED",
    title: "Başvurunuz onaylandı!",
    body: `${reg.team.name} takımınız ${reg.tournament.name} turnuvasına kabul edildi.`,
    link: `/captain/tournaments/${reg.tournament.id}`,
  });
  if (captain.email) {
    sendRegistrationApprovedEmail({
      to: captain.email,
      captainName: captain.name,
      teamName: reg.team.name,
      tournamentName: reg.tournament.name,
      tournamentId: reg.tournament.id,
    }).catch(() => {});
  }
  return { ok: true };
}

// ─── Kayıt reddet ─────────────────────────────────────────────
export async function rejectRegistration(regId: string) {
  const session = await getSession();
  if (!session) throw new Error("Yetkisiz.");
  const reg = await prisma.teamRegistration.update({
    where: { id: regId },
    data: { status: "REJECTED" },
    include: {
      team: { include: { captain: { select: { id: true, name: true, email: true } } } },
      tournament: { select: { id: true, name: true } },
    },
  });
  revalidatePath(`/organizer/tournaments/${reg.tournamentId}/teams`);
  revalidatePath(`/organizer/tournaments/${reg.tournamentId}/manage`);

  const captain = reg.team.captain;
  await createNotification({
    userId: captain.id,
    type: "REGISTRATION_REJECTED",
    title: "Başvurunuz reddedildi",
    body: `${reg.team.name} takımınızın ${reg.tournament.name} başvurusu reddedildi.`,
    link: `/captain/tournaments`,
  });
  if (captain.email) {
    sendRegistrationRejectedEmail({
      to: captain.email,
      captainName: captain.name,
      teamName: reg.team.name,
      tournamentName: reg.tournament.name,
    }).catch(() => {});
  }
  return { ok: true };
}

// ─── Grupları takımlarla getir ────────────────────────────────
export async function getGroupsWithTeams(tournamentId: string) {
  return prisma.group.findMany({
    where: { tournamentId },
    include: {
      teams: {
        include: { team: { select: { id: true, name: true } } },
        orderBy: { id: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });
}

// ─── Takımları gruplara otomatik dağıt ───────────────────────
export async function redistributeGroups(tournamentId: string) {
  const session = await getSession();
  if (!session) throw new Error("Yetkisiz.");
  const [regs, groups] = await Promise.all([
    prisma.teamRegistration.findMany({
      where: { tournamentId, status: "APPROVED" },
      orderBy: { createdAt: "asc" },
    }),
    prisma.group.findMany({ where: { tournamentId }, orderBy: { name: "asc" } }),
  ]);
  if (groups.length === 0) throw new Error("Henüz grup yok.");
  await prisma.groupTeam.deleteMany({ where: { group: { tournamentId } } });
  await prisma.groupTeam.createMany({
    data: regs.map((reg, i) => ({
      groupId: groups[i % groups.length].id,
      teamId: reg.teamId,
      registrationId: reg.id,
    })),
  });
  revalidatePath(`/organizer/tournaments/${tournamentId}/manage`);
  revalidatePath(`/organizer/tournaments/${tournamentId}`);
}

// ─── Takımı gruba taşı ────────────────────────────────────────
export async function moveTeamToGroup(registrationId: string, newGroupId: string) {
  const session = await getSession();
  if (!session) throw new Error("Yetkisiz.");
  const existing = await prisma.groupTeam.findUnique({ where: { registrationId } });
  if (existing) {
    await prisma.groupTeam.update({ where: { registrationId }, data: { groupId: newGroupId } });
  } else {
    const reg = await prisma.teamRegistration.findUnique({ where: { id: registrationId } });
    if (!reg) throw new Error("Kayıt bulunamadı.");
    await prisma.groupTeam.create({ data: { groupId: newGroupId, teamId: reg.teamId, registrationId } });
  }
  const group = await prisma.group.findUnique({ where: { id: newGroupId } });
  revalidatePath(`/organizer/tournaments/${group!.tournamentId}/manage`);
  revalidatePath(`/organizer/tournaments/${group!.tournamentId}`);
}

// ─── Fikstür kaydet ──────────────────────────────────────────
export async function saveGeneratedFixtures(
  tournamentId: string,
  fixtures: {
    homeTeamId: string;
    awayTeamId: string;
    groupId: string;
    round: string;
    date: string | null;
    time: string | null;
  }[]
) {
  const session = await getSession();
  if (!session) throw new Error("Yetkisiz.");
  await prisma.match.deleteMany({ where: { tournamentId, homeScore: null, awayScore: null } });
  await prisma.match.createMany({
    data: fixtures.map(f => ({
      tournamentId,
      homeTeamId: f.homeTeamId,
      awayTeamId: f.awayTeamId,
      groupId: f.groupId,
      round: f.round,
      date: f.date ? new Date(f.date) : null,
      time: f.time,
      status: "SCHEDULED",
    })),
  });
  revalidatePath(`/organizer/tournaments/${tournamentId}/manage`);
  revalidatePath(`/organizer/tournaments/${tournamentId}`);
  revalidatePath(`/organizer/tournaments/${tournamentId}/fixture`);
  revalidatePath(`/captain/schedule`);
  revalidatePath(`/captain/tournaments`);
}
