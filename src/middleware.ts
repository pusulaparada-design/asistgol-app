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
    const home = role === "ADMIN" ? "/admin" : role === "ORGANIZER" ? "/organizer" : "/captain";

    // Sıkı rol tabanlı yetki kontrolü — kimse kimsenin alanına giremez.
    // Rol kendi prefix'i dışına çıkarsa kendi paneline geri yönlendirilir.
    const areas: Record<string, string> = { ADMIN: "/admin", ORGANIZER: "/organizer", CAPTAIN: "/captain" };
    for (const [r, prefix] of Object.entries(areas)) {
      if (pathname.startsWith(prefix) && role !== r) {
        return NextResponse.redirect(new URL(home, request.url));
      }
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.*\\.svg).*)"],
};
