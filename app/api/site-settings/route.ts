import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/authToken";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
  if (!(await verifyAdminToken(token)) ) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const allowed = ["hero_support", "intro_title", "intro_text", "challenge_title", "challenge_text", "signoff"];
  const patch: Record<string, unknown> = {};
  for (const key of allowed) if (body[key] !== undefined) patch[key] = String(body[key]).trim().slice(0, 2000);
  if (!Object.keys(patch).length) return NextResponse.json({ error: "Aucun contenu à enregistrer." }, { status: 400 });
  const { error } = await supabaseAdmin.from("settings").update(patch).eq("id", 1);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
