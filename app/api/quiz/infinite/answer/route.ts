import { NextRequest, NextResponse } from "next/server";
import { INFINITE_QUESTIONS } from "@/lib/infiniteQuestions";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { questionId?: string; selectedOption?: number; selectedText?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requete invalide." }, { status: 400 });
  }

  const { data: dbQuestion } = await supabaseAdmin
    .from("fbi_questions")
    .select("id, correct_option, verse_reference, explanation, points")
    .eq("id", body.questionId)
    .eq("is_active", true)
    .maybeSingle();
  const legacy = INFINITE_QUESTIONS.find((q) => q.id === body.questionId);
  const question = dbQuestion || legacy;
  if (!question) {
    return NextResponse.json({ error: "Question introuvable." }, { status: 404 });
  }

  const correctOption = dbQuestion ? dbQuestion.correct_option : legacy!.correctOption;
  const correctText = dbQuestion
    ? String((await supabaseAdmin.from("fbi_questions").select("options").eq("id", body.questionId).maybeSingle()).data?.options?.[correctOption] || "")
    : legacy!.options[correctOption];
  const correct = body.selectedText !== undefined
    ? body.selectedText === correctText
    : body.selectedOption === correctOption;

  return NextResponse.json({
    correct,
    correctOption,
    correctText,
    verseReference: dbQuestion ? dbQuestion.verse_reference : legacy!.verseReference,
    explanation: dbQuestion ? dbQuestion.explanation : legacy!.explanation,
    points: dbQuestion ? dbQuestion.points : 0,
  });
}
