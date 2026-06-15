import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const FROM_RAW = process.env.SMTP_FROM || process.env.SMTP_USER || "";
const FROM = FROM_RAW.includes("<") ? FROM_RAW : `AsistGol <${FROM_RAW}>`;
const TO = process.argv[2] || "pusulaparada@gmail.com";

console.log("Auth user :", process.env.SMTP_USER);
console.log("From      :", FROM);
console.log("To        :", TO);

try {
  await transporter.verify();
  console.log("SMTP bağlantısı OK");
  const info = await transporter.sendMail({
    from: FROM,
    to: TO,
    subject: "AsistGol — Test Maili (noreply@asistgol.com)",
    text: "Bu bir test mailidir. Gönderen adresi noreply@asistgol.com olarak görünüyorsa kurulum başarılı.",
    html: "<p>Bu bir <b>test mailidir</b>. Gönderen adresi <b>noreply@asistgol.com</b> olarak görünüyorsa kurulum başarılı.</p>",
  });
  console.log("GÖNDERİLDİ ✓  messageId:", info.messageId);
  console.log("response:", info.response);
} catch (e) {
  console.error("HATA:", e.message);
  process.exit(1);
}
