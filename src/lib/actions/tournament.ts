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
  sendRescheduleEmail,
} from "@/lib/email";
import { sendWeeklySummaryForRound } from "./summary";
import { logAction, logError } from "@/lib/logger";

// ─── Turnuvaları listele ──────────────────────────────────────
export async function getTournaments(organizerId?: string) {
  return prisma.tournament.findMany({
    where: organizerId ? { organizerId } : undefined,
    include: {
      organizer: { select: { name: true } },
      _count: { select: { registrations: true, matches: true } },
      registrations: { where: { status: "APPROVED" }, select: { id: true } },
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
          groupTeam: { include: { group: { select: { id: true, name: true } } } },
        },
        orderBy: { createdAt: "asc" },
      },
      groups: {
        include: {
          teams: {
            include: { team: { select: { id: true, name: true } } },
          },
          matches: {
            include: {
              homeTeam: { select: { id: true, name: true } },
              awayTeam: { select: { id: true, name: true } },
            },
          },
        },
      },
      matches: {
        include: {
          homeTeam: { select: { id: true, name: true } },
          awayTeam: { select: { id: true, name: true } },
          group:    { select: { id: true, name: true } },
          goals: { include: { player: { select: { id: true, name: true, teamId: true } } } },
          cards: { include: { player: { select: { id: true, name: true, teamId: true } } } },
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
  logAction(session, `Turnuva oluşturuldu: ${data.name}`, { tournamentId: tournament.id, city: data.city, format: data.format }).catch(() => {});
  return tournament;
}

// ─── Turnuva bilgilerini güncelle (başlamadan önce) ──────────
export async function updateTournamentDetails(
  id: string,
  data: {
    name: string; description: string; venue: string;
    startDate: string; endDate: string; fee: string; prize: string;
    yellowCardLimit: number; trackGoals: boolean; trackCards: boolean;
    winPoints: number; thirdPlace: boolean; extraTime: boolean;
    groupCount: number; advanceCount: number;
  }
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Yetkisiz." };

  const tournament = await prisma.tournament.findUnique({ where: { id }, select: { organizerId: true, status: true } });
  if (!tournament) return { ok: false, error: "Turnuva bulunamadı." };
  if (tournament.organizerId !== session.userId) return { ok: false, error: "Yetkisiz." };
  if (tournament.status === "ACTIVE" || tournament.status === "COMPLETED") {
    return { ok: false, error: "Turnuva başladıktan sonra bilgiler düzenlenemez." };
  }

  const name = data.name.trim();
  if (!name) return { ok: false, error: "Turnuva adı boş olamaz." };

  await prisma.tournament.update({
    where: { id },
    data: {
      name,
      description: data.description.trim() || null,
      venue: data.venue.trim() || null,
      startDate: data.startDate ? new Date(data.startDate + "T12:00:00") : null,
      endDate: data.endDate ? new Date(data.endDate + "T12:00:00") : null,
      fee: data.fee ? Number(data.fee) : null,
      prize: data.prize.trim() || null,
      yellowCardLimit: data.yellowCardLimit,
      trackGoals: data.trackGoals,
      trackCards: data.trackCards,
      winPoints: data.winPoints,
      thirdPlace: data.thirdPlace,
      extraTime: data.extraTime,
      groupCount: data.groupCount,
      advanceCount: data.advanceCount,
    },
  });

  revalidatePath(`/organizer/tournaments/${id}`);
  revalidatePath(`/organizer/tournaments/${id}/manage`);
  revalidatePath(`/organizer/tournaments`);
  return { ok: true };
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
      registrations: { where: { status: "APPROVED" }, select: { id: true } },
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
        include: {
          players: {
            select: {
              id: true, name: true, number: true,
              suspensions: { where: { tournamentId }, select: { remainingMatches: true } },
            },
            orderBy: { number: "asc" },
          },
        },
      },
      awayTeam: {
        include: {
          players: {
            select: {
              id: true, name: true, number: true,
              suspensions: { where: { tournamentId }, select: { remainingMatches: true } },
            },
            orderBy: { number: "asc" },
          },
        },
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
  revalidatePath(`/organizer/tournaments/${match.tournament.id}/manage`);
  revalidatePath(`/captain/tournaments/${match.tournament.id}`);

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

  if (data.finished) {
    logAction(session, `Maç skoru girildi: ${match.homeTeam.name} ${data.homeScore}–${data.awayScore} ${match.awayTeam.name}`, { matchId: data.matchId, tournamentId: match.tournament.id }).catch(() => {});
  }

  // ── Otomatik ceza hesaplama ──────────────────────────────
  if (data.finished) {
    // 1) Bu maçta oynayan her iki takımın askıdaki oyuncularının ceza sayacını 1 azalt
    const eligiblePlayerIds = await prisma.player.findMany({
      where: { teamId: { in: [match.homeTeamId, match.awayTeamId] } },
      select: { id: true },
    }).then(ps => ps.map(p => p.id));

    await prisma.playerSuspension.updateMany({
      where: {
        tournamentId: match.tournament.id,
        playerId: { in: eligiblePlayerIds },
        remainingMatches: { gt: 0 },
      },
      data: { remainingMatches: { decrement: 1 } },
    });

    // 2) Bu maçtaki kartlara göre yeni cezalar oluştur
    if (data.cards.length > 0) {
      const { yellowCardLimit } = await prisma.tournament.findUniqueOrThrow({
        where: { id: match.tournament.id },
        select: { yellowCardLimit: true },
      });

      const cardsByPlayer = new Map<string, { yellows: number; reds: number }>();
      for (const card of data.cards) {
        const e = cardsByPlayer.get(card.playerId) ?? { yellows: 0, reds: 0 };
        if (card.type === "YELLOW") e.yellows++; else e.reds++;
        cardsByPlayer.set(card.playerId, e);
      }

      for (const [playerId, cards] of cardsByPlayer) {
        const doubleYellow = cards.yellows >= 2;
        const directRed   = cards.reds > 0;

        let banMatches    = 0;
        let yellowsForCycle = 0;

        if (doubleYellow && directRed) {
          banMatches = 2;                          // kırmızı baskın
        } else if (doubleYellow) {
          banMatches = 1;                          // 2 sarı = 1 maç ceza, döngüye sayılmaz
        } else if (directRed) {
          banMatches = 2;                          // direkt kırmızı = 2 maç
          yellowsForCycle = cards.yellows;         // beraberindeki sarı döngüye sayılır
        } else {
          yellowsForCycle = cards.yellows;         // normal sarı kartlar
        }

        let cycleBan       = 0;
        let finalYellowCycle = 0;

        if (yellowsForCycle > 0) {
          const current = await prisma.playerSuspension.findUnique({
            where: { playerId_tournamentId: { playerId, tournamentId: match.tournament.id } },
          });
          const newCount = (current?.yellowCycleCount ?? 0) + yellowsForCycle;
          if (newCount >= yellowCardLimit) {
            cycleBan = 1;
            finalYellowCycle = 0;
          } else {
            finalYellowCycle = newCount;
          }
        }

        const totalBan = banMatches + cycleBan;

        if (totalBan > 0 || yellowsForCycle > 0) {
          await prisma.playerSuspension.upsert({
            where: { playerId_tournamentId: { playerId, tournamentId: match.tournament.id } },
            create: {
              playerId, tournamentId: match.tournament.id,
              remainingMatches: totalBan,
              yellowCycleCount: finalYellowCycle,
            },
            update: {
              remainingMatches: { increment: totalBan },
              ...(yellowsForCycle > 0 || cycleBan > 0 ? { yellowCycleCount: finalYellowCycle } : {}),
            },
          });
        }
      }
    }
  }

  // ── Otomatik turnuva tamamlama ───────────────────────────
  if (data.finished) {
    const allMatches = await prisma.match.findMany({
      where: { tournamentId: match.tournament.id },
      select: { status: true },
    });
    if (allMatches.length > 0 && allMatches.every(m => m.status === "PLAYED")) {
      await prisma.tournament.update({
        where: { id: match.tournament.id },
        data: { status: "COMPLETED" },
      });
      revalidatePath(`/organizer/tournaments/${match.tournament.id}`);
      revalidatePath(`/organizer/tournaments`);
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
  logAction(session, `Kayıt onaylandı: ${reg.team.name} → ${reg.tournament.name}`, { regId, teamId: reg.teamId, tournamentId: reg.tournamentId }).catch(() => {});
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
  logAction(session, `Kayıt reddedildi: ${reg.team.name} → ${reg.tournament.name}`, { regId, teamId: reg.teamId, tournamentId: reg.tournamentId }).catch(() => {});
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
  // Fikstür oluşturulunca turnuva otomatik "Devam Ediyor" olur
  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { status: "ACTIVE" },
  });
  revalidatePath(`/organizer/tournaments/${tournamentId}/manage`);
  revalidatePath(`/organizer/tournaments/${tournamentId}`);
  revalidatePath(`/organizer/tournaments/${tournamentId}/fixture`);
  revalidatePath(`/captain/schedule`);
  revalidatePath(`/captain/tournaments`);
}

// ─── Eleme maçı oluştur ───────────────────────────────────────
export async function generateKnockoutFixtures(
  tournamentId: string,
  fixtures: {
    homeTeamId: string;
    awayTeamId: string;
    round: string;
    date: string | null;
    time: string | null;
  }[]
) {
  const session = await getSession();
  if (!session) throw new Error("Yetkisiz.");
  const rounds = [...new Set(fixtures.map((f) => f.round))];
  await prisma.match.deleteMany({
    where: { tournamentId, groupId: null, round: { in: rounds }, homeScore: null },
  });
  await prisma.match.createMany({
    data: fixtures.map((f) => ({
      tournamentId,
      homeTeamId: f.homeTeamId,
      awayTeamId: f.awayTeamId,
      round: f.round,
      date: f.date ? new Date(f.date) : null,
      time: f.time,
      status: "SCHEDULED" as const,
    })),
  });
  revalidatePath(`/organizer/tournaments/${tournamentId}/manage`);
  revalidatePath(`/organizer/tournaments/${tournamentId}`);
  revalidatePath(`/admin/tournaments/${tournamentId}`);
  revalidatePath(`/captain/tournaments`);
}

// ─── Turnuvayı tamamla ────────────────────────────────────────
export async function completeTournament(id: string) {
  const session = await getSession();
  if (!session) throw new Error("Yetkisiz.");
  await prisma.tournament.update({ where: { id }, data: { status: "COMPLETED" } });
  revalidatePath(`/organizer/tournaments/${id}/manage`);
  revalidatePath(`/organizer/tournaments/${id}`);
  revalidatePath(`/organizer/tournaments`);
  revalidatePath(`/captain/tournaments`);
}

// ─── Takım turnuva istatistikleri ────────────────────────────
export async function getTeamTournamentStats(tournamentId: string, teamId: string) {
  const [matches, team, registration, tournament] = await Promise.all([
    prisma.match.findMany({
      where: {
        tournamentId,
        OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
      },
      include: {
        homeTeam:    { select: { id: true, name: true } },
        awayTeam:    { select: { id: true, name: true } },
        group:       { select: { name: true } },
        goals: {
          include: { player: { select: { id: true, name: true, number: true } } },
          orderBy: { minute: "asc" },
        },
        assists: {
          include: { player: { select: { id: true, name: true, number: true } } },
          orderBy: { minute: "asc" },
        },
        cards: {
          include: { player: { select: { id: true, name: true, number: true } } },
          orderBy: { minute: "asc" },
        },
      },
      orderBy: { date: "asc" },
    }),
    prisma.team.findUnique({
      where: { id: teamId },
      include: {
        players: { orderBy: [{ number: "asc" }, { name: "asc" }] },
        captain: { select: { name: true } },
      },
    }),
    prisma.teamRegistration.findFirst({
      where: { teamId, tournamentId },
      include: { groupTeam: { include: { group: true } } },
    }),
    prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: { id: true, name: true, winPoints: true },
    }),
  ]);
  return { matches, team, registration, tournament };
}

// ─── Fikstür tarih/saat güncelle ──────────────────────────────
export async function rescheduleMatches(
  tournamentId: string,
  changes: { matchId: string; date: string | null; time: string | null }[]
) {
  const session = await getSession();
  if (!session) throw new Error("Yetkisiz.");
  if (changes.length === 0) return { ok: true };

  const matchIds = changes.map(c => c.matchId);
  const affectedMatches = await prisma.match.findMany({
    where: { id: { in: matchIds } },
    include: {
      homeTeam: { include: { captain: { select: { id: true, name: true, email: true } } } },
      awayTeam: { include: { captain: { select: { id: true, name: true, email: true } } } },
      tournament: { select: { id: true, name: true } },
    },
  });

  await Promise.all(
    changes.map(c =>
      prisma.match.update({
        where: { id: c.matchId },
        data: {
          date: c.date ? new Date(c.date + "T12:00:00") : null,
          time: c.time || null,
        },
      })
    )
  );

  const notifs: { userId: string; type: "ANNOUNCEMENT"; title: string; body: string; link: string }[] = [];
  const emailJobs: Promise<void>[] = [];

  for (const change of changes) {
    const match = affectedMatches.find(m => m.id === change.matchId);
    if (!match) continue;

    const dateStr = change.date
      ? new Date(change.date + "T12:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })
      : "—";
    const body = `${match.homeTeam.name} – ${match.awayTeam.name} maçı yeniden planlandı: ${dateStr}${change.time ? " " + change.time : ""}`;
    const link = `/captain/tournaments/${match.tournament.id}`;

    for (const captain of [match.homeTeam.captain, match.awayTeam.captain]) {
      notifs.push({ userId: captain.id, type: "ANNOUNCEMENT", title: "Maç Tarihi Değişti", body, link });
      if (captain.email) {
        emailJobs.push(
          sendRescheduleEmail({
            to: captain.email,
            captainName: captain.name,
            homeTeam: match.homeTeam.name,
            awayTeam: match.awayTeam.name,
            newDate: dateStr,
            newTime: change.time ?? "",
            tournamentName: match.tournament.name,
            tournamentId: match.tournament.id,
          }).catch(() => {})
        );
      }
    }
  }

  if (notifs.length > 0) await createNotifications(notifs);
  await Promise.allSettled(emailJobs);

  revalidatePath(`/organizer/tournaments/${tournamentId}/manage`);
  revalidatePath(`/captain/schedule`);

  return { ok: true };
}
