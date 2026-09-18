import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/authToken";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabaseAdmin.from("fbi_settings").select("*").eq("id", 1).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}

export async function PUT(req: NextRequest) {
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
  if (!(await verifyAdminToken(token)) ) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const quizAllowed = ["title","subtitle","intro_text","is_active","questions_per_level","easy_seconds","medium_seconds","hard_seconds","expert_seconds","easy_points","medium_points","hard_points","expert_points"];
  const patch: Record<string, unknown> = {};
  for (const key of quizAllowed) if (body[key] !== undefined) patch[key] = body[key];
  for (const key of ["questions_per_level","easy_seconds","medium_seconds","hard_seconds","expert_seconds","easy_points","medium_points","hard_points","expert_points"]) {
    if (patch[key] !== undefined) patch[key] = Math.min(10000, Math.max(1, Math.floor(Number(patch[key]) || 1)));
  }
  if (patch.title !== undefined) patch.title = String(patch.title).trim().slice(0, 160);
  if (patch.subtitle !== undefined) patch.subtitle = String(patch.subtitle).trim().slice(0, 500);
  if (patch.intro_text !== undefined) patch.intro_text = String(patch.intro_text).trim().slice(0, 2000);
  patch.updated_at = new Date().toISOString();
  const { error } = await supabaseAdmin.from("fbi_settings").update(patch).eq("id", 1);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
