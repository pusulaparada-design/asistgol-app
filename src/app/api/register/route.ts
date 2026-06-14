import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import { randomBytes } from "crypto";

function slugify(str: string) {
  return str
    .toLocaleLowerCase("tr")
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]/g, "");
}

async function uniqueUsername(base: string): Promise<string> {
  const exists = await prisma.user.findUnique({ where: { username: base } });
  if (!exists) return base;
  let i = 2;
  while (true) {
    const candidate = `${base}${i}`;
    const taken = await prisma.user.findUnique({ where: { username: candidate } });
    if (!taken) return candidate;
    i++;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, password, phone, city, role } = body;

    if (!firstName || !lastName || !email || !password || !role) {
      return NextResponse.json({ error: "Tüm zorunlu alanları doldurun." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Şifre en az 6 karakter olmalıdır." }, { status: 400 });
    }

    const emailExists = await prisma.user.findUnique({ where: { email } });
    if (emailExists) {
      return NextResponse.json({ error: "Bu e-posta adresi zaten kayıtlı." }, { status: 409 });
    }

    const name = `${firstName.trim()} ${lastName.trim()}`;
    const usernameBase = slugify(`${firstName}${lastName}`);
    const username = await uniqueUsername(usernameBase || email.split("@")[0]);

    const hashed = await hashPassword(password);
    const prismaRole = role === "organizer" ? "ORGANIZER" : "CAPTAIN";
    const verifyToken = randomBytes(32).toString("hex");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.asistgol.com";

    await prisma.user.create({
      data: {
        username,
        password: hashed,
        role: prismaRole,
        name,
        email,
        phone: phone || null,
        city: city || null,
        emailVerified: false,
        emailVerifyToken: verifyToken,
      },
    });

    try {
      await sendVerificationEmail({
        to: email,
        name,
        verifyUrl: `${appUrl}/api/verify-email?token=${verifyToken}`,
      });
    } catch (mailErr) {
      console.error("Doğrulama maili gönderilemedi:", mailErr);
    }

    return NextResponse.json({ ok: true, username });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
