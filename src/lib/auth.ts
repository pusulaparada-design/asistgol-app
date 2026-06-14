import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "asistgol-secret-key-change-in-production"
);

const COOKIE = "ag_session";

export type SessionPayload = {
  userId: string;
  username: string;
  role: Role;
  name: string;
};

// ─── Token işlemleri ───────────────────────────────────────────
export async function createToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// ─── Session okuma ─────────────────────────────────────────────
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

// ─── Login ─────────────────────────────────────────────────────
export async function login(
  email: string,
  password: string
): Promise<{ ok: true; payload: SessionPayload } | { ok: false; error: string }> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { ok: false, error: "E-posta veya şifre hatalı." };

  const match = await bcrypt.compare(password, user.password);
  if (!match) return { ok: false, error: "E-posta veya şifre hatalı." };

  if (!user.emailVerified) {
    return { ok: false, error: "E-posta adresiniz henüz doğrulanmadı. Lütfen e-postanıza gelen doğrulama bağlantısına tıklayın." };
  }

  const payload: SessionPayload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    name: user.name,
  };
  return { ok: true, payload };
}

// ─── Şifre hash ────────────────────────────────────────────────
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

// ─── Role → redirect ───────────────────────────────────────────
export function roleRedirect(role: Role): string {
  if (role === "ADMIN") return "/admin";
  if (role === "ORGANIZER") return "/organizer";
  return "/captain";
}

// ─── Sayfa/Layout yetki kontrolü ───────────────────────────────
// Oturum yoksa /login'e, rol uyuşmuyorsa kullanıcının kendi paneline yönlendirir.
export async function requireRole(role: Role): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== role) redirect(roleRedirect(session.role));
  return session;
}

export const COOKIE_NAME = COOKIE;
