"use server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { MatchStatus, LogLevel, LogCategory } from "@prisma/client";

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

// ─── Organizatör bilgilerini güncelle (admin) ─────────────────
export async function updateOrganizer(
  id: string,
  data: { name: string; email: string; phone: string; city: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { ok: false, error: "Yetkiniz yok." };

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target || target.role !== "ORGANIZER") return { ok: false, error: "Organizatör bulunamadı." };

  const name = data.name.trim();
  if (!name) return { ok: false, error: "İsim zorunludur." };

  const email = data.email.trim().toLowerCase() || null;
  if (email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== id) {
      return { ok: false, error: "Bu e-posta adresi zaten kullanımda." };
    }
  }

  await prisma.user.update({
    where: { id },
    data: {
      name,
      email,
      phone: data.phone.trim() || null,
      city: data.city.trim() || null,
    },
  });

  revalidatePath("/admin/organizers");
  return { ok: true };
}

// ─── Organizatör sil (admin) ──────────────────────────────────
export async function deleteOrganizer(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { ok: false, error: "Yetkiniz yok." };

  const target = await prisma.user.findUnique({
    where: { id },
    include: { _count: { select: { organizedTournaments: true } } },
  });
  if (!target || target.role !== "ORGANIZER") return { ok: false, error: "Organizatör bulunamadı." };

  if (target._count.organizedTournaments > 0) {
    return {
      ok: false,
      error: "Bu organizatöre ait turnuvalar var. Silmeden önce turnuvaları kaldırın.",
    };
  }

  await prisma.$transaction([
    prisma.notification.deleteMany({ where: { userId: id } }),
    prisma.announcement.deleteMany({ where: { organizerId: id } }),
    prisma.user.delete({ where: { id } }),
  ]);

  revalidatePath("/admin/organizers");
  return { ok: true };
}

// ─── Turnuva ismini değiştir (admin) ──────────────────────────
export async function updateTournamentName(
  id: string,
  name: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { ok: false, error: "Yetkiniz yok." };

  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Turnuva ismi boş olamaz." };

  const target = await prisma.tournament.findUnique({ where: { id }, select: { id: true } });
  if (!target) return { ok: false, error: "Turnuva bulunamadı." };

  await prisma.tournament.update({ where: { id }, data: { name: trimmed } });

  revalidatePath("/admin/tournaments");
  revalidatePath(`/admin/tournaments/${id}`);
  return { ok: true };
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

// ─── Takım adını değiştir (admin) ─────────────────────────────
export async function updateTeamName(
  id: string,
  name: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { ok: false, error: "Yetkiniz yok." };

  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Takım adı boş olamaz." };

  const target = await prisma.team.findUnique({ where: { id }, select: { id: true } });
  if (!target) return { ok: false, error: "Takım bulunamadı." };

  await prisma.team.update({ where: { id }, data: { name: trimmed } });

  revalidatePath("/admin/teams");
  return { ok: true };
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

// ─── Son aktiviteler (admin dashboard) ───────────────────────
export async function getRecentActivity() {
  const [recentMatches, recentRegs, recentCards] = await Promise.all([
    prisma.match.findMany({
      where: { status: "PLAYED" },
      orderBy: { updatedAt: "desc" },
      take: 4,
      select: {
        homeTeam: { select: { name: true } },
        awayTeam: { select: { name: true } },
        homeScore: true, awayScore: true,
        updatedAt: true,
        tournament: { select: { name: true } },
      },
    }),
    prisma.teamRegistration.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      select: {
        createdAt: true,
        team: { select: { name: true } },
        tournament: { select: { name: true } },
        status: true,
      },
    }),
    prisma.card.findMany({
      where: { type: "RED" },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        createdAt: true,
        player: { select: { name: true } },
        match: { select: { tournament: { select: { name: true } } } },
      },
    }),
  ]);

  type ActivityItem = { type: "match" | "reg" | "card"; text: string; time: Date };
  const items: ActivityItem[] = [
    ...recentMatches.map(m => ({
      type: "match" as const,
      text: `Maç sonucu: ${m.homeTeam.name} ${m.homeScore} – ${m.awayScore} ${m.awayTeam.name} (${m.tournament.name})`,
      time: m.updatedAt,
    })),
    ...recentRegs.map(r => ({
      type: "reg" as const,
      text: r.status === "APPROVED"
        ? `${r.team.name} onaylandı — ${r.tournament.name}`
        : `${r.team.name} başvurdu — ${r.tournament.name}`,
      time: r.createdAt,
    })),
    ...recentCards.map(c => ({
      type: "card" as const,
      text: `Kırmızı kart: ${c.player.name} (${c.match.tournament.name})`,
      time: c.createdAt,
    })),
  ];
  return items.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 8);
}

// ─── Tüm maçlar (admin) ───────────────────────────────────────
export async function getAllMatchesAdmin() {
  return prisma.match.findMany({
    include: {
      homeTeam: {
        select: {
          id: true,
          name: true,
          players: { select: { id: true, name: true, number: true }, orderBy: { number: "asc" } },
        },
      },
      awayTeam: {
        select: {
          id: true,
          name: true,
          players: { select: { id: true, name: true, number: true }, orderBy: { number: "asc" } },
        },
      },
      tournament: { select: { id: true, name: true } },
      group: { select: { name: true } },
      goals: { include: { player: { select: { name: true, teamId: true } } } },
      cards: { include: { player: { select: { name: true, teamId: true } } } },
    },
    orderBy: [{ date: "desc" }],
    take: 100,
  });
}

// ─── Maç tarih/saat/saha/durum düzenle (admin) ────────────────
export async function adminUpdateMatchSchedule(
  matchId: string,
  data: { date: string | null; time: string | null; venue: string | null; status: MatchStatus },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { ok: false, error: "Yetkiniz yok." };

  const match = await prisma.match.findUnique({ where: { id: matchId }, select: { tournamentId: true } });
  if (!match) return { ok: false, error: "Maç bulunamadı." };

  await prisma.match.update({
    where: { id: matchId },
    data: {
      date: data.date ? new Date(data.date + "T12:00:00") : null,
      time: data.time?.trim() || null,
      venue: data.venue?.trim() || null,
      status: data.status,
    },
  });

  revalidateMatchPaths(match.tournamentId);
  return { ok: true };
}

// ─── Maç gol/kart düzenle (admin) ─────────────────────────────
export async function adminSaveMatchEvents(
  matchId: string,
  data: {
    goals: { teamId: string; playerId: string; minute: number | null; ownGoal: boolean }[];
    cards: { playerId: string; type: "YELLOW" | "RED"; minute: number | null }[];
  },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { ok: false, error: "Yetkiniz yok." };

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { id: true, homeTeamId: true, awayTeamId: true, tournamentId: true, tournament: { select: { yellowCardLimit: true } } },
  });
  if (!match) return { ok: false, error: "Maç bulunamadı." };

  // Skoru gollerden hesapla (kendi kalesine goller rakibe sayılır)
  const homeScore =
    data.goals.filter(g => !g.ownGoal && g.teamId === match.homeTeamId).length +
    data.goals.filter(g => g.ownGoal && g.teamId === match.awayTeamId).length;
  const awayScore =
    data.goals.filter(g => !g.ownGoal && g.teamId === match.awayTeamId).length +
    data.goals.filter(g => g.ownGoal && g.teamId === match.homeTeamId).length;

  await prisma.$transaction([
    prisma.goal.deleteMany({ where: { matchId } }),
    prisma.card.deleteMany({ where: { matchId } }),
    prisma.match.update({
      where: { id: matchId },
      data: { homeScore, awayScore, status: "PLAYED" },
    }),
    ...(data.goals.length > 0 ? [prisma.goal.createMany({
      data: data.goals.map(g => ({
        matchId, teamId: g.teamId, playerId: g.playerId,
        minute: g.minute ?? undefined, ownGoal: g.ownGoal,
      })),
    })] : []),
    ...(data.cards.length > 0 ? [prisma.card.createMany({
      data: data.cards.map(c => ({
        matchId, playerId: c.playerId, type: c.type, minute: c.minute ?? undefined,
      })),
    })] : []),
  ]);

  // Sarı kart cezalarını yeniden hesapla (admin düzeltmesi: hem cezalandır hem kaldır)
  await recomputeYellowCardSuspensions(match.tournamentId, match.tournament.yellowCardLimit);

  revalidateMatchPaths(match.tournamentId);
  return { ok: true };
}

// Turnuva genelinde sarı kart cezalarını yeniden hesapla (ACTIVE ↔ SUSPENDED)
async function recomputeYellowCardSuspensions(tournamentId: string, limit: number) {
  const regs = await prisma.teamRegistration.findMany({
    where: { tournamentId }, select: { teamId: true },
  });
  const teamIds = regs.map(r => r.teamId);
  if (teamIds.length === 0) return;

  const players = await prisma.player.findMany({
    where: { teamId: { in: teamIds }, status: { in: ["ACTIVE", "SUSPENDED"] } },
    select: { id: true, status: true },
  });
  const yellows = await prisma.card.groupBy({
    by: ["playerId"],
    where: { type: "YELLOW", match: { tournamentId } },
    _count: { playerId: true },
  });
  const yellowMap = new Map(yellows.map(y => [y.playerId, y._count.playerId]));

  await Promise.all(players.map(p => {
    const count = yellowMap.get(p.id) ?? 0;
    const shouldSuspend = count >= limit;
    if (shouldSuspend && p.status !== "SUSPENDED")
      return prisma.player.update({ where: { id: p.id }, data: { status: "SUSPENDED" } });
    if (!shouldSuspend && p.status === "SUSPENDED")
      return prisma.player.update({ where: { id: p.id }, data: { status: "ACTIVE" } });
    return Promise.resolve();
  }));
}

function revalidateMatchPaths(tournamentId: string) {
  revalidatePath("/admin/matches");
  revalidatePath(`/admin/tournaments/${tournamentId}`);
  revalidatePath(`/organizer/tournaments/${tournamentId}/matches`);
  revalidatePath(`/organizer/tournaments/${tournamentId}/standings`);
  revalidatePath(`/organizer/tournaments/${tournamentId}/stats`);
  revalidatePath(`/captain/tournaments/${tournamentId}`);
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

// ─── Sistem logları (sadece admin) ───────────────────────────
export async function getAdminLogs(opts?: {
  level?: string;
  category?: string;
  limit?: number;
  skip?: number;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") throw new Error("Yetkisiz.");

  const where = {
    ...(opts?.level && opts.level !== "ALL"     ? { level: opts.level as LogLevel } : {}),
    ...(opts?.category && opts.category !== "ALL" ? { category: opts.category as LogCategory } : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.log.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: opts?.limit ?? 100,
      skip: opts?.skip ?? 0,
    }),
    prisma.log.count({ where }),
  ]);

  return { logs, total };
}

