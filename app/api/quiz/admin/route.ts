import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { INFINITE_QUESTIONS } from "@/lib/infiniteQuestions";
export const dynamic = "force-dynamic";

export async function GET() {
  const [{ data: settings }, { data: questions, error }] = await Promise.all([
    supabaseAdmin.from("fbi_settings").select("*").eq("id", 1).maybeSingle(),
    supabaseAdmin.from("fbi_questions").select("*").order("difficulty").order("created_at", { ascending: true }),
  ]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  let finalQuestions = questions || [];
  if (!finalQuestions.length) {
    const seed = INFINITE_QUESTIONS.map((q) => ({
      external_id: q.id,
      difficulty: q.difficulty,
      theme: q.theme,
      text: q.text,
      options: q.options,
      correct_option: q.correctOption,
      verse_reference: q.verseReference,
      explanation: q.explanation,
      points: q.difficulty === "facile" ? 10 : q.difficulty === "moyen" ? 15 : q.difficulty === "difficile" ? 20 : 25,
      is_active: true,
    }));
    const seeded = await supabaseAdmin.from("fbi_questions").upsert(seed, { onConflict: "external_id" }).select("*");
    if (!seeded.error && seeded.data) finalQuestions = seeded.data;
  }
  return NextResponse.json({ settings, questions: finalQuestions });
}

function cleanQuestion(q: any) {
  const options = Array.isArray(q.options) ? q.options.map((v: any) => String(v).trim()).filter(Boolean) : [];
  const correctOption = Number(q.correctOption ?? q.correct_option);
  if (!q.text?.trim() || options.length < 2 || !Number.isInteger(correctOption) || correctOption < 0 || correctOption >= options.length) return null;
  const difficulty = ["facile", "moyen", "difficile", "expert"].includes(q.difficulty) ? q.difficulty : "facile";
  return { external_id: q.external_id || q.id || null, difficulty, theme: String(q.theme || "Bible"), text: String(q.text).trim(), options, correct_option: correctOption, verse_reference: String(q.verseReference ?? q.verse_reference ?? ""), explanation: String(q.explanation || ""), points: Math.max(1, Number(q.points) || 10), is_active: q.is_active !== false };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const incoming = Array.isArray(body) ? body : body.questions;
  if (!Array.isArray(incoming) || !incoming.length) return NextResponse.json({ error: "Envoie un tableau JSON de questions." }, { status: 400 });
  const rows = incoming.map(cleanQuestion);
  if (rows.some((q: any) => !q)) return NextResponse.json({ error: "Chaque question doit avoir un texte, au moins 2 options et une bonne réponse valide." }, { status: 400 });
  const { error } = await supabaseAdmin.from("fbi_questions").upsert(rows, { onConflict: "external_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, imported: rows.length });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const id = String(body.id || "");
  if (!id) return NextResponse.json({ error: "Identifiant manquant." }, { status: 400 });
  const row = cleanQuestion(body);
  if (!row) return NextResponse.json({ error: "Question invalide." }, { status: 400 });
  delete (row as any).external_id;
  const { error } = await supabaseAdmin.from("fbi_questions").update(row).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Identifiant manquant." }, { status: 400 });
  const { error } = await supabaseAdmin.from("fbi_questions").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
