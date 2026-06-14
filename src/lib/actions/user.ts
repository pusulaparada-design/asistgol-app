"use server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword, createToken, COOKIE_NAME } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function updateProfile(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Oturum bulunamadı." };

  const name = `${data.firstName.trim()} ${data.lastName.trim()}`.trim();
  const email = data.email.trim().toLowerCase() || null;

  if (!name) return { ok: false, error: "Ad ve soyad zorunludur." };

  // email uniqueness check (skip if unchanged)
  if (email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== session.userId) {
      return { ok: false, error: "Bu e-posta adresi zaten kullanımda." };
    }
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      name,
      email: email || undefined,
      phone: data.phone.trim() || null,
      city: data.city || null,
    },
  });

  // Session cookie'deki ismi güncelle
  const newToken = await createToken({ ...session, name });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, newToken, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 });

  revalidatePath("/organizer");
  revalidatePath("/captain");
  revalidatePath("/organizer/settings");
  return { ok: true };
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Oturum bulunamadı." };

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return { ok: false, error: "Kullanıcı bulunamadı." };

  const match = await bcrypt.compare(data.currentPassword, user.password);
  if (!match) return { ok: false, error: "Mevcut şifre hatalı." };

  if (data.newPassword.length < 6) {
    return { ok: false, error: "Yeni şifre en az 6 karakter olmalıdır." };
  }

  const hashed = await hashPassword(data.newPassword);
  await prisma.user.update({
    where: { id: session.userId },
    data: { password: hashed },
  });

  return { ok: true };
}
