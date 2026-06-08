import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "asistgol-secret-key-change-in-production"
);

const PUBLIC = ["/login", "/register", "/forgot-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const token = request.cookies.get("ag_session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const role = payload.role as string;

    // Rol tabanlı yetki kontrolü
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (pathname.startsWith("/organizer") && role !== "ORGANIZER" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (pathname.startsWith("/captain") && role !== "CAPTAIN" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.*\\.svg).*)"],
};
