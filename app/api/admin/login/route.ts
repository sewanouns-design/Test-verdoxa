import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, createAdminToken } from "@/lib/authToken";

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({}));
  const configured = process.env.ADMIN_PASSWORD || "";
  if (!password || !configured || password !== configured) return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });

  const token = await createAdminToken();
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
