import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("fbi_scores")
    .select("student_name, best_level, best_score, best_correct, best_total, updated_at")
    .order("best_level", { ascending: false })
    .order("best_score", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const ranking = (data || []).map((row) => ({
    studentName: row.student_name,
    bestLevel: row.best_level,
    bestScore: row.best_score,
    bestCorrect: row.best_correct,
    bestTotal: row.best_total,
    updatedAt: row.updated_at,
  }));

  return NextResponse.json({ ranking });
}

export async function POST(req: NextRequest) {
  let body: {
    studentName?: string;
    level?: number;
    score?: number;
    correct?: number;
    total?: number;
    contactEmail?: string;
    contactConsent?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requete invalide." }, { status: 400 });
  }

  const studentName = (body.studentName || "").trim();
  if (!studentName) {
    return NextResponse.json({ error: "Nom manquant." }, { status: 400 });
  }
  const level = Math.max(1, Math.floor(body.level || 1));
  const score = Math.max(0, Math.floor(body.score || 0));
  const correct = Math.max(0, Math.floor(body.correct || 0));
  const total = Math.max(0, Math.floor(body.total || 0));
  // Les coordonnees ne sont enregistrees que si la personne a
  // explicitement coche son accord -- jamais requises pour participer.
  const contactConsent = !!body.contactConsent;
  const contactEmail = contactConsent ? (body.contactEmail || "").trim() || null : null;

  const nameKey = studentName.toLowerCase();

  const { data: existingRows, error: fetchError } = await supabaseAdmin
    .from("fbi_scores")
    .select("id, student_name, best_level, best_score")
    .ilike("student_name", studentName);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  const existing = (existingRows || []).find(
    (r) => r.student_name.trim().toLowerCase() === nameKey
  );

  // On ne garde que le meilleur essai (le plus haut niveau atteint, puis
  // le meilleur score a niveau egal) : le classement recompense la
  // meilleure performance, pas la derniere.
  const isBetter =
    !existing || level > existing.best_level || (level === existing.best_level && score > existing.best_score);

  if (!existing) {
    const { error: insertError } = await supabaseAdmin.from("fbi_scores").insert({
      student_name: studentName,
      best_level: level,
      best_score: score,
      best_correct: correct,
      best_total: total,
    });
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  } else if (isBetter) {
    const { error: updateError } = await supabaseAdmin
      .from("fbi_scores")
      .update({
        best_level: level,
        best_score: score,
        best_correct: correct,
        best_total: total,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, saved: isBetter });
}
