import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, hashPassword } from "@/lib/authToken";

// Protege l'espace admin (gestion des questions, reglages, classement) :
// tableau de bord + toutes les routes API d'administration.
export const config = {
  matcher: ["/admin/dashboard/:path*", "/api/admin/:path*", "/api/quiz/admin/:path*"],
};

const OPEN_ROUTES = ["/api/admin/login"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (OPEN_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  const cookieValue = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const expected = await hashPassword(process.env.ADMIN_PASSWORD || "");
  if (!cookieValue || cookieValue !== expected) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Non autorise." }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}
