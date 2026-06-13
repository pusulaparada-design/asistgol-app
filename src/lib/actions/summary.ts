"use server";
import { prisma } from "@/lib/prisma";
import { createNotification } from "./notification";
import {
  sendWeeklySummaryEmail,
  type WeeklyGroupStanding,
  type WeeklyMatchResult,
  type WeeklyScorer,
  type WeeklyCarder,
} from "@/lib/email";

export async function sendWeeklySummaryForRound(tournamentId: string, round: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      organizer: { select: { id: true, name: true, email: true } },
      groups: {
        include: {
          teams: { include: { team: { select: { id: true, name: true } } } },
        },
        orderBy: { name: "asc" },
      },
      matches: {
        include: {
          homeTeam: { select: { id: true, name: true } },
          awayTeam: { select: { id: true, name: true } },
          group: { select: { name: true } },
          goals: { include: { player: { select: { name: true, teamId: true } } } },
          cards: { include: { player: { select: { name: true, teamId: true } } } },
        },
      },
      registrations: {
        where: { status: "APPROVED" },
        include: {
          team: { include: { captain: { select: { id: true, name: true, email: true } } } },
        },
      },
    },
  });
  if (!tournament) return;

  // ── Bu haftanın maçları ─────────────────────────────────────
  const weekMatches: WeeklyMatchResult[] = tournament.matches
    .filter(m => m.round === round && m.homeScore !== null && m.awayScore !== null)
    .map(m => ({
      home: m.homeTeam.name,
      away: m.awayTeam.name,
      homeScore: m.homeScore!,
      awayScore: m.awayScore!,
      groupName: m.group?.name ?? "—",
    }));

  // ── Grup puan tabloları ─────────────────────────────────────
  const standings: WeeklyGroupStanding[] = tournament.groups.map(g => {
    const rowMap: Record<string, {
      teamName: string; played: number; wins: number; draws: number;
      losses: number; goalsFor: number; goalsAgainst: number; points: number;
    }> = {};
    for (const gt of g.teams) {
      rowMap[gt.team.id] = {
        teamName: gt.team.name, played: 0, wins: 0, draws: 0,
        losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0,
      };
    }
    for (const m of tournament.matches) {
      if (m.groupId !== g.id || m.homeScore === null || m.awayScore === null) continue;
      const home = rowMap[m.homeTeamId];
      const away = rowMap[m.awayTeamId];
      if (!home || !away) continue;
      home.played++; away.played++;
      home.goalsFor += m.homeScore; home.goalsAgainst += m.awayScore;
      away.goalsFor += m.awayScore; away.goalsAgainst += m.homeScore;
      if (m.homeScore > m.awayScore)       { home.wins++; home.points += 3; away.losses++; }
      else if (m.homeScore < m.awayScore)  { away.wins++; away.points += 3; home.losses++; }
      else                                 { home.draws++; home.points++; away.draws++; away.points++; }
    }
    const rows = Object.values(rowMap)
      .sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst))
      .map((r, i) => ({ ...r, rank: i + 1 }));
    return { groupName: g.name, rows };
  });

  // ── Oyuncu istatistikleri ───────────────────────────────────
  const scorerMap: Record<string, WeeklyScorer> = {};
  const carderMap: Record<string, WeeklyCarder> = {};
  for (const m of tournament.matches) {
    if (m.homeScore === null) continue;
    for (const g of m.goals) {
      if (!scorerMap[g.playerId]) {
        const teamName = g.player.teamId === m.homeTeamId ? m.homeTeam.name : m.awayTeam.name;
        scorerMap[g.playerId] = { name: g.player.name, teamName, goals: 0 };
      }
      scorerMap[g.playerId].goals++;
    }
    for (const c of m.cards) {
      if (!carderMap[c.playerId]) {
        const teamName = c.player.teamId === m.homeTeamId ? m.homeTeam.name : m.awayTeam.name;
        carderMap[c.playerId] = { name: c.player.name, teamName, yellow: 0, red: 0 };
      }
      if (c.type === "YELLOW") carderMap[c.playerId].yellow++;
      else carderMap[c.playerId].red++;
    }
  }
  const topScorers: WeeklyScorer[] = Object.values(scorerMap)
    .sort((a, b) => b.goals - a.goals).slice(0, 5);
  const topCards: WeeklyCarder[] = Object.values(carderMap)
    .sort((a, b) => (b.yellow + b.red * 2) - (a.yellow + a.red * 2)).slice(0, 5);

  // ── Alıcı listesi: organizatör + tüm onaylı kaptan ─────────
  const captains = tournament.registrations.map(r => r.team.captain);
  const uniqueCaptains = Object.values(
    Object.fromEntries(captains.map(c => [c.id, c]))
  );

  const notifTitle = `${round} Özeti — ${tournament.name}`;
  const notifBody  = `${weekMatches.length} maç tamamlandı. Puan tablosu ve istatistikler güncellendi.`;
  const notifLink  = `/captain/tournaments/${tournamentId}`;

  // ── Bildirimler ─────────────────────────────────────────────
  const notifRecipients = [
    { id: tournament.organizer.id, link: `/organizer/tournaments/${tournamentId}` },
    ...uniqueCaptains.map(c => ({ id: c.id, link: notifLink })),
  ];
  await Promise.all(
    notifRecipients.map(r =>
      createNotification({
        userId: r.id, type: "MATCH_RESULT",
        title: notifTitle, body: notifBody, link: r.link,
      }).catch(() => {})
    )
  );

  // ── E-postalar ──────────────────────────────────────────────
  const emailData = { tournamentName: tournament.name, tournamentId, round, weekMatches, standings, topScorers, topCards };

  const emailJobs: Promise<void>[] = [];

  if (tournament.organizer.email) {
    emailJobs.push(
      sendWeeklySummaryEmail({ to: tournament.organizer.email, recipientName: tournament.organizer.name, ...emailData })
        .catch(() => {})
    );
  }
  for (const captain of uniqueCaptains) {
    if (captain.email) {
      emailJobs.push(
        sendWeeklySummaryEmail({ to: captain.email, recipientName: captain.name, ...emailData })
          .catch(() => {})
      );
    }
  }
  await Promise.allSettled(emailJobs);
}
