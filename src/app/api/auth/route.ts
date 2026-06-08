import { NextResponse } from "next/server";
import { login, createToken, roleRedirect, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Kullanıcı adı ve şifre gereklidir." }, { status: 400 });
    }

    const result = await login(username.trim().toLowerCase(), password);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    const token = await createToken(result.payload);
    const redirect = roleRedirect(result.payload.role);

    const response = NextResponse.json({ ok: true, redirect });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 gün
      path: "/",
    });
    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
