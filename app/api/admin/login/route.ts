import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, hashPassword } from "@/lib/authToken";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "Mot de passe incorrect." },
      { status: 401 }
    );
  }

  const token = await hashPassword(password);
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
