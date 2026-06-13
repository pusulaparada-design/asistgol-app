import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = `AsistGol <${process.env.SMTP_FROM || process.env.SMTP_USER}>`;

export async function sendWelcomeEmail({
  to,
  name,
  role,
  username,
}: {
  to: string;
  name: string;
  role: "ORGANIZER" | "CAPTAIN";
  username: string;
}) {
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://asistgol-app.vercel.app"}/login`;

  const roleNote =
    role === "ORGANIZER"
      ? `<p style="color:#6B7280;font-size:14px;line-height:1.6;">Organizatör hesabınız oluşturuldu. Artık turnuva oluşturabilir, takım başvurularını yönetebilir ve fikstür hazırlayabilirsiniz.</p>`
      : `<p style="color:#6B7280;font-size:14px;line-height:1.6;">Takım kaptanı hesabınız oluşturuldu. Artık takım kurabilir, turnuvalara başvurabilir ve maç takviminizi takip edebilirsiniz.</p>`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4F6F9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F6F9;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Logo -->
        <tr><td align="center" style="padding-bottom:24px;">
          <span style="font-size:24px;font-weight:900;color:#0F1F47;">asist<span style="color:#F59E0B;">gol</span></span>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:#ffffff;border-radius:16px;border:1px solid #E5E7EB;overflow:hidden;">

          <!-- Header bar -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="background:#0F1F47;padding:28px 32px;">
              <p style="margin:0;color:#F59E0B;font-size:13px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;">Hoş Geldiniz</p>
              <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:700;">Hesabınız Oluşturuldu</h1>
            </td></tr>
          </table>

          <!-- Body -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:28px 32px;">
              <p style="margin:0 0 16px;color:#111827;font-size:16px;font-weight:600;">Merhaba ${name},</p>
              ${roleNote}
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background:#F9FAFB;border-radius:10px;border:1px solid #E5E7EB;">
                <tr><td style="padding:16px 20px;">
                  <p style="margin:0 0 6px;color:#9CA3AF;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Kullanıcı Adınız</p>
                  <p style="margin:0;color:#111827;font-size:15px;font-weight:700;">${username}</p>
                </td></tr>
              </table>
              <p style="margin:0 0 20px;color:#6B7280;font-size:14px;">Giriş yapmak için aşağıdaki butona tıklayın:</p>
              <table cellpadding="0" cellspacing="0">
                <tr><td style="border-radius:8px;background:#F59E0B;">
                  <a href="${loginUrl}" style="display:inline-block;padding:12px 28px;color:#0F1F47;font-size:14px;font-weight:700;text-decoration:none;">Giriş Yap →</a>
                </td></tr>
              </table>
            </td></tr>
          </table>

          <!-- Footer -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="border-top:1px solid #F3F4F6;padding:16px 32px;">
              <p style="margin:0;color:#9CA3AF;font-size:12px;">Bu e-postayı almak istemiyorsanız dikkate almayınız. © 2026 AsistGol</p>
            </td></tr>
          </table>

        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: FROM,
    to,
    subject: `AsistGol'e Hoş Geldiniz, ${name}!`,
    html,
  });
}

function baseLayout(headerColor: string, tag: string, title: string, body: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://asistgol-app.vercel.app";
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4F6F9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F6F9;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <tr><td align="center" style="padding-bottom:24px;">
          <span style="font-size:24px;font-weight:900;color:#0F1F47;">asist<span style="color:#F59E0B;">gol</span></span>
        </td></tr>
        <tr><td style="background:#ffffff;border-radius:16px;border:1px solid #E5E7EB;overflow:hidden;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="background:${headerColor};padding:28px 32px;">
              <p style="margin:0;color:rgba(255,255,255,0.7);font-size:13px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;">${tag}</p>
              <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:700;">${title}</h1>
            </td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:28px 32px;">${body}</td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="border-top:1px solid #F3F4F6;padding:16px 32px;">
              <p style="margin:0;color:#9CA3AF;font-size:12px;">© 2026 AsistGol · <a href="${appUrl}" style="color:#9CA3AF;">asistgol.com</a></p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function btn(url: string, label: string, color = "#F59E0B", textColor = "#0F1F47") {
  return `<table cellpadding="0" cellspacing="0" style="margin-top:20px;">
    <tr><td style="border-radius:8px;background:${color};">
      <a href="${url}" style="display:inline-block;padding:12px 28px;color:${textColor};font-size:14px;font-weight:700;text-decoration:none;">${label} →</a>
    </td></tr>
  </table>`;
}

export async function sendRegistrationApprovedEmail({
  to, captainName, teamName, tournamentName, tournamentId,
}: { to: string; captainName: string; teamName: string; tournamentName: string; tournamentId: string }) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL || "https://asistgol-app.vercel.app"}/captain/tournaments/${tournamentId}`;
  const body = `
    <p style="margin:0 0 16px;color:#111827;font-size:16px;font-weight:600;">Merhaba ${captainName},</p>
    <p style="margin:0 0 16px;color:#6B7280;font-size:14px;line-height:1.6;"><strong>${teamName}</strong> takımınızın <strong>${tournamentName}</strong> turnuvasına başvurusu <span style="color:#059669;font-weight:700;">onaylandı!</span></p>
    <p style="margin:0 0 4px;color:#6B7280;font-size:14px;">Fikstür ve grup bilgilerini takip etmek için turnuva sayfasını ziyaret edin.</p>
    ${btn(url, "Turnuvaya Git", "#059669", "#ffffff")}`;
  await transporter.sendMail({
    from: FROM, to,
    subject: `✅ Başvurunuz Onaylandı — ${tournamentName}`,
    html: baseLayout("#059669", "Başvuru Onaylandı", `${teamName} turnuvada!`, body),
  });
}

export async function sendRegistrationRejectedEmail({
  to, captainName, teamName, tournamentName,
}: { to: string; captainName: string; teamName: string; tournamentName: string }) {
  const body = `
    <p style="margin:0 0 16px;color:#111827;font-size:16px;font-weight:600;">Merhaba ${captainName},</p>
    <p style="margin:0 0 16px;color:#6B7280;font-size:14px;line-height:1.6;"><strong>${teamName}</strong> takımınızın <strong>${tournamentName}</strong> turnuvasına başvurusu <span style="color:#DC2626;font-weight:700;">reddedildi.</span></p>
    <p style="margin:0;color:#6B7280;font-size:14px;">Daha fazla bilgi için turnuva organizatörüyle iletişime geçebilirsiniz.</p>`;
  await transporter.sendMail({
    from: FROM, to,
    subject: `❌ Başvurunuz Reddedildi — ${tournamentName}`,
    html: baseLayout("#DC2626", "Başvuru Reddedildi", `${teamName} başvurusu`, body),
  });
}

export async function sendNewRegistrationEmail({
  to, organizerName, teamName, captainName, tournamentName, tournamentId,
}: { to: string; organizerName: string; teamName: string; captainName: string; tournamentName: string; tournamentId: string }) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL || "https://asistgol-app.vercel.app"}/organizer/tournaments/${tournamentId}/manage`;
  const body = `
    <p style="margin:0 0 16px;color:#111827;font-size:16px;font-weight:600;">Merhaba ${organizerName},</p>
    <p style="margin:0 0 16px;color:#6B7280;font-size:14px;line-height:1.6;"><strong>${teamName}</strong> (Kaptan: ${captainName}) takımı <strong>${tournamentName}</strong> turnuvasına başvurdu.</p>
    <p style="margin:0 0 4px;color:#6B7280;font-size:14px;">Başvuruyu onaylamak veya reddetmek için yönetim paneline gidin.</p>
    ${btn(url, "Başvuruları Yönet")}`;
  await transporter.sendMail({
    from: FROM, to,
    subject: `📋 Yeni Başvuru — ${tournamentName}`,
    html: baseLayout("#0F1F47", "Yeni Başvuru", `${teamName} başvurdu`, body),
  });
}

export async function sendMatchResultEmail({
  to, captainName, homeTeam, awayTeam, homeScore, awayScore, tournamentName, tournamentId,
}: { to: string; captainName: string; homeTeam: string; awayTeam: string; homeScore: number; awayScore: number; tournamentName: string; tournamentId: string }) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL || "https://asistgol-app.vercel.app"}/captain/tournaments/${tournamentId}`;
  const body = `
    <p style="margin:0 0 16px;color:#111827;font-size:16px;font-weight:600;">Merhaba ${captainName},</p>
    <p style="margin:0 0 16px;color:#6B7280;font-size:14px;"><strong>${tournamentName}</strong> turnuvasında bir maç sona erdi.</p>
    <table cellpadding="0" cellspacing="0" style="margin:16px 0;width:100%;">
      <tr>
        <td style="text-align:right;font-size:15px;font-weight:700;color:#111827;">${homeTeam}</td>
        <td style="text-align:center;padding:0 16px;font-size:24px;font-weight:900;color:#0F1F47;font-family:monospace;">${homeScore} – ${awayScore}</td>
        <td style="font-size:15px;font-weight:700;color:#111827;">${awayTeam}</td>
      </tr>
    </table>
    ${btn(url, "Turnuva Detayı", "#F59E0B", "#0F1F47")}`;
  await transporter.sendMail({
    from: FROM, to,
    subject: `⚽ Maç Sonucu: ${homeTeam} ${homeScore}–${awayScore} ${awayTeam}`,
    html: baseLayout("#0F1F47", "Maç Sonucu", `${homeTeam} vs ${awayTeam}`, body),
  });
}

export async function sendAnnouncementEmail({
  to, captainName, announcementTitle, announcementBody, tournamentName, tournamentId,
}: { to: string; captainName: string; announcementTitle: string; announcementBody: string; tournamentName: string; tournamentId?: string }) {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://asistgol-app.vercel.app";
  const url = tournamentId ? `${base}/captain/tournaments/${tournamentId}` : `${base}/captain/tournaments`;
  const body = `
    <p style="margin:0 0 16px;color:#111827;font-size:16px;font-weight:600;">Merhaba ${captainName},</p>
    <p style="margin:0 0 8px;color:#6B7280;font-size:14px;"><strong>${tournamentName}</strong> organizatöründen yeni bir duyuru:</p>
    <div style="margin:16px 0;padding:16px 20px;background:#F9FAFB;border-left:3px solid #F59E0B;border-radius:4px;">
      <p style="margin:0 0 6px;font-size:15px;font-weight:700;color:#111827;">${announcementTitle}</p>
      <p style="margin:0;font-size:14px;color:#6B7280;line-height:1.6;">${announcementBody}</p>
    </div>
    ${btn(url, "Turnuva Sayfası")}`;
  await transporter.sendMail({
    from: FROM, to,
    subject: `📢 Duyuru: ${announcementTitle} — ${tournamentName}`,
    html: baseLayout("#0F1F47", "Turnuva Duyurusu", announcementTitle, body),
  });
}

export interface WeeklyStandingRow {
  rank: number; teamName: string;
  played: number; wins: number; draws: number; losses: number;
  goalsFor: number; goalsAgainst: number; points: number;
}
export interface WeeklyGroupStanding { groupName: string; rows: WeeklyStandingRow[] }
export interface WeeklyMatchResult { home: string; away: string; homeScore: number; awayScore: number; groupName: string }
export interface WeeklyScorer { name: string; teamName: string; goals: number }
export interface WeeklyCarder { name: string; teamName: string; yellow: number; red: number }

export async function sendWeeklySummaryEmail({
  to, recipientName, tournamentName, tournamentId, round,
  weekMatches, standings, topScorers, topCards,
}: {
  to: string; recipientName: string; tournamentName: string; tournamentId: string; round: string;
  weekMatches: WeeklyMatchResult[]; standings: WeeklyGroupStanding[];
  topScorers: WeeklyScorer[]; topCards: WeeklyCarder[];
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://asistgol-app.vercel.app";
  const url = `${appUrl}/captain/tournaments/${tournamentId}`;

  const standingRows = (rows: WeeklyStandingRow[]) => rows.map((r, i) => `
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
        <thead>
          <tr style="background:#F8FAFC;">
            <th style="padding:7px 10px;font-size:10px;font-weight:700;color:#9CA3AF;text-transform:uppercase;text-align:left;">#</th>
            <th style="padding:7px 10px;font-size:10px;font-weight:700;color:#9CA3AF;text-transform:uppercase;text-align:left;">Takım</th>
            <th style="padding:7px 10px;font-size:10px;font-weight:700;color:#9CA3AF;text-transform:uppercase;text-align:center;">O</th>
            <th style="padding:7px 10px;font-size:10px;font-weight:700;color:#9CA3AF;text-transform:uppercase;text-align:center;">G</th>
            <th style="padding:7px 10px;font-size:10px;font-weight:700;color:#9CA3AF;text-transform:uppercase;text-align:center;">B</th>
            <th style="padding:7px 10px;font-size:10px;font-weight:700;color:#9CA3AF;text-transform:uppercase;text-align:center;">M</th>
            <th style="padding:7px 10px;font-size:10px;font-weight:700;color:#9CA3AF;text-transform:uppercase;text-align:center;">AG/YG</th>
            <th style="padding:7px 10px;font-size:10px;font-weight:700;color:#0F1F47;text-transform:uppercase;text-align:center;">P</th>
          </tr>
        </thead>
        <tbody>${standingRows(g.rows)}</tbody>
      </table>
    </div>`).join("");

  const matchCards = weekMatches.map(m => `
    <tr>
      <td style="padding:8px 6px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;">
          <tr>
            <td style="padding:10px 14px;font-size:12px;color:#3B82F6;font-weight:600;">${m.groupName}</td>
          </tr>
          <tr>
            <td style="padding:4px 14px 12px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align:right;font-size:14px;font-weight:700;color:#111827;width:40%;">${m.home}</td>
                  <td style="text-align:center;width:20%;padding:0 8px;">
                    <span style="font-size:18px;font-weight:900;color:#0F1F47;font-family:monospace;">${m.homeScore}–${m.awayScore}</span>
                  </td>
                  <td style="text-align:left;font-size:14px;font-weight:700;color:#111827;width:40%;">${m.away}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>`).join("");

  const scorerRows = topScorers.slice(0, 5).map((s, i) => `
    <tr style="background:${i % 2 === 0 ? "#ffffff" : "#F9FAFB"};">
      <td style="padding:7px 10px;font-size:12px;color:#9CA3AF;font-weight:700;">${i + 1}</td>
      <td style="padding:7px 10px;font-size:13px;font-weight:600;color:#111827;">${s.name}</td>
      <td style="padding:7px 10px;font-size:11px;color:#6B7280;">${s.teamName}</td>
      <td style="padding:7px 10px;font-size:13px;font-weight:800;color:#059669;text-align:center;">${s.goals} ⚽</td>
    </tr>`).join("");

  const cardRows = topCards.slice(0, 5).map((c, i) => `
    <tr style="background:${i % 2 === 0 ? "#ffffff" : "#F9FAFB"};">
      <td style="padding:7px 10px;font-size:12px;color:#9CA3AF;font-weight:700;">${i + 1}</td>
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

      <!-- LOGO -->
      <tr><td align="center" style="padding-bottom:20px;">
        <span style="font-size:26px;font-weight:900;color:#0F1F47;letter-spacing:-0.5px;">asist<span style="color:#F59E0B;">gol</span></span>
        <span style="font-size:11px;color:#9CA3AF;margin-left:8px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;">Turnuva Platformu</span>
      </td></tr>

      <!-- HERO HEADER -->
      <tr><td style="background:linear-gradient(135deg,#0F1F47 0%,#1E3A8A 100%);border-radius:16px 16px 0 0;padding:32px 32px 24px;text-align:center;">
        <div style="display:inline-block;background:rgba(245,158,11,0.15);border:1px solid rgba(245,158,11,0.4);border-radius:20px;padding:4px 16px;margin-bottom:12px;">
          <span style="color:#F59E0B;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">📊 Haftalık Özet</span>
        </div>
        <h1 style="margin:0 0 6px;color:#ffffff;font-size:24px;font-weight:800;">${round} Tamamlandı</h1>
        <p style="margin:0;color:rgba(255,255,255,0.6);font-size:14px;">${tournamentName}</p>
      </td></tr>

      <!-- BODY CARD -->
      <tr><td style="background:#ffffff;border:1px solid #E5E7EB;border-top:none;border-radius:0 0 16px 16px;padding:28px 32px;">

        <p style="margin:0 0 24px;color:#374151;font-size:14px;">Merhaba <strong>${recipientName}</strong>, ${round} maçları sona erdi. İşte güncel durum:</p>

        <!-- STANDINGS -->
        <div style="margin-bottom:28px;">
          <h2 style="margin:0 0 14px;font-size:15px;font-weight:800;color:#0F1F47;padding-bottom:8px;border-bottom:2px solid #F59E0B;display:inline-block;">Puan Tablosu</h2>
          ${standingTables}
        </div>

        <!-- WEEK MATCHES -->
        <div style="margin-bottom:28px;">
          <h2 style="margin:0 0 14px;font-size:15px;font-weight:800;color:#0F1F47;padding-bottom:8px;border-bottom:2px solid #F59E0B;display:inline-block;">${round} Maç Sonuçları</h2>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${weekMatches.length > 0 ? matchCards : '<tr><td style="color:#9CA3AF;font-size:13px;padding:8px;">Bu hafta oynanan maç yok.</td></tr>'}
          </table>
        </div>

        <!-- STATS ROW -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr>
            <!-- TOP SCORERS -->
            <td width="48%" valign="top" style="padding-right:8px;">
              <h2 style="margin:0 0 10px;font-size:14px;font-weight:800;color:#0F1F47;">⚽ Gol Krallığı</h2>
              ${topScorers.length > 0 ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;">
                <thead><tr style="background:#F8FAFC;">
                  <th style="padding:6px 10px;font-size:10px;color:#9CA3AF;text-align:left;font-weight:700;">#</th>
                  <th style="padding:6px 10px;font-size:10px;color:#9CA3AF;text-align:left;font-weight:700;">Oyuncu</th>
                  <th style="padding:6px 10px;font-size:10px;color:#9CA3AF;text-align:left;font-weight:700;">Takım</th>
                  <th style="padding:6px 10px;font-size:10px;color:#9CA3AF;text-align:center;font-weight:700;">Gol</th>
                </tr></thead>
                <tbody>${scorerRows}</tbody>
              </table>` : '<p style="color:#9CA3AF;font-size:13px;">Henüz gol kaydı yok.</p>'}
            </td>
            <td width="4%"></td>
            <!-- TOP CARDS -->
            <td width="48%" valign="top" style="padding-left:8px;">
              <h2 style="margin:0 0 10px;font-size:14px;font-weight:800;color:#0F1F47;">🟨 Kart İstatistikleri</h2>
              ${topCards.length > 0 ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;">
                <thead><tr style="background:#F8FAFC;">
                  <th style="padding:6px 10px;font-size:10px;color:#9CA3AF;text-align:left;font-weight:700;">#</th>
                  <th style="padding:6px 10px;font-size:10px;color:#9CA3AF;text-align:left;font-weight:700;">Oyuncu</th>
                  <th style="padding:6px 10px;font-size:10px;color:#9CA3AF;text-align:left;font-weight:700;">Takım</th>
                  <th style="padding:6px 10px;font-size:10px;color:#9CA3AF;text-align:center;font-weight:700;">Kartlar</th>
                </tr></thead>
                <tbody>${cardRows}</tbody>
              </table>` : '<p style="color:#9CA3AF;font-size:13px;">Henüz kart kaydı yok.</p>'}
            </td>
          </tr>
        </table>

        <!-- CTA -->
        <table cellpadding="0" cellspacing="0" style="width:100%;margin-top:8px;">
          <tr><td align="center">
            <a href="${url}" style="display:inline-block;padding:13px 36px;background:#F59E0B;color:#0F1F47;font-size:14px;font-weight:800;text-decoration:none;border-radius:10px;">Turnuva Sayfasına Git →</a>
          </td></tr>
        </table>

      </td></tr>

      <!-- FOOTER -->
      <tr><td style="padding:20px 0 0;text-align:center;">
        <p style="margin:0;color:#9CA3AF;font-size:12px;">
          <span style="font-weight:700;color:#0F1F47;">asist<span style="color:#F59E0B;">gol</span></span> · Turnuva Platformu · © 2026
        </p>
        <p style="margin:4px 0 0;color:#D1D5DB;font-size:11px;">Bu e-postayı almak istemiyorsanız ayarlardan haftalık özet bildirimlerini kapatabilirsiniz.</p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>`;

  await transporter.sendMail({
    from: FROM, to,
    subject: `📊 ${round} Özeti — ${tournamentName}`,
    html,
  });
}
