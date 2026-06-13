import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();
const TOURNAMENT_ID = "cmqcbbhqf0003nfkcddpsjjog";
const TO_EMAIL = "edipyildiz@gmaill.com";
const TO_NAME = "Hakan Temiz";
const TEST_ROUND = "Hafta 1";

const tournament = await prisma.tournament.findUnique({
  where: { id: TOURNAMENT_ID },
  include: {
    groups: {
      include: { teams: { include: { team: { select: { id: true, name: true } } } } },
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
  },
});

if (!tournament) { console.error("Turnuva bulunamadı!"); process.exit(1); }

// Week matches (use round 1 or first available)
const round = TEST_ROUND;
const weekMatches = tournament.matches
  .filter(m => m.round === round && m.homeScore !== null)
  .map(m => ({
    home: m.homeTeam.name, away: m.awayTeam.name,
    homeScore: m.homeScore, awayScore: m.awayScore,
    groupName: m.group?.name ?? "—",
  }));

console.log(`${round} maç sayısı: ${weekMatches.length}`);

// Standings
const standings = tournament.groups.map(g => {
  const rowMap = {};
  for (const gt of g.teams) {
    rowMap[gt.team.id] = { teamName: gt.team.name, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
  }
  for (const m of tournament.matches) {
    if (m.groupId !== g.id || m.homeScore === null) continue;
    const home = rowMap[m.homeTeamId]; const away = rowMap[m.awayTeamId];
    if (!home || !away) continue;
    home.played++; away.played++;
    home.goalsFor += m.homeScore; home.goalsAgainst += m.awayScore;
    away.goalsFor += m.awayScore; away.goalsAgainst += m.homeScore;
    if (m.homeScore > m.awayScore)       { home.wins++; home.points += 3; away.losses++; }
    else if (m.homeScore < m.awayScore)  { away.wins++; away.points += 3; home.losses++; }
    else { home.draws++; home.points++; away.draws++; away.points++; }
  }
  const rows = Object.values(rowMap)
    .sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst))
    .map((r, i) => ({ ...r, rank: i + 1 }));
  return { groupName: g.name, rows };
});

// Scorers & Cards
const scorerMap = {}; const carderMap = {};
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
const topScorers = Object.values(scorerMap).sort((a, b) => b.goals - a.goals).slice(0, 5);
const topCards   = Object.values(carderMap).sort((a, b) => (b.yellow + b.red*2) - (a.yellow + a.red*2)).slice(0, 5);

// Build HTML (same as email.ts template)
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const url = `${appUrl}/captain/tournaments/${TOURNAMENT_ID}`;
const tournamentName = tournament.name;

const standingRows = (rows) => rows.map((r, i) => `
  <tr style="background:${i % 2 === 0 ? "#ffffff" : "#F9FAFB"};">
    <td style="padding:8px 10px;font-size:12px;color:${r.rank <= 4 ? "#059669" : "#9CA3AF"};font-weight:700;">${r.rank}</td>
    <td style="padding:8px 10px;font-size:13px;font-weight:600;color:#111827;">${r.teamName}</td>
    <td style="padding:8px 10px;font-size:12px;color:#6B7280;text-align:center;">${r.played}</td>
    <td style="padding:8px 10px;font-size:12px;color:#6B7280;text-align:center;">${r.wins}</td>
    <td style="padding:8px 10px;font-size:12px;color:#6B7280;text-align:center;">${r.draws}</td>
    <td style="padding:8px 10px;font-size:12px;color:#6B7280;text-align:center;">${r.losses}</td>
    <td style="padding:8px 10px;font-size:12px;color:#6B7280;text-align:center;">${r.goalsFor}:${r.goalsAgainst}</td>
    <td style="padding:8px 10px;font-size:13px;font-weight:800;color:#0F1F47;text-align:center;">${r.points}</td>
  </tr>`).join("");

const standingTables = standings.map(g => `
  <div style="margin-bottom:20px;">
    <div style="background:#0F1F47;padding:10px 14px;border-radius:8px 8px 0 0;">
      <span style="color:#F59E0B;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">${g.groupName}</span>
      <span style="color:rgba(255,255,255,0.5);font-size:11px;"> — Puan Tablosu</span>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E5E7EB;border-top:none;border-radius:0 0 8px 8px;overflow:hidden;">
      <thead><tr style="background:#F8FAFC;">
        <th style="padding:7px 10px;font-size:10px;font-weight:700;color:#9CA3AF;text-transform:uppercase;text-align:left;">#</th>
        <th style="padding:7px 10px;font-size:10px;font-weight:700;color:#9CA3AF;text-transform:uppercase;text-align:left;">Takım</th>
        <th style="padding:7px 10px;font-size:10px;font-weight:700;color:#9CA3AF;text-transform:uppercase;text-align:center;">O</th>
        <th style="padding:7px 10px;font-size:10px;font-weight:700;color:#9CA3AF;text-transform:uppercase;text-align:center;">G</th>
        <th style="padding:7px 10px;font-size:10px;font-weight:700;color:#9CA3AF;text-transform:uppercase;text-align:center;">B</th>
        <th style="padding:7px 10px;font-size:10px;font-weight:700;color:#9CA3AF;text-transform:uppercase;text-align:center;">M</th>
        <th style="padding:7px 10px;font-size:10px;font-weight:700;color:#9CA3AF;text-transform:uppercase;text-align:center;">AG/YG</th>
        <th style="padding:7px 10px;font-size:10px;font-weight:700;color:#0F1F47;text-transform:uppercase;text-align:center;">P</th>
      </tr></thead>
      <tbody>${standingRows(g.rows)}</tbody>
    </table>
  </div>`).join("");

const matchCards = weekMatches.map(m => `
  <tr><td style="padding:8px 6px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;">
      <tr><td style="padding:10px 14px;font-size:12px;color:#3B82F6;font-weight:600;">${m.groupName}</td></tr>
      <tr><td style="padding:4px 14px 12px;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="text-align:right;font-size:14px;font-weight:700;color:#111827;width:40%;">${m.home}</td>
          <td style="text-align:center;width:20%;padding:0 8px;"><span style="font-size:18px;font-weight:900;color:#0F1F47;font-family:monospace;">${m.homeScore}–${m.awayScore}</span></td>
          <td style="text-align:left;font-size:14px;font-weight:700;color:#111827;width:40%;">${m.away}</td>
        </tr></table>
      </td></tr>
    </table>
  </td></tr>`).join("");

const noMatchMsg = weekMatches.length === 0
  ? `<tr><td style="color:#9CA3AF;font-size:13px;padding:16px 6px;text-align:center;border:1px dashed #E5E7EB;border-radius:8px;">Bu hafta için henüz maç sonucu girilmemiş — bu bir önizleme e-postasıdır.</td></tr>`
  : matchCards;

const scorerRows = topScorers.slice(0,5).map((s,i) => `
  <tr style="background:${i%2===0?"#ffffff":"#F9FAFB"};">
    <td style="padding:7px 10px;font-size:12px;color:#9CA3AF;font-weight:700;">${i+1}</td>
    <td style="padding:7px 10px;font-size:13px;font-weight:600;color:#111827;">${s.name}</td>
    <td style="padding:7px 10px;font-size:11px;color:#6B7280;">${s.teamName}</td>
    <td style="padding:7px 10px;font-size:13px;font-weight:800;color:#059669;text-align:center;">${s.goals} ⚽</td>
  </tr>`).join("");

const cardRows = topCards.slice(0,5).map((c,i) => `
  <tr style="background:${i%2===0?"#ffffff":"#F9FAFB"};">
    <td style="padding:7px 10px;font-size:12px;color:#9CA3AF;font-weight:700;">${i+1}</td>
    <td style="padding:7px 10px;font-size:13px;font-weight:600;color:#111827;">${c.name}</td>
    <td style="padding:7px 10px;font-size:11px;color:#6B7280;">${c.teamName}</td>
    <td style="padding:7px 10px;text-align:center;white-space:nowrap;">
      ${c.yellow > 0 ? `<span style="display:inline-block;background:#F59E0B;width:10px;height:13px;border-radius:2px;margin-right:4px;vertical-align:middle;"></span><span style="font-size:12px;font-weight:700;color:#D97706;">${c.yellow}</span>` : ""}
      ${c.red > 0 ? `<span style="display:inline-block;background:#EF4444;width:10px;height:13px;border-radius:2px;margin:0 4px 0 8px;vertical-align:middle;"></span><span style="font-size:12px;font-weight:700;color:#DC2626;">${c.red}</span>` : ""}
    </td>
  </tr>`).join("");

const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4F6F9;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F6F9;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr><td align="center" style="padding-bottom:20px;">
        <span style="font-size:26px;font-weight:900;color:#0F1F47;letter-spacing:-0.5px;">asist<span style="color:#F59E0B;">gol</span></span>
        <span style="font-size:11px;color:#9CA3AF;margin-left:8px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;">Turnuva Platformu</span>
      </td></tr>
      <tr><td style="background:linear-gradient(135deg,#0F1F47 0%,#1E3A8A 100%);border-radius:16px 16px 0 0;padding:32px 32px 24px;text-align:center;">
        <div style="display:inline-block;background:rgba(245,158,11,0.15);border:1px solid rgba(245,158,11,0.4);border-radius:20px;padding:4px 16px;margin-bottom:12px;">
          <span style="color:#F59E0B;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">📊 Haftalık Özet</span>
        </div>
        <h1 style="margin:0 0 6px;color:#ffffff;font-size:24px;font-weight:800;">${round} Tamamlandı</h1>
        <p style="margin:0;color:rgba(255,255,255,0.6);font-size:14px;">${tournamentName}</p>
      </td></tr>
      <tr><td style="background:#ffffff;border:1px solid #E5E7EB;border-top:none;border-radius:0 0 16px 16px;padding:28px 32px;">
        <p style="margin:0 0 24px;color:#374151;font-size:14px;">Merhaba <strong>${TO_NAME}</strong>, ${round} maçları sona erdi. İşte güncel durum:</p>
        <div style="margin-bottom:28px;">
          <h2 style="margin:0 0 14px;font-size:15px;font-weight:800;color:#0F1F47;padding-bottom:8px;border-bottom:2px solid #F59E0B;display:inline-block;">Puan Tablosu</h2>
          ${standingTables}
        </div>
        <div style="margin-bottom:28px;">
          <h2 style="margin:0 0 14px;font-size:15px;font-weight:800;color:#0F1F47;padding-bottom:8px;border-bottom:2px solid #F59E0B;display:inline-block;">${round} Maç Sonuçları</h2>
          <table width="100%" cellpadding="0" cellspacing="0">${noMatchMsg}</table>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr>
            <td width="48%" valign="top" style="padding-right:8px;">
              <h2 style="margin:0 0 10px;font-size:14px;font-weight:800;color:#0F1F47;">⚽ Gol Krallığı</h2>
              ${topScorers.length > 0 ? `<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;">
                <thead><tr style="background:#F8FAFC;">
                  <th style="padding:6px 10px;font-size:10px;color:#9CA3AF;text-align:left;font-weight:700;">#</th>
                  <th style="padding:6px 10px;font-size:10px;color:#9CA3AF;text-align:left;font-weight:700;">Oyuncu</th>
                  <th style="padding:6px 10px;font-size:10px;color:#9CA3AF;text-align:left;font-weight:700;">Takım</th>
                  <th style="padding:6px 10px;font-size:10px;color:#9CA3AF;text-align:center;font-weight:700;">Gol</th>
                </tr></thead><tbody>${scorerRows}</tbody>
              </table>` : '<p style="color:#9CA3AF;font-size:13px;font-style:italic;">Henüz gol kaydı yok.</p>'}
            </td>
            <td width="4%"></td>
            <td width="48%" valign="top" style="padding-left:8px;">
              <h2 style="margin:0 0 10px;font-size:14px;font-weight:800;color:#0F1F47;">🟨 Kart İstatistikleri</h2>
              ${topCards.length > 0 ? `<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;">
                <thead><tr style="background:#F8FAFC;">
                  <th style="padding:6px 10px;font-size:10px;color:#9CA3AF;text-align:left;font-weight:700;">#</th>
                  <th style="padding:6px 10px;font-size:10px;color:#9CA3AF;text-align:left;font-weight:700;">Oyuncu</th>
                  <th style="padding:6px 10px;font-size:10px;color:#9CA3AF;text-align:left;font-weight:700;">Takım</th>
                  <th style="padding:6px 10px;font-size:10px;color:#9CA3AF;text-align:center;font-weight:700;">Kart</th>
                </tr></thead><tbody>${cardRows}</tbody>
              </table>` : '<p style="color:#9CA3AF;font-size:13px;font-style:italic;">Henüz kart kaydı yok.</p>'}
            </td>
          </tr>
        </table>
        <table cellpadding="0" cellspacing="0" style="width:100%;margin-top:8px;">
          <tr><td align="center">
            <a href="${url}" style="display:inline-block;padding:13px 36px;background:#F59E0B;color:#0F1F47;font-size:14px;font-weight:800;text-decoration:none;border-radius:10px;">Turnuva Sayfasına Git →</a>
          </td></tr>
        </table>
      </td></tr>
      <tr><td style="padding:20px 0 0;text-align:center;">
        <p style="margin:0;color:#9CA3AF;font-size:12px;"><span style="font-weight:700;color:#0F1F47;">asist<span style="color:#F59E0B;">gol</span></span> · Turnuva Platformu · © 2026</p>
        <p style="margin:4px 0 0;color:#D1D5DB;font-size:11px;">Bu e-postayı almak istemiyorsanız ayarlardan haftalık özet bildirimlerini kapatabilirsiniz.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

// Send email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const FROM = `AsistGol <${process.env.SMTP_FROM || process.env.SMTP_USER}>`;

console.log(`Sending to: ${TO_EMAIL}...`);
await transporter.sendMail({
  from: FROM, to: TO_EMAIL,
  subject: `📊 ${round} Özeti — ${tournamentName} [TEST]`,
  html,
});
console.log("✅ Email sent!");
await prisma.$disconnect();
