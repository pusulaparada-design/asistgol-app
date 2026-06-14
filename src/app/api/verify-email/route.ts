import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://www.asistgol.com";

  if (!token) {
    return NextResponse.redirect(`${base}/login?verified=invalid`);
  }

  const user = await prisma.user.findUnique({ where: { emailVerifyToken: token } });

  if (!user) {
    return NextResponse.redirect(`${base}/login?verified=invalid`);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, emailVerifyToken: null },
  });

  return NextResponse.redirect(`${base}/login?verified=1`);
}
