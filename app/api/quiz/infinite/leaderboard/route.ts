import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabaseAdmin.from("fbi_scores")
    .select("student_name, best_level, best_score, best_correct, best_total, updated_at")
    .order("best_level", { ascending: false }).order("best_score", { ascending: false }).order("best_correct", { ascending: false }).order("updated_at", { ascending: true }).limit(20);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ranking: (data || []).map((row) => ({ studentName: row.student_name, bestLevel: row.best_level, bestScore: row.best_score, bestCorrect: row.best_correct, bestTotal: row.best_total, updatedAt: row.updated_at })) });
}

function normalizeName(value: unknown) { return String(value || "").trim().replace(/\s+/g, " "); }
function validEmail(value: string) { return !value || value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const sessionId = String(body.sessionId || "");
  if (!sessionId) return NextResponse.json({ error: "Session de jeu manquante." }, { status: 400 });

  const { data: session } = await supabaseAdmin.from("fbi_quiz_sessions").select("id, student_name, student_key, reset_version, current_level, score, correct_count, total_answered, status, expires_at").eq("id", sessionId).maybeSingle();
  if (!session) return NextResponse.json({ error: "Session introuvable." }, { status: 404 });
  if (session.status !== "active" || new Date(session.expires_at).getTime() < Date.now()) return NextResponse.json({ error: "Session expirée." }, { status: 409 });

  const { data: settings } = await supabaseAdmin.from("fbi_settings").select("reset_version").eq("id", 1).maybeSingle();
  if (Number(session.reset_version) !== Number(settings?.reset_version || 1)) return NextResponse.json({ error: "Cette session appartient à une ancienne période." }, { status: 409 });

  const contactConsent = body.contactConsent === true;
  const contactEmail = contactConsent ? String(body.contactEmail || "").trim() : "";
  const whatsapp = contactConsent ? String(body.whatsapp || "").trim() : "";
  if (contactEmail && !validEmail(contactEmail)) return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
  if (contactEmail.length > 254 || whatsapp.length > 40) return NextResponse.json({ error: "Coordonnées invalides." }, { status: 400 });

  const level = Math.max(1, Number(session.current_level) || 1);
  const score = Math.max(0, Number(session.score) || 0);
  const correct = Math.max(0, Number(session.correct_count) || 0);
  const total = Math.max(0, Number(session.total_answered) || 0);
  const nameKey = String(session.student_key);

  const { data: existingRows, error: fetchError } = await supabaseAdmin.from("fbi_scores").select("id, student_name, best_level, best_score").eq("student_name", session.student_name);
  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });
  let existing = (existingRows || []).find((r) => String(r.student_name).trim().replace(/\s+/g, " ").toLocaleLowerCase().normalize("NFKC") === nameKey);
  if (!existing) {
    const { data: inserted, error } = await supabaseAdmin.from("fbi_scores").insert({ student_name: session.student_name, best_level: level, best_score: score, best_correct: correct, best_total: total, contact_email: contactEmail || null, whatsapp: whatsapp || null, contact_consent: contactConsent }).select("id").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    existing = inserted;
  } else {
    const better = level > existing.best_level || (level === existing.best_level && score > existing.best_score);
    if (better || contactConsent) {
      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (better) Object.assign(patch, { best_level: level, best_score: score, best_correct: correct, best_total: total });
      if (contactConsent) Object.assign(patch, { contact_email: contactEmail || null, whatsapp: whatsapp || null, contact_consent: true });
      const { error } = await supabaseAdmin.from("fbi_scores").update(patch).eq("id", existing.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  return NextResponse.json({ ok: true, saved: true, level, score, correct, total });
}
