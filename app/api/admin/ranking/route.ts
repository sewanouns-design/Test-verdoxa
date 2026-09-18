import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("fbi_scores")
    .select("id, student_name, best_level, best_score, best_correct, best_total, created_at, updated_at")
    .order("best_level", { ascending: false })
    .order("best_score", { ascending: false })
    .order("best_correct", { ascending: false })
    .order("updated_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    ranking: (data || []).map((row, index) => ({
      rank: index + 1,
      id: row.id,
      studentName: row.student_name,
      bestLevel: row.best_level,
      bestScore: row.best_score,
      bestCorrect: row.best_correct,
      bestTotal: row.best_total,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
  });
}

// Remet le classement a zero pour demarrer une nouvelle periode
// d'enregistrement des reponses (ex: nouvelle session du test de
// connaissance biblique). Definitif : tous les participants passes
// devront rejouer pour reapparaitre au classement. Incremente aussi
// la version de reinitialisation du TEST CONNAISSANCE BIBLIQUE, pour
// qu'aucun participant ne se voie proposer de "reprendre" une partie
// anterieure a cette remise a zero.
export async function DELETE() {
  const { error } = await supabaseAdmin
    .from("fbi_scores")
    .delete()
    .not("id", "is", null); // condition toujours vraie : supprime toutes les lignes

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: current } = await supabaseAdmin
    .from("fbi_settings")
    .select("reset_version")
    .eq("id", 1)
    .maybeSingle();
  await supabaseAdmin
    .from("fbi_settings")
    .update({ reset_version: (current?.reset_version || 1) + 1 })
    .eq("id", 1);

  return NextResponse.json({ ok: true });
}
