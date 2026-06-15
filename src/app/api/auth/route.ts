import { NextResponse } from "next/server";
import { login, createToken, roleRedirect, COOKIE_NAME, getSession } from "@/lib/auth";
import { createLog } from "@/lib/logger";

function getIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim()
    ?? req.headers.get("x-real-ip")
    ?? "unknown";
}

export async function POST(req: Request) {
  const ip = getIp(req);
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "E-posta ve şifre gereklidir." }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const result = await login(trimmedEmail, password);

    if (!result.ok) {
      await createLog({
        level: "WARN",
        category: "AUTH",
        message: `Başarısız giriş denemesi: ${trimmedEmail}`,
        userEmail: trimmedEmail,
        ip,
        details: { reason: result.error },
      });
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    await createLog({
      level: "INFO",
      category: "AUTH",
      message: `Giriş yapıldı: ${result.payload.name}`,
      userId: result.payload.userId,
      userEmail: trimmedEmail,
      userName: result.payload.name,
      userRole: result.payload.role,
      ip,
    });

    const token = await createToken(result.payload);
    const redirect = roleRedirect(result.payload.role);

    const response = NextResponse.json({ ok: true, redirect });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  } catch (err) {
    console.error(err);
    await createLog({ level: "ERROR", category: "ERROR", message: `Auth hatası: ${String(err)}`, ip });
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const ip = getIp(req);
  const session = await getSession();
  if (session) {
    await createLog({
      level: "INFO",
      category: "AUTH",
      message: `Çıkış yapıldı: ${session.name}`,
      userId: session.userId,
      userName: session.name,
      userRole: session.role,
      ip,
    });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
